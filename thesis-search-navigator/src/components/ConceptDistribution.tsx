
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ConceptDistributionProps {
  chapters: any[];
}

// Function to generate distribution data
const generateDistributionData = (chapters: any[]) => {
  if (!chapters || chapters.length === 0) return [];
  
  const colors = ["#9b87f5", "#7E69AB", "#6E59A5", "#D6BCFA", "#8B5CF6", "#D946EF"];
  
  return chapters.map((chapter, index) => {
    const name = typeof chapter === 'string' ? chapter : chapter.name;
    // Generate a random count between 5 and 30
    const conceptCount = Math.floor(Math.random() * 25) + 5;
    
    return {
      chapter: name,
      conceptCount,
      color: colors[index % colors.length]
    };
  });
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const ConceptDistribution: React.FC<ConceptDistributionProps> = ({ chapters }) => {
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chapters && chapters.length > 0) {
      const data = generateDistributionData(chapters);
      setDistributionData(data);
      setLoading(false);
    }
  }, [chapters]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Concept Distribution By Chapter</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p>Loading distribution data...</p>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="conceptCount"
                    nameKey="chapter"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      return [`${value} unique concepts`, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Concept Density Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[100px] flex items-center justify-center">
              <p>Loading density analysis...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {distributionData.map((chapter) => (
                <div key={chapter.chapter} className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">{chapter.chapter}</h3>
                    <span className="text-sm text-muted-foreground">{chapter.conceptCount} concepts</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded overflow-hidden">
                    <div 
                      className="h-full rounded" 
                      style={{ 
                        width: `${(chapter.conceptCount / 30) * 100}%`,
                        backgroundColor: chapter.color 
                      }} 
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {chapter.conceptCount > 25 ? (
                      "High concept density - consider reviewing for redundancy"
                    ) : chapter.conceptCount > 15 ? (
                      "Moderate concept density - good distribution"
                    ) : (
                      "Low concept density - may need more theoretical grounding"
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConceptDistribution;
