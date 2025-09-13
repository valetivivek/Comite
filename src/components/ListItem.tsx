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
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="card hover:shadow-xl hover:border-midnight-primary-500/30 transition-all duration-300 relative group h-[200px]"
    >
      <div className="flex p-3 h-full">
        {/* Cover Image - Left aligned with specified dimensions */}
        <div className="relative flex-shrink-0 w-[90px] sm:w-[100px] lg:w-[110px] aspect-[3/4] rounded-lg overflow-hidden mr-3">
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
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <Link to={`/series/${series.id}`} className="block">
                <div className="flex items-center gap-2">
                  <h3 
                    className="font-semibold text-manga-text text-base hover:text-midnight-primary-400 transition-colors truncate max-w-[120px] fast-tooltip"
                    title={series.title}
                  >
                    {series.title.length > 15 ? `${series.title.substring(0, 15)}...` : series.title}
                  </h3>
                  <div className="flex items-center gap-1 bg-midnight-primary-500/20 px-1.5 py-0.5 rounded-full border border-midnight-primary-500/30 flex-shrink-0">
                    <span className="text-white text-xs drop-shadow-sm">★</span>
                    <span className="text-white text-xs font-semibold" aria-label={`Rating ${series.rating}`}>
                      {series.rating}
                    </span>
                  </div>
                </div>
                {/* Chapter count - right below title */}
                <div className="mt-0.5">
                  <span className="text-xs text-manga-muted">{series.totalChapters} ch</span>
                </div>
              </Link>
            </div>
            
            {/* Bookmark Button - Far Right */}
            <button
              onClick={handleBookmark}
              disabled={isLoading}
              className={`ml-2 p-2.5 rounded-lg bg-manga-surface hover:bg-manga-border transition-colors flex-shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-manga-bg ${
                isBookmarked ? 'text-yellow-500' : 'text-manga-muted'
              }`}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="h-5 w-5" />
              ) : (
                <BookmarkIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Genre Tags */}
          <div className="mb-1.5 flex flex-wrap gap-1">
            {series.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-midnight-primary-500/20 text-midnight-primary-300 border border-midnight-primary-500/30"
              >
                {tag}
              </span>
            ))}
            {series.tags.length > 2 && (
              <span className="px-1.5 py-0.5 text-xs text-manga-muted">
                +{series.tags.length - 2} more
              </span>
            )}
          </div>

          {/* Recent Chapters - Vertical List */}
          <div className="space-y-0.5">
            {recentChapters.slice(0, 3).map((chapter) => (
              <Link
                key={chapter.id}
                to={`/series/${series.id}/chapter/${chapter.id}`}
                className={`block text-xs py-1 px-1.5 rounded transition-all duration-200 hover:bg-manga-surface hover:scale-[1.02] min-h-[24px] flex items-center justify-between group/chapter ${
                  chapter.isRead 
                    ? 'text-manga-muted hover:text-manga-text' 
                    : 'text-midnight-primary-400 hover:text-manga-text font-medium'
                }`}
                aria-label={`Chapter ${chapter.chapterNumber}`}
              >
                <div className="flex justify-between items-center w-full">
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