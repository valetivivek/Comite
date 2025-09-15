import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/dataService';
import { Series } from '../types';
import ListItem from '../components/ListItem';
import Carousel from '../components/Carousel';
import CommentSection from '../components/CommentSection';
import SkeletonLoader from '../components/SkeletonLoader';
import { JsonLd } from '../components/JsonLd';

const DashboardPage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Handle responsive pagination
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerPage = window.innerWidth >= 1024 ? 12 : 10;
      setItemsPerPage(newItemsPerPage);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Pagination logic
  const totalPages = Math.ceil(series.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSeries = series.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(next);
    const params = new URLSearchParams(location.search);
    if (next === 1) {
      params.delete('page');
    } else {
      params.set('page', String(next));
    }
    navigate({ pathname: '/', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page=1 if navigation state requests it or when landing via /?page=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get('page') || '1', 10);
    if (!params.get('page') && currentPage !== 1) {
      setCurrentPage(1);
    } else if (pageParam !== currentPage) {
      setCurrentPage(Math.max(1, pageParam || 1));
    }
  }, [location.search]);



  // Get top series for carousel (highest rated) - memoized for performance
  const topSeries = useMemo(() => 
    series
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5),
    [series]
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Comite",
    "description": "Read comics with a clean, fast, mobile-first UI",
    "url": "https://comitecomic.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://comitecomic.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-manga-bg">
        <JsonLd data={jsonLd} />
        {/* Hero Carousel Skeleton */}
        <section className="relative">
          <div className="h-64 md:h-80 lg:h-96">
            <SkeletonLoader type="cover" className="w-full h-full" />
          </div>
        </section>

        {/* Series Grid Skeleton */}
        <section className="section-spacing">
          <div className="container-spacing">
            <div className="text-center mb-12">
              <SkeletonLoader type="text" className="h-8 w-48 mx-auto mb-4" />
              <SkeletonLoader type="text" className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLoader key={i} type="list" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-bg">
      <JsonLd data={jsonLd} />
      {/* Hero Carousel */}
      <section className="relative">
        <div className="h-64 md:h-80 lg:h-96">
          <Carousel series={topSeries} />
        </div>
      </section>


      {/* Series Grid - Responsive */}
      <section className="section-spacing">
        <div className="container-spacing">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {paginatedSeries.map((series) => (
                <motion.div
                  key={series.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeOut",
                    layout: { duration: 0.3 }
                  }}
                  className="fade-in-smooth"
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
                        ? 'bg-manga-accent text-white'
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
