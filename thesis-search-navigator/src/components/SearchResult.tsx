import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResultMetadata {
  title: string;
  source: string;
  parent_titles: string[];
  level: number;
}

interface SearchResultType {
  id: string;
  score: number;
  title: string;
  content: string;
  metadata: ResultMetadata;
}

interface SearchResultProps {
  result: SearchResultType;
}

const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  const { content, metadata, score, title } = result;
  const { parent_titles, source } = metadata;
  
  // Calculate a color based on score
  const getScoreColor = () => {
    if (score > 0.85) return "bg-green-100 text-green-800";
    if (score > 0.7) return "bg-blue-100 text-blue-800";
    if (score > 0.5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  
  return (
    <Card className="mb-4 search-result" data-chapter={parent_titles[0]}>
      <CardHeader className="pb-2 flex flex-row justify-between">
        <div>
          {parent_titles.map((title, index) => (
            <Badge key={index} variant="outline" className="mr-2">{title}</Badge>
          ))}
        </div>
        <Badge className={getScoreColor()}>{Math.round(score * 100)}% match</Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="whitespace-pre-line">{content}</p>
        <p className="text-xs text-muted-foreground mt-2">Source: {source}</p>
      </CardContent>
    </Card>
  );
};

export default SearchResult;
