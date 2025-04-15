import React, { useEffect, useRef, useCallback } from 'react';
import SearchResult from './SearchResult';
import { ScrollArea } from './ui/scroll-area';

interface ResultMetadata {
  title: string;
  source: string;
  parent_titles: string[];
  level: number;
}

interface SearchResult {
  id: string;
  score: number;
  title: string;
  content: string;
  metadata: ResultMetadata;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  currentPage: number;
  totalPages: number;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  isLoading, 
  hasMore, 
  onLoadMore,
  currentPage,
  totalPages
}) => {
  const observer = useRef<IntersectionObserver>();
  const lastResultElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    
    if (node) {
      observer.current.observe(node);
    }
  }, [isLoading, hasMore, onLoadMore]);

  if (results.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center text-center p-8 text-muted-foreground">
        <p className="text-lg">No results to display</p>
        <p className="text-sm mt-2">Try adjusting your search query or filters</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-4 pr-4">
        {results.map((result, index) => {
          // Create a unique key using both the section ID and the result's position in the array
          const uniqueKey = `${result.id}-${index}-${currentPage}`;
          return (
            <div
              key={uniqueKey}
              ref={index === results.length - 1 ? lastResultElementRef : undefined}
              className="relative"
            >
              <SearchResult result={result} />
            </div>
          );
        })}
        
        {isLoading && (
          <div className="animate-pulse flex flex-col gap-4 w-full">
            {[1, 2].map((i) => (
              <div key={i} className="w-full h-40 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        )}
        
        {hasMore && !isLoading && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Showing {results.length} results ({currentPage} of {totalPages} pages)
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default SearchResults;
