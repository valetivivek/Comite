import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { Series } from '../types';

export const useNavSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Series[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const allSeries = await dataService.getSeries();
      const filtered = allSeries.filter(series => 
        series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        series.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } catch (error) {
      console.error('Error searching series:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(query);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query, debouncedSearch]);

  // Handle input change
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setShowResults(newQuery.length > 0);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  // Handle result click
  const handleResultClick = () => {
    setShowResults(false);
  };

  return {
    query,
    setQuery: handleQueryChange,
    results,
    isSearching,
    showResults,
    setShowResults,
    clearSearch,
    handleResultClick
  };
};
