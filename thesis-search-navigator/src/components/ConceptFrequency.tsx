
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { searchThesis } from '@/lib/api';

interface ConceptFrequencyProps {
  chapters: any[];
}

// Function to extract concepts from search results
const extractConcepts = (searchResults: any[], chapters: any[]) => {
  // This is a simplified implementation - in a real app, you'd have more sophisticated concept extraction
  const concepts = new Map();
  
  // Common concepts that we'll search for
  const conceptList = [
    "Vector Database", "Semantic Search", "Embeddings", "Large Language Models",
    "Knowledge Graphs", "Information Retrieval", "Text Similarity"
  ];
  
  // For each concept, do a search and count occurrences
  conceptList.forEach(concept => {
    // Get chapter list for tracking where concepts appear
    const chapterList = chapters.map(c => c.name || c);
    const randomChapters = [];
    
    // Simulate concept distribution across chapters
    // In a real implementation, this would be determined by actual search results
    const randomChapterCount = Math.floor(Math.random() * 3) + 1; // 1-3 chapters
    for (let i = 0; i < randomChapterCount && i < chapterList.length; i++) {
      const randomIndex = Math.floor(Math.random() * chapterList.length);
      if (!randomChapters.includes(chapterList[randomIndex])) {
        randomChapters.push(chapterList[randomIndex]);
      }
    }
    
    // Add the concept with a random frequency (would be real data in production)
    concepts.set(concept, {
      concept,
      frequency: Math.floor(Math.random() * 24) + 5, // Random frequency between 5-28
      chapters: randomChapters
    });
  });
  
  return Array.from(concepts.values());
};

// Generate a color based on frequency (higher frequency = more intense color)
const getBarColor = (frequency: number, maxFrequency: number) => {
  const normalized = frequency / maxFrequency;
  // From light purple to dark purple based on frequency
  return `rgba(155, 135, 245, ${0.3 + normalized * 0.7})`;
};

const ConceptFrequency: React.FC<ConceptFrequencyProps> = ({ chapters }) => {
  const [conceptData, setConceptData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only process if we have chapters
    if (chapters && chapters.length > 0) {
      // Extract concepts from chapter data
      const concepts = extractConcepts([], chapters);
      setConceptData(concepts);
      setLoading(false);
    }
  }, [chapters]);

  // Find max frequency for color scaling
  const maxFrequency = Math.max(...(conceptData.map(item => item.frequency) || [0]));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Concept Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p>Loading concept data...</p>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={conceptData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <XAxis 
                    dataKey="concept" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      return [`${value} occurrences`, "Frequency"];
                    }}
                    labelFormatter={(label) => `Concept: ${label}`}
                  />
                  <Bar dataKey="frequency" name="Frequency">
                    {conceptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.frequency, maxFrequency)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Concept Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[100px] flex items-center justify-center">
              <p>Loading concept details...</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Concept</th>
                    <th className="text-left py-3">Frequency</th>
                    <th className="text-left py-3">Chapters</th>
                    <th className="text-left py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {conceptData.map((item) => (
                    <tr key={item.concept} className="border-b hover:bg-slate-50">
                      <td className="py-3">{item.concept}</td>
                      <td className="py-3">{item.frequency}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.chapters.map((chapter: string) => (
                            <span key={chapter} className="px-2 py-1 bg-slate-100 text-xs rounded-full">
                              {chapter}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        {item.frequency > 20 ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            High repetition
                          </span>
                        ) : item.frequency > 15 ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Moderate
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Good
                          </span>
                        )}
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

export default ConceptFrequency;
