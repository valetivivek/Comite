import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookmarkIcon, 
  EyeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { dataService } from '../services/dataService';
import { Bookmark } from '../types';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const bookmarksData = await dataService.getBookmarks();
        setBookmarks(bookmarksData);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRemoveBookmark = async (seriesId: string) => {
    try {
      await dataService.removeBookmark(seriesId);
      setBookmarks(prev => prev.filter(b => b.seriesId !== seriesId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-manga-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-bg">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-manga-text mb-2">My Bookmarks</h1>
          <p className="text-manga-muted">
            {bookmarks.length} bookmarked series
          </p>
        </div>

        {/* Bookmarks List - Responsive */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon className="h-16 w-16 text-manga-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-manga-text mb-2">No Bookmarks Yet</h3>
            <p className="text-manga-muted mb-6">
              Start bookmarking your favorite series to see them here
            </p>
            <Link to="/" className="inline-flex items-center rounded-lg bg-manga-accent px-4 py-2 text-manga-on-accent transition-colors hover:bg-manga-accent-hover">
              Browse Series
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <AnimatePresence>
              {bookmarks.map((bookmark) => {
                const series = bookmark.series;
                const latestChapter = series.chapters[0];
                const readChapters = series.chapters.filter(ch => ch.isRead).length;
                const hasNewChapter = latestChapter && 
                  new Date(latestChapter.publishedAt) > new Date(bookmark.lastReadAt);

                return (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <div className="card hover:shadow-lg transition-all duration-200">
                      <Link to={`/series/${series.id}`} className="block">
                        <div className="flex flex-col sm:flex-row p-4">
                          {/* Cover Image */}
                          <div className="relative flex-shrink-0 w-full sm:w-20 h-40 sm:h-28 rounded-lg overflow-hidden mb-4 sm:mb-0">
                            <img
                              src={series.coverImage}
                              alt={series.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />

                            {/* New Chapter Badge */}
                            {hasNewChapter && (
                              <div className="absolute top-2 left-2">
                                <span className="theme-chip theme-chip-accent px-2 py-1 text-xs">
                                  New!
                                </span>
                              </div>
                            )}

                            {/* Remove Bookmark Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveBookmark(series.id);
                              }}
                              className="theme-backdrop absolute top-2 right-2 rounded-full p-1.5 transition-opacity hover:opacity-90"
                            >
                              <BookmarkSolidIcon className="h-4 w-4 text-manga-warning" />
                            </button>

                            {/* Status Badge */}
                            <div className="absolute bottom-2 left-2">
                              <span className={`theme-chip px-2 py-1 text-xs ${
                                series.status === 'ongoing' 
                                  ? 'theme-chip-success'
                                  : series.status === 'completed'
                                  ? 'theme-chip-info'
                                  : 'theme-chip-warning'
                              }`}>
                                {series.status}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 sm:ml-4 min-w-0">
                            <h3 className="font-semibold text-manga-text text-lg sm:text-base mb-2 line-clamp-2">
                              {series.title}
                            </h3>
                            <p className="text-sm text-manga-muted mb-2 truncate">{series.author}</p>
                            
                            <div className="flex items-center justify-between text-sm text-manga-muted mb-3">
                              <span>{series.totalChapters} chapters</span>
                              {readChapters > 0 && (
                                <div className="flex items-center">
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  {readChapters} read
                                </div>
                              )}
                            </div>

                            {latestChapter && (
                              <div className="text-sm text-manga-muted mb-3">
                                Latest: Ch {latestChapter.chapterNumber}
                              </div>
                            )}

                            {/* Continue Reading Button */}
                            {latestChapter && (
                              <Link
                                to={`/series/${series.id}/chapter/${latestChapter.id}`}
                                className="inline-flex items-center rounded-lg bg-manga-accent px-4 py-2 text-sm text-manga-on-accent transition-colors hover:bg-manga-accent-hover"
                              >
                                {readChapters > 0 ? 'Continue Reading' : 'Start Reading'}
                                <ChevronRightIcon className="h-4 w-4 ml-1" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
