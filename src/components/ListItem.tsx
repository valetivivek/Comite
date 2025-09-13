import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { Series } from '../types';
import { dataService } from '../services/dataService';

interface ListItemProps {
  series: Series;
}

const ListItem = ({ series }: ListItemProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if series is bookmarked
  useEffect(() => {
    const checkBookmark = async () => {
      const bookmarked = await dataService.isBookmarked(series.id);
      setIsBookmarked(bookmarked);
    };

    checkBookmark();
  }, [series.id]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isBookmarked) {
        await dataService.removeBookmark(series.id);
        setIsBookmarked(false);
      } else {
        await dataService.addBookmark(series.id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recentChapters = series.chapters.slice(0, 5); // Show 5 chapters

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

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card hover:shadow-lg transition-shadow duration-200 relative"
    >
      <div className="flex p-4">
        {/* Cover Image - Left aligned with specified dimensions */}
        <div className="relative flex-shrink-0 w-[148px] sm:w-[168px] lg:w-[184px] aspect-[3/4] rounded-lg overflow-hidden mr-4">
          <Link to={`/series/${series.id}`} className="block">
            <img
              src={series.coverImage}
              alt={series.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </Link>
        </div>

        {/* Content - Right side details */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1 min-w-0">
              <Link to={`/series/${series.id}`} className="block">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-manga-text text-xl sm:text-lg hover:text-teal-400 transition-colors">
                    {series.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="text-base text-manga-text" aria-label={`Rating ${series.rating}`}>
                      {series.rating}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Bookmark Button - Far Right */}
            <button
              onClick={handleBookmark}
              disabled={isLoading}
              className={`ml-4 p-2 rounded-lg bg-manga-surface hover:bg-manga-border transition-colors flex-shrink-0 ${
                isBookmarked ? 'text-yellow-500' : 'text-manga-muted'
              }`}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="h-5 w-5" />
              ) : (
                <BookmarkIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Chapter count */}
          <div className="mb-2">
            <span className="text-base text-manga-muted">{series.totalChapters} chapters</span>
          </div>

          {/* Recent Chapters - Vertical List */}
          <div className="space-y-1">
            {recentChapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/series/${series.id}/chapter/${chapter.id}`}
                className={`block text-sm py-1 px-2 rounded transition-colors hover:bg-manga-surface ${
                  chapter.isRead 
                    ? 'text-manga-muted hover:text-manga-text' 
                    : 'text-teal-400 hover:text-manga-text'
                }`}
                aria-label={`Chapter ${chapter.chapterNumber}`}
              >
                <div className="flex justify-between items-center">
                  <span>Ch. {chapter.chapterNumber}</span>
                  {chapter.publishedAt && formatRelativeTime(chapter.publishedAt) && (
                    <span 
                      className="text-xs text-manga-muted"
                      title={new Date(chapter.publishedAt).toLocaleString()}
                    >
                      {formatRelativeTime(chapter.publishedAt)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ListItem;