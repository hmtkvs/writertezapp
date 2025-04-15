import React from 'react';
import FilterControls from './FilterControls';
import ChaptersList from './ChaptersList';
import SearchResults from './SearchResults';
import { SearchResult } from '@/lib/types';

interface MainContentProps {
  chapters: string[];
  selectedChapters: string[];
  onSelectChapters: (chapters: string[]) => void;
  resultCount: number;
  onResultCountChange: (count: number) => void;
  similarityThreshold: number;
  onSimilarityThresholdChange: (threshold: number) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  currentPage: number;
  totalPages: number;
  apiUrl: string;
}

const MainContent: React.FC<MainContentProps> = ({
  chapters,
  selectedChapters,
  onSelectChapters,
  resultCount,
  onResultCountChange,
  similarityThreshold,
  onSimilarityThresholdChange,
  searchResults,
  isSearching,
  hasMore,
  onLoadMore,
  currentPage,
  totalPages,
  apiUrl
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-64">
        <ChaptersList
          chapters={chapters}
          selectedChapters={selectedChapters}
          onSelectChapters={onSelectChapters}
          searchResults={searchResults}
        />
        <div className="mt-4">
          <FilterControls
            resultCount={resultCount}
            onResultCountChange={onResultCountChange}
            similarityThreshold={similarityThreshold}
            onSimilarityThresholdChange={onSimilarityThresholdChange}
          />
        </div>
      </div>
      <div className="flex-1">
        <SearchResults
          results={searchResults}
          isLoading={isSearching}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default MainContent;
