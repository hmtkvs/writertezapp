
import React from 'react';
import SearchBar from './SearchBar';
import RecentQueries from './RecentQueries';

interface SearchSectionProps {
  recentQueries: string[];
  onSearch: (query: string) => void;
  isSearching: boolean;
  onClearQueries: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ 
  recentQueries, 
  onSearch, 
  isSearching, 
  onClearQueries 
}) => {
  return (
    <div className="my-6">
      <RecentQueries 
        queries={recentQueries} 
        onSelectQuery={onSearch}
        onClearQueries={onClearQueries}
      />
      <SearchBar onSearch={onSearch} isSearching={isSearching} />
    </div>
  );
};

export default SearchSection;
