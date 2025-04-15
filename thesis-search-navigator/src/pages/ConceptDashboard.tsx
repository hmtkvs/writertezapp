
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConceptFrequency from '@/components/ConceptFrequency';
import ConceptDistribution from '@/components/ConceptDistribution';
import CrossReferenceLinker from '@/components/CrossReferenceLinker';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getChapters } from '@/lib/api';

const ConceptDashboard = () => {
  const [chapters, setChapters] = useState<any[]>([]);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chapterData = await getChapters();
        setChapters(chapterData);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    };

    fetchChapters();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#2C3E50] text-white p-4 md:p-6">
        <div className="container mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Concept Tracking Dashboard</h1>
              <p className="text-slate-300 text-sm md:text-base">Track concepts across your thesis to ensure consistency</p>
            </div>
            <Link to="/">
              <Button 
                variant="outline" 
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all rounded-md"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        <Tabs defaultValue="frequency" className="w-full">
          <TabsList className="mb-4 backdrop-blur-md bg-slate-200/50 border border-slate-300/50 p-1 rounded-md">
            <TabsTrigger 
              value="frequency" 
              className="data-[state=active]:backdrop-blur-md data-[state=active]:bg-white/80 data-[state=active]:shadow-sm rounded-md"
            >
              Concept Frequency
            </TabsTrigger>
            <TabsTrigger 
              value="distribution" 
              className="data-[state=active]:backdrop-blur-md data-[state=active]:bg-white/80 data-[state=active]:shadow-sm rounded-md"
            >
              Concept Distribution
            </TabsTrigger>
            <TabsTrigger 
              value="cross-reference" 
              className="data-[state=active]:backdrop-blur-md data-[state=active]:bg-white/80 data-[state=active]:shadow-sm rounded-md"
            >
              Cross-References
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="frequency" className="min-h-[400px]">
            <ConceptFrequency chapters={chapters} />
          </TabsContent>
          
          <TabsContent value="distribution" className="min-h-[400px]">
            <ConceptDistribution chapters={chapters} />
          </TabsContent>
          
          <TabsContent value="cross-reference" className="min-h-[400px]">
            <CrossReferenceLinker chapters={chapters} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ConceptDashboard;
