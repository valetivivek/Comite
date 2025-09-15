import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataService } from '../services/dataService';
import { Series } from '../types';
import ListItem from '../components/ListItem';
import SkeletonLoader from '../components/SkeletonLoader';
import { JsonLd } from '../components/JsonLd';

const PopularPage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load popular series data
  useEffect(() => {
    const loadPopularSeries = async () => {
      try {
        setIsLoading(true);
        const popularSeries = await dataService.getPopularSeries();
        setSeries(popularSeries);
      } catch (error) {
        console.error('Error loading popular series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPopularSeries();
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
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Popular Comics - Comite",
    "description": "Most popular comics based on reading time and user engagement",
    "url": "https://comitecomic.vercel.app/popular"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-manga-bg">
        <JsonLd data={jsonLd} />
        {/* Header Skeleton */}
        <section className="section-spacing">
          <div className="container-spacing">
            <div className="text-center mb-12">
              <SkeletonLoader type="text" className="h-8 w-48 mx-auto mb-4" />
              <SkeletonLoader type="text" className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
      
      {/* Header Section */}
      <section className="section-spacing">
        <div className="container-spacing">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-manga-text mb-4">
              Popular Comics
            </h1>
            <p className="text-lg text-manga-muted max-w-2xl mx-auto">
              Discover the most read and loved comics based on community reading time and engagement
            </p>
          </div>

          {/* Series Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            {paginatedSeries.map((series) => (
              <motion.div
                key={series.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ListItem series={series} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-manga-text bg-manga-surface border border-manga-border rounded-lg hover:bg-manga-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-manga-accent text-white'
                          : 'text-manga-text bg-manga-surface border border-manga-border hover:bg-manga-border'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-manga-text bg-manga-surface border border-manga-border rounded-lg hover:bg-manga-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

           {/* Results count */}
           <div className="text-center mt-8">
             {series.length > 0 ? (
               <p className="text-sm text-manga-muted">
                 Showing {startIndex + 1}-{Math.min(endIndex, series.length)} of {series.length} popular comics
               </p>
             ) : (
               <div className="text-center py-12">
                 <h3 className="text-xl font-semibold text-manga-text mb-2">No Popular Comics Yet</h3>
                 <p className="text-manga-muted mb-6">
                   Start reading comics to see the most popular ones based on community engagement!
                 </p>
                 <a 
                   href="/" 
                   className="inline-flex items-center px-4 py-2 bg-manga-accent text-white rounded-lg hover:brightness-95 transition-colors"
                 >
                   Browse All Comics
                 </a>
               </div>
             )}
           </div>
        </div>
      </section>
    </div>
  );
};

export default PopularPage;
