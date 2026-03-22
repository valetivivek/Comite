import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Series } from '../types';

interface CarouselProps {
  series: Series[];
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    };
  },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const Carousel = ({ series }: CarouselProps) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const [showArrows, setShowArrows] = useState(false);

  // We only have a few series, wrap the index
  const currentIndex = ((page % series.length) + series.length) % series.length;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused || series.length <= 1) return;

    const interval = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, series.length, page]);

  const goToSlide = (index: number) => {
    const direction = index > currentIndex ? 1 : -1;
    setPage([index, direction]);
  };

  if (series.length === 0) {
    return (
      <div className="h-full bg-gradient-to-r from-manga-accent to-manga-accent-secondary flex items-center justify-center rounded-2xl">
        <p className="text-manga-on-accent text-xl font-medium tracking-tight">No series available</p>
      </div>
    );
  }

  return (
    <div 
      className="relative h-full w-full overflow-hidden rounded-2xl group"
      onMouseEnter={() => {
        setIsPaused(true);
        setShowArrows(true);
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        setShowArrows(false);
      }}
      onFocus={() => setShowArrows(true)}
      onBlur={() => setShowArrows(false)}
      onTouchStart={() => setShowArrows(true)}
      tabIndex={0}
    >
      {/* Carousel Slides */}
      <div className="relative h-full w-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Link to={`/series/${series[currentIndex].id}`} className="block h-full will-change-transform">
              <div className="relative h-full bg-manga-card overflow-hidden">
                {/* Background Image with parallax feeling transition */}
                <motion.div 
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.25] mix-blend-luminosity"
                  style={{ backgroundImage: `url(${series[currentIndex].bannerImage || series[currentIndex].coverImage})` }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-manga-overlay-strong via-manga-bg/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-manga-bg via-manga-bg/60 to-transparent" />
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-end pb-12 sm:pb-16 pt-8">
                  <div className="container mx-auto px-6 lg:px-10">
                    <div className="max-w-2xl">
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="flex items-center gap-4 mb-3 flex-wrap"
                      >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-md">
                          {series[currentIndex].title}
                        </h2>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
                          <span className="text-manga-warning text-lg md:text-xl" aria-hidden="true">&#9733;</span>
                          <span className="text-white text-sm md:text-base font-medium pr-1">
                            {series[currentIndex].rating}
                          </span>
                        </div>
                      </motion.div>
                      
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                        className="text-base md:text-lg text-white/80 mb-5 font-medium"
                      >
                        by {series[currentIndex].author}
                      </motion.p>
                      
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                        className="flex flex-wrap gap-2 mb-6"
                      >
                        {series[currentIndex].tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white backdrop-blur-md shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                        {series[currentIndex].tags.length > 3 && (
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white/70 backdrop-blur-md">
                            +{series[currentIndex].tags.length - 3} more
                          </span>
                        )}
                      </motion.div>
                      
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                        className="flex items-center gap-4 text-sm font-medium"
                      >
                        <span className="text-white/60">
                          {series[currentIndex].totalChapters} chapters
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        <span className="text-white/60 capitalize">
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
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: showArrows ? 1 : 0, x: showArrows ? 0 : -10 }}
            transition={{ duration: 0.2 }}
            onClick={() => paginate(-1)}
            className="hidden md:flex absolute left-4 top-1/2 min-h-[48px] min-w-[48px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:scale-105 z-10 shadow-xl"
            aria-label="Previous slide"
            type="button"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: showArrows ? 1 : 0, x: showArrows ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => paginate(1)}
            className="hidden md:flex absolute right-4 top-1/2 min-h-[48px] min-w-[48px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:scale-105 z-10 shadow-xl"
            aria-label="Next slide"
            type="button"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </motion.button>
        </>
      )}

      {/* Pagination Dots */}
      {series.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2.5 z-10">
          {series.map((_, index) => {
             const isActive = index === currentIndex;
             return (
               <button
                 key={index}
                 onClick={() => goToSlide(index)}
                 className="relative group p-1"
                 aria-label={`Go to slide ${index + 1}`}
                 type="button"
               >
                 <motion.div 
                   animate={{ 
                     width: isActive ? 24 : 8,
                     backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)'
                   }}
                   className="h-2 rounded-full shadow-sm"
                   transition={{ duration: 0.3 }}
                 />
                 {/* Invisible larger hit area for accessibility */}
                 <div className="absolute inset-0 rounded-full" />
               </button>
             );
          })}
        </div>
      )}
    </div>
  );
};

export default Carousel;
