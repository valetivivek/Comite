import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Series } from '../types';

interface CarouselProps {
  series: Series[];
}

const Carousel = ({ series }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance carousel with 3-4 second delay
  useEffect(() => {
    if (isPaused || series.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % series.length);
    }, 4000); // Increased from 3000ms to 4000ms (4 seconds)

    return () => clearInterval(interval);
  }, [isPaused, series.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + series.length) % series.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % series.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (series.length === 0) {
    return (
      <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
        <p className="text-white text-xl">No series available</p>
      </div>
    );
  }

  return (
    <div 
      className="relative h-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Slides */}
      <div className="relative h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Link to={`/series/${series[currentIndex].id}`}>
              <div className="relative h-full bg-gradient-to-r from-teal-600 to-teal-700">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                  style={{ backgroundImage: `url(${series[currentIndex].bannerImage || series[currentIndex].coverImage})` }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-60" />
                
                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-2xl">
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                      >
                        {series[currentIndex].title}
                      </motion.h2>
                      
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-teal-100 mb-4"
                      >
                        by {series[currentIndex].author}
                      </motion.p>
                      
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-2 mb-6"
                      >
                        {series[currentIndex].tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </motion.div>
                      
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-4"
                      >
                        <div className="flex items-center">
                          <span className="text-yellow-400 text-lg">★</span>
                          <span className="text-white ml-1 font-medium">
                            {series[currentIndex].rating}
                          </span>
                        </div>
                        <span className="text-teal-200">
                          {series[currentIndex].totalChapters} chapters
                        </span>
                        <span className="text-teal-200 capitalize">
                          {series[currentIndex].status}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {series.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 jitter-hover"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 jitter-hover"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {series.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {series.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
