import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/dataService';
import { Series } from '../types';
import ListItem from '../components/ListItem';
import Carousel from '../components/Carousel';
import CommentSection from '../components/CommentSection';

const DashboardPage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load series data
  useEffect(() => {
    const loadSeries = async () => {
      try {
        setIsLoading(true);
        const data = await dataService.getSeries();
        setSeries(data);
      } catch (error) {
        console.error('Error loading series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeries();
  }, []);

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(series.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSeries = series.slice(startIndex, endIndex);

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
      {/* Hero Carousel */}
      <section className="relative h-64 md:h-80 lg:h-96">
        <Carousel series={topSeries} />
      </section>

      {/* Series Grid - Responsive */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            layout
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
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
                  <ListItem series={series} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {paginatedSeries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-manga-muted text-lg">No series found</p>
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

      {/* Global Comments Section */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <CommentSection 
            contextId="global" 
            contextType="global" 
            title="Community Discussion"
          />
        </div>
      </section>

    </div>
  );
};

export default DashboardPage;
