import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { dataService } from '../services/dataService';
import { Series, User } from '../types';
import StarRating from '../components/StarRating';

const SeriesPage = () => {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    const loadSeries = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const seriesData = await dataService.getSeriesById(id);
        if (seriesData) {
          setSeries(seriesData);
        }
      } catch (error) {
        console.error('Error loading series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeries();
  }, [id]);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('manga-reader-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load user rating for this series
    if (id) {
      const loadUserRating = async () => {
        try {
          const rating = await dataService.getUserRating(id);
          setUserRating(rating || 0);
        } catch (error) {
          console.error('Error loading user rating:', error);
        }
      };
      loadUserRating();
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleRating = async (rating: number) => {
    if (!user || !id || isRating) return;
    
    setIsRating(true);
    try {
      // Optimistic update
      setUserRating(rating);
      
      // Submit rating to data service
      await dataService.submitRating(id, rating);
      
      // Reload series to get updated average rating
      const seriesData = await dataService.getSeriesById(id);
      if (seriesData) {
        setSeries(seriesData);
      }
    } catch (error) {
      console.error('Error saving rating:', error);
      // Revert optimistic update on error
      const currentRating = await dataService.getUserRating(id);
      setUserRating(currentRating || 0);
    } finally {
      setIsRating(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-500"></div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-cool-900 mb-2">Series Not Found</h2>
          <p className="text-cool-600 mb-4">The series you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const readChapters = series.chapters.filter(ch => ch.isRead).length;

  return (
    <div className="min-h-screen bg-manga-bg">
      {/* Hero Section */}
      <section className="relative">
        {/* Background Image */}
        <div 
          className="h-64 md:h-80 lg:h-96 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${series.bannerImage || series.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-4 sm:pb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Cover Image */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src={series.coverImage}
                  alt={series.title}
                  className="w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60 rounded-lg shadow-xl"
                />
              </div>

              {/* Series Info */}
              <div className="flex-1 text-white text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{series.title}</h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-4">by {series.author}</p>
                
                <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                  {series.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 sm:px-3 py-1 bg-white bg-opacity-20 text-white text-xs sm:text-sm rounded-full backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-6 mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-base sm:text-lg">★</span>
                    <span className="text-white ml-1 font-medium text-sm sm:text-base">{series.rating}</span>
                  </div>
                  <span className="text-gray-200 text-sm sm:text-base">{series.totalChapters} chapters</span>
                  <span className="text-gray-200 capitalize text-sm sm:text-base">{series.status}</span>
                </div>

                {/* Dual Ratings */}
                {user && (
                  <div className="mb-4">
                    <StarRating
                      rating={series.rating}
                      userRating={userRating}
                      onRatingChange={handleRating}
                      interactive={true}
                      size="md"
                      showValue={true}
                      showDual={true}
                    />
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-manga-text mb-4">Description</h2>
            <div className="card p-6">
              <p className={`text-manga-text leading-relaxed ${
                !showDescription ? 'line-clamp-3' : ''
              }`}>
                {series.description}
              </p>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="mt-2 text-neon-500 hover:text-neon-400 font-medium flex items-center transition-colors"
              >
                {showDescription ? (
                  <>
                    <ChevronUpIcon className="h-4 w-4 mr-1" />
                    Read Less
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                    Read More
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section className="pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl">
            {/* Chapter List - Fixed Height Scrollable */}
            <div className="card p-0">
              <div className="p-4 border-b border-manga-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-manga-text">Chapters</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-manga-muted">
                      {readChapters}/{series.totalChapters} read
                    </span>
                    
                    {/* Quick Jump */}
                    <div className="relative">
                      <button
                        onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                        className="flex items-center px-3 py-2 bg-manga-surface border border-manga-border rounded-lg text-sm text-manga-text hover:bg-manga-border transition-colors"
                      >
                        Jump to Chapter
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </button>

                      <AnimatePresence>
                        {showChapterDropdown && (
                          <>
                            {/* Backdrop */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40"
                              onClick={() => setShowChapterDropdown(false)}
                            />
                            
                            {/* Dropdown */}
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full right-0 mt-1 w-48 bg-manga-card border border-manga-border rounded-lg shadow-xl z-[100] max-h-60 overflow-y-auto scrollbar-hide"
                            >
                              {series.chapters.map((chapter) => (
                                <button
                                  key={chapter.id}
                                  onClick={() => {
                                    setShowChapterDropdown(false);
                                    // Scroll to the chapter
                                    const chapterElement = document.getElementById(`chapter-${chapter.id}`);
                                    if (chapterElement) {
                                      chapterElement.scrollIntoView({ 
                                        behavior: 'smooth', 
                                        block: 'center' 
                                      });
                                    }
                                  }}
                                  className="block w-full px-3 py-2 text-sm text-manga-text hover:bg-manga-surface border-b border-manga-border last:border-b-0 transition-colors text-left"
                                >
                                  Chapter {chapter.chapterNumber}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-manga-border scrollbar-track-manga-surface">
                <div className="space-y-1 p-2">
                  {series.chapters
                    .sort((a, b) => b.chapterNumber - a.chapterNumber)
                    .map((chapter) => (
                      <Link
                        key={chapter.id}
                        id={`chapter-${chapter.id}`}
                        to={`/series/${series.id}/chapter/${chapter.id}`}
                        className="block w-full p-3 rounded-lg transition-all duration-200 hover:bg-manga-surface active:bg-manga-border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium text-left transition-all duration-200 ${
                              chapter.isRead 
                                ? 'text-manga-text' 
                                : 'text-neon-400 font-semibold'
                            }`}>
                              Chapter {chapter.chapterNumber}
                            </h3>
                            <p className="text-sm text-manga-muted text-left">
                              {new Date(chapter.publishedAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 ml-4">
                            {chapter.isRead ? (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Read
                              </span>
                            ) : (
                              <span className="text-xs bg-neon-500 text-white px-2 py-1 rounded-full">
                                New
                              </span>
                            )}
                            <span className="text-sm text-manga-muted">
                              {chapter.pages.length} pages
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-neon-500 hover:bg-neon-600 text-white rounded-full shadow-lg transition-colors jitter-hover z-20"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeriesPage;
