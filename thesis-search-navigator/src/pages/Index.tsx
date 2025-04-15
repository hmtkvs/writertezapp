import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchSection from '@/components/SearchSection';
import DocumentStats from '@/components/DocumentStats';
import MainContent from '@/components/MainContent';
import { searchThesis, getChapters, getDocumentStats } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  // State for API settings
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [resultCount, setResultCount] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.5);
  
  // State for API data
  const [searchResults, setSearchResults] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [stats, setStats] = useState({
    documentCount: 0,
    chapterCount: 0,
    sectionCount: 0,
    searchCount: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Loading states
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Recent queries
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  
  // Toast for notifications
  const { toast } = useToast();

  // Add state to track if initial search has been made
  const [hasSearched, setHasSearched] = useState(false);
  
  // Load chapters and stats on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const chaptersData = await getChapters();
        setChapters(chaptersData);
        setIsLoadingChapters(false);
        
        const statsData = await getDocumentStats();
        setStats(statsData);
        setIsLoadingStats(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: "Connection Error",
          description: "Could not connect to the thesis parser backend",
          variant: "destructive"
        });
      }
    };
    
    loadInitialData();
    
    // Load recent queries from localStorage
    const savedQueries = localStorage.getItem('recentQueries');
    if (savedQueries) {
      setRecentQueries(JSON.parse(savedQueries));
    }
  }, []);
  
  // Trigger search when selectedChapters change
  useEffect(() => {
    // Only trigger if there's an active search query and initial search was made
    if (searchQuery && searchQuery.trim() !== '' && hasSearched) {
      handleSearch(searchQuery);
    }
  }, [selectedChapters, resultCount, similarityThreshold]);
  
  // Handle search submission
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setCurrentPage(1); // Reset pagination on new search
    setSearchResults([]); // Clear previous results
    setHasSearched(true); // Mark that a search has been made
    
    // Add to recent queries
    if (!recentQueries.includes(query)) {
      const updatedQueries = [query, ...recentQueries.slice(0, 4)];
      setRecentQueries(updatedQueries);
      localStorage.setItem('recentQueries', JSON.stringify(updatedQueries));
    }
    
    try {
      // Join multiple chapters with comma if any are selected, otherwise empty string
      const chapterFilter = selectedChapters.length > 0 ? selectedChapters.join(',') : '';
      
      const response = await searchThesis(
        query,
        chapterFilter,
        resultCount,
        similarityThreshold,
        1 // Start with page 1
      );
      
      setSearchResults(response.results);
      setTotalPages(response.total_pages);
      setHasMore(response.has_more);
      setCurrentPage(response.current_page);
      
      // Update stats after search
      const updatedStats = await getDocumentStats();
      setStats(updatedStats);
      
      toast({
        title: `Found ${response.total_results} results`,
        description: response.results.length > 0 
          ? `Top match has ${(response.results[0].score * 100).toFixed(0)}% relevance` 
          : "Try adjusting your search terms or filters",
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle loading more results
  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !hasSearched) return;
    
    setIsLoadingMore(true);
    try {
      const chapterFilter = selectedChapters.length > 0 ? selectedChapters.join(',') : '';
      
      const response = await searchThesis(
        searchQuery,
        chapterFilter,
        resultCount,
        similarityThreshold,
        currentPage + 1
      );
      
      setSearchResults(prev => [...prev, ...response.results]);
      setTotalPages(response.total_pages);
      setHasMore(response.has_more);
      setCurrentPage(response.current_page);
    } catch (error) {
      console.error('Error loading more results:', error);
      toast({
        title: "Error",
        description: "Failed to load more results",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  // Clear recent queries
  const handleClearQueries = () => {
    setRecentQueries([]);
    localStorage.removeItem('recentQueries');
    toast({
      title: "Search History Cleared",
      description: "Your recent searches have been cleared"
    });
  };
  
  // Handle API URL change
  const handleApiUrlChange = (url: string) => {
    setApiUrl(url);
    toast({
      title: "API Settings Updated",
      description: `Connecting to: ${url}`
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header apiUrl={apiUrl} onApiUrlChange={handleApiUrlChange} />
      
      <main className="container mx-auto p-4 md:p-6">
        <DocumentStats stats={stats} />
        
        <SearchSection 
          recentQueries={recentQueries}
          onSearch={handleSearch}
          isSearching={isSearching}
          onClearQueries={handleClearQueries}
        />
        
        <MainContent 
          chapters={chapters}
          selectedChapters={selectedChapters}
          onSelectChapters={setSelectedChapters}
          resultCount={resultCount}
          onResultCountChange={setResultCount}
          similarityThreshold={similarityThreshold}
          onSimilarityThresholdChange={setSimilarityThreshold}
          searchResults={hasSearched ? searchResults : []}
          isSearching={isSearching || isLoadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          currentPage={currentPage}
          totalPages={totalPages}
          apiUrl={apiUrl}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
