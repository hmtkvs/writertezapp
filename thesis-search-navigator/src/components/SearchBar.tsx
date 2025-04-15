
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isSearching }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-2">
      <div className="relative flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your thesis content..."
          className="pl-10 w-full"
          disabled={isSearching}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>
      <Button 
        type="submit" 
        disabled={isSearching || !query.trim()}
        className="bg-teal-600 hover:bg-teal-700"
      >
        {isSearching ? "Searching..." : "Search"}
      </Button>
    </form>
  );
};

export default SearchBar;
