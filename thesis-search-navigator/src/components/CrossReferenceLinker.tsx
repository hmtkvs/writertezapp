import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightIcon, PlusIcon, TrashIcon } from 'lucide-react';

interface CrossReferenceLinkerProps {
  chapters: any[];
}

interface CrossReference {
  id: string;
  sourceChapter: string;
  sourceConcept: string;
  targetChapter: string;
  targetConcept: string;
  status: 'pending' | 'linked' | 'conflict';
}

const CrossReferenceLinker: React.FC<CrossReferenceLinkerProps> = ({ chapters }) => {
  const [loading, setLoading] = useState(true);
  const [references, setReferences] = useState<CrossReference[]>([]);
  const [sourceChapter, setSourceChapter] = useState<string>('');
  const [sourceConcept, setSourceConcept] = useState<string>('');
  const [targetChapter, setTargetChapter] = useState<string>('');
  const [targetConcept, setTargetConcept] = useState<string>('');

  useEffect(() => {
    if (chapters && chapters.length > 0) {
      setLoading(false);
      // Initialize with some sample cross-references
      setReferences([
        {
          id: '1',
          sourceChapter: 'Introduction',
          sourceConcept: 'Vector Database',
          targetChapter: 'Methodology',
          targetConcept: 'Vector Database Implementation',
          status: 'linked'
        },
        {
          id: '2',
          sourceChapter: 'Literature Review',
          sourceConcept: 'Semantic Search',
          targetChapter: 'Results',
          targetConcept: 'Search Performance',
          status: 'pending'
        },
        {
          id: '3',
          sourceChapter: 'Methodology',
          sourceConcept: 'Embeddings',
          targetChapter: 'Discussion',
          targetConcept: 'Embedding Quality',
          status: 'conflict'
        }
      ]);
    }
  }, [chapters]);

  const handleAddReference = () => {
    if (sourceChapter && sourceConcept && targetChapter && targetConcept) {
      const newReference: CrossReference = {
        id: Date.now().toString(),
        sourceChapter,
        sourceConcept,
        targetChapter,
        targetConcept,
        status: 'pending'
      };
      
      setReferences([...references, newReference]);
      
      // Reset form
      setSourceChapter('');
      setSourceConcept('');
      setTargetChapter('');
      setTargetConcept('');
    }
  };

  const handleDeleteReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
  };

  const handleUpdateStatus = (id: string, status: 'pending' | 'linked' | 'conflict') => {
    setReferences(references.map(ref => 
      ref.id === id ? { ...ref, status } : ref
    ));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'linked':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'conflict':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Cross-Reference Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="sourceChapter">Source Chapter</Label>
              <Select value={sourceChapter} onValueChange={setSourceChapter}>
                <SelectTrigger id="sourceChapter">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter, index) => (
                    <SelectItem 
                      key={index} 
                      value={typeof chapter === 'string' ? chapter : chapter.name}
                    >
                      {typeof chapter === 'string' ? chapter : chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sourceConcept">Source Concept</Label>
              <Input 
                id="sourceConcept" 
                value={sourceConcept} 
                onChange={(e) => setSourceConcept(e.target.value)} 
                placeholder="Enter concept"
              />
            </div>
            
            <div className="flex items-end justify-center">
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetChapter">Target Chapter</Label>
              <Select value={targetChapter} onValueChange={setTargetChapter}>
                <SelectTrigger id="targetChapter">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter, index) => (
                    <SelectItem 
                      key={index} 
                      value={typeof chapter === 'string' ? chapter : chapter.name}
                    >
                      {typeof chapter === 'string' ? chapter : chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetConcept">Target Concept</Label>
              <Input 
                id="targetConcept" 
                value={targetConcept} 
                onChange={(e) => setTargetConcept(e.target.value)} 
                placeholder="Enter concept"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddReference} disabled={!sourceChapter || !sourceConcept || !targetChapter || !targetConcept}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Cross-Reference
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Cross-References</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[100px] flex items-center justify-center">
              <p>Loading cross-references...</p>
            </div>
          ) : references.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cross-references found. Add your first one above.
            </div>
          ) : (
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Source</th>
                    <th className="text-left py-3">Target</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {references.map((ref) => (
                    <tr key={ref.id} className="border-b hover:bg-slate-50">
                      <td className="py-3">
                        <div className="font-medium">{ref.sourceChapter}</div>
                        <div className="text-sm text-muted-foreground">{ref.sourceConcept}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{ref.targetChapter}</div>
                        <div className="text-sm text-muted-foreground">{ref.targetConcept}</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(ref.status)}`}>
                          {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUpdateStatus(ref.id, 'linked')}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            Link
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteReference(ref.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossReferenceLinker;
