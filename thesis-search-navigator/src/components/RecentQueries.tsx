
import React from 'react';
import { Button } from './ui/button';
import { Clock, X } from 'lucide-react';

interface RecentQueriesProps {
  queries: string[];
  onSelectQuery: (query: string) => void;
  onClearQueries: () => void;
}

const RecentQueries: React.FC<RecentQueriesProps> = ({ 
  queries, 
  onSelectQuery,
  onClearQueries 
}) => {
  if (queries.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" /> Recent Searches
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearQueries}
          className="h-6 text-xs"
        >
          <X className="h-3 w-3 mr-1" /> Clear
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {queries.map((query, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onSelectQuery(query)}
          >
            {query}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RecentQueries;
