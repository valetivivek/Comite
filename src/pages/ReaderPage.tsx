import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowLeftIcon,
  ChevronDownIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { dataService } from '../services/dataService';
import { Series, Chapter } from '../types';
import CommentSection from '../components/CommentSection';

const ReaderPage = () => {
  const { seriesId, chapterId } = useParams<{ seriesId: string; chapterId: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const toolbarTimeoutRef = useRef<number>();

  useEffect(() => {
    const loadData = async () => {
      if (!seriesId || !chapterId) return;

      try {
        setIsLoading(true);
        const [seriesData, chapterData] = await Promise.all([
          dataService.getSeriesById(seriesId),
          dataService.getChapter(seriesId, chapterId)
        ]);

        if (seriesData && chapterData) {
          setSeries(seriesData);
          setChapter(chapterData);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading chapter:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [seriesId, chapterId, navigate]);

  useEffect(() => {
    // Mark chapter as read when opened
    if (chapter && !chapter.isRead && !isMarkingAsRead) {
      setIsMarkingAsRead(true);
      dataService.markChapterAsRead(seriesId!, chapterId!);
    }
  }, [chapter, seriesId, chapterId, isMarkingAsRead]);

  useEffect(() => {
    // Auto-hide toolbar
    const handleMouseMove = () => {
      setShowToolbar(true);
      if (toolbarTimeoutRef.current) {
        clearTimeout(toolbarTimeoutRef.current);
      }
      toolbarTimeoutRef.current = setTimeout(() => {
        setShowToolbar(false);
      }, 3000);
    };

    const handleScroll = () => {
      setShowToolbar(true);
      if (toolbarTimeoutRef.current) {
        clearTimeout(toolbarTimeoutRef.current);
      }
      toolbarTimeoutRef.current = setTimeout(() => {
        setShowToolbar(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (toolbarTimeoutRef.current) {
        clearTimeout(toolbarTimeoutRef.current);
      }
    };
  }, []);


  const getPreviousChapter = () => {
    if (!series || !chapter) return null;
    const prevChapterNumber = chapter.chapterNumber - 1;
    return series.chapters.find(ch => ch.chapterNumber === prevChapterNumber) || null;
  };

  const getNextChapter = () => {
    if (!series || !chapter) return null;
    const nextChapterNumber = chapter.chapterNumber + 1;
    return series.chapters.find(ch => ch.chapterNumber === nextChapterNumber) || null;
  };

  const goToPreviousChapter = () => {
    const prevChapter = getPreviousChapter();
    if (prevChapter) {
      navigate(`/series/${seriesId}/chapter/${prevChapter.id}`);
    }
  };

  const goToNextChapter = () => {
    const nextChapter = getNextChapter();
    if (nextChapter) {
      navigate(`/series/${seriesId}/chapter/${nextChapter.id}`);
    } else {
      // Mark as completed and go back to series
      if (chapter && !chapter.isRead) {
        dataService.markChapterAsRead(seriesId!, chapterId!);
      }
      navigate(`/series/${seriesId}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Mark as read when reaching the end
    if (chapter && page === chapter.pages.length - 1 && !chapter.isRead) {
      dataService.markChapterAsRead(seriesId!, chapterId!);
    }
  };

  const formatRelativeTime = (timestamp: string | Date) => {
    if (!timestamp) return null;
    
    const now = new Date();
    const chapterDate = new Date(timestamp);
    
    if (isNaN(chapterDate.getTime())) return null;
    
    const diffInSeconds = Math.floor((now.getTime() - chapterDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} months ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} years ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-manga-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!series || !chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-manga-bg text-manga-text">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chapter Not Found</h2>
          <p className="mb-4 text-manga-muted">The chapter you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-manga-bg text-manga-text">
      {/* Top Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-manga-bg bg-opacity-95 backdrop-blur-sm border-b border-manga-border"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Link
                  to={`/series/${seriesId}`}
                  className="flex items-center text-manga-text hover:text-teal-400 transition-colors jitter-hover"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to Series
                </Link>
                
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-manga-text">{series.title}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-manga-muted">Chapter {chapter.chapterNumber}</p>
                    {chapter.publishedAt && formatRelativeTime(chapter.publishedAt) && (
                      <span 
                        className="text-xs text-manga-muted"
                        title={new Date(chapter.publishedAt).toLocaleString()}
                      >
                        • {formatRelativeTime(chapter.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Chapter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowChapterList(!showChapterList)}
                    className="flex items-center px-3 py-2 bg-manga-card rounded-lg hover:bg-manga-surface transition-colors"
                  >
                    <span className="hidden sm:inline mr-2">
                      {chapter ? `Chapter ${chapter.chapterNumber}` : 'Chapter'}
                    </span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {showChapterList && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-manga-card rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto"
                      >
                        <div className="p-2">
                          {series.chapters.map((ch) => (
                            <Link
                              key={ch.id}
                              to={`/series/${seriesId}/chapter/${ch.id}`}
                              onClick={() => setShowChapterList(false)}
                              className={`block px-3 py-2 text-sm rounded hover:bg-manga-surface transition-colors ${
                                ch.id === chapter.id ? 'bg-teal-600 text-white' : 'text-manga-text'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>Chapter {ch.chapterNumber}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Content */}
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-2 sm:px-4">
          {/* Chapter Title */}
          <div className="text-center py-6 sm:hidden">
            <h1 className="text-lg font-semibold text-manga-text">{series.title}</h1>
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm text-manga-muted">Chapter {chapter.chapterNumber}</p>
              {chapter.publishedAt && formatRelativeTime(chapter.publishedAt) && (
                <span 
                  className="text-xs text-manga-muted"
                  title={new Date(chapter.publishedAt).toLocaleString()}
                >
                  • {formatRelativeTime(chapter.publishedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Pages */}
          <div className="space-y-4">
            {chapter.pages.map((page, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-center"
              >
                <img
                  src={page}
                  alt={`Page ${index + 1}`}
                  className="w-full max-w-2xl sm:max-w-3xl h-auto rounded-lg shadow-lg"
                  loading="lazy"
                  onLoad={() => handlePageChange(index)}
                />
              </motion.div>
            ))}
          </div>

          {/* Mobile Navigation - After Last Panel */}
          <div className="py-6 sm:hidden">
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                {getPreviousChapter() ? (
                  <button
                    onClick={goToPreviousChapter}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors jitter-hover"
                  >
                    <ChevronLeftIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Previous</span>
                  </button>
                ) : (
                  <div className="w-full px-4 py-3 text-gray-500 text-center text-sm">
                    No Previous
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {getNextChapter() ? (
                  <button
                    onClick={goToNextChapter}
                    className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors jitter-hover"
                  >
                    <span className="text-sm font-medium">Next</span>
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/series/${seriesId}`)}
                    className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors jitter-hover"
                  >
                    <span className="text-sm font-medium">Back to Series</span>
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Chapter Navigation */}
          <div className="py-8 hidden sm:block">
            <div className="flex flex-row gap-4 justify-between items-center">
              <div className="flex gap-4">
                {getPreviousChapter() ? (
                  <button
                    onClick={goToPreviousChapter}
                    className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors jitter-hover"
                  >
                    <ChevronLeftIcon className="h-4 w-4 mr-2" />
                    Previous Chapter
                  </button>
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No Previous Chapter
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                {getNextChapter() ? (
                  <button
                    onClick={goToNextChapter}
                    className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors jitter-hover"
                  >
                    Next Chapter
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/series/${seriesId}`)}
                    className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors jitter-hover"
                  >
                    Back to Series
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="py-8">
            <CommentSection 
              contextId={`${series.id}-${chapter.id}`} 
              contextType="chapter" 
              title={`Comments for Chapter ${chapter.chapterNumber}`}
            />
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-4 z-50 p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-colors duration-200"
        aria-label="Scroll to top"
      >
        <ArrowUpIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ReaderPage;
