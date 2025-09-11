import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { dataService } from '../services/dataService';
import { Series, SearchFilters, ViewMode } from '../types';
import SeriesCard from '../components/SeriesCard';
import ListItem from '../components/ListItem';
import Carousel from '../components/Carousel';
import SearchFiltersModal from '../components/SearchFiltersModal';

const HomePage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'list' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    genre: [],
    status: [],
    sortBy: 'lastUpdated',
    sortOrder: 'desc'
  });

  // Load series data
  useEffect(() => {
    const loadSeries = async () => {
      try {
        setIsLoading(true);
        const data = await dataService.getSeries();
        setSeries(data);
        setFilteredSeries(data);
      } catch (error) {
        console.error('Error loading series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeries();
  }, []);

  // Search and filter
  const handleSearch = useCallback(async () => {
    try {
      const searchFilters = { ...filters, query: searchQuery };
      const results = await dataService.searchSeries(searchFilters);
      setFilteredSeries(results);
    } catch (error) {
      console.error('Error searching series:', error);
    }
  }, [filters, searchQuery]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  const handleFilterChange = async (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    try {
      const results = await dataService.searchSeries(newFilters);
      setFilteredSeries(results);
    } catch (error) {
      console.error('Error filtering series:', error);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => ({ 
      type: prev.type === 'grid' ? 'list' : 'grid' 
    }));
    setCurrentPage(1); // Reset to first page when view mode changes
  };

  // Pagination logic
  const itemsPerPage = viewMode.type === 'list' ? 10 : 24;
  const totalPages = Math.ceil(filteredSeries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSeries = filteredSeries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get top series for carousel (highest rated)
  const topSeries = series
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-bg">
      {/* Search and Controls - Moved to top */}
      <section className="sticky top-0 z-40 bg-manga-bg/95 backdrop-blur-sm border-b border-manga-border">
        <div className="px-4 py-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-manga-muted" />
                <input
                  type="text"
                  placeholder="Search manga, manhua, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center px-4 py-3 border border-manga-border rounded-lg hover:bg-manga-surface transition-colors jitter-hover"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>

              {/* View Toggle */}
              <button
                onClick={toggleViewMode}
                className="flex items-center px-4 py-3 border border-manga-border rounded-lg hover:bg-manga-surface transition-colors jitter-hover"
              >
                {viewMode.type === 'grid' ? (
                  <ListBulletIcon className="h-5 w-5" />
                ) : (
                  <Squares2X2Icon className="h-5 w-5" />
                )}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Hero Carousel */}
      <section className="relative h-64 md:h-80 lg:h-96">
        <Carousel series={topSeries} />
      </section>

      {/* Series Grid/List */}
      <section className="px-4 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            layout
            className={
              viewMode.type === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                : 'space-y-4'
            }
          >
            <AnimatePresence mode="popLayout">
              {paginatedSeries.map((series) => (
                <motion.div
                  key={series.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {viewMode.type === 'list' ? (
                    <ListItem series={series} />
                  ) : (
                    <SeriesCard 
                      series={series} 
                      viewMode={viewMode.type}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {paginatedSeries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-manga-muted text-lg">No series found</p>
              <p className="text-manga-muted mt-2">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-manga-border hover:bg-manga-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-teal-600 text-white'
                        : 'border border-manga-border hover:bg-manga-surface'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-manga-border hover:bg-manga-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search Filters Modal */}
      <SearchFiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
      />
    </div>
  );
};

export default HomePage;
