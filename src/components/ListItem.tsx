import { useState, useEffect, memo } from 'react';
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
      className="card relative group min-h-[220px] transition-all duration-300 hover:border-manga-accent/30 hover:shadow-xl sm:h-[200px]"
    >
      <div className="flex h-full gap-3 p-3">
        {/* Cover Image - Left aligned with specified dimensions */}
        <div className="relative flex-shrink-0 w-[90px] sm:w-[100px] lg:w-[110px] aspect-[3/4] rounded-lg overflow-hidden">
          <Link to={`/series/${series.id}`} className="block h-full">
            <img
              src={series.coverImage}
              alt={series.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              width={110}
              height={140}
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
                    className="fast-tooltip truncate text-base font-semibold text-manga-text transition-colors hover:text-manga-accent"
                    title={series.title}
                  >
                    {series.title.length > 15 ? `${series.title.substring(0, 15)}...` : series.title}
                  </h3>
                  <div className="flex items-center gap-1 rounded-full border border-manga-accent/20 bg-manga-accent/10 px-1.5 py-0.5 flex-shrink-0">
                    <span className="text-manga-warning text-xs drop-shadow-sm" aria-hidden="true">&#9733;</span>
                    <span className="text-manga-accent text-xs font-semibold" aria-label={`Rating ${series.rating}`}>
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
              className={`ml-2 flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg bg-manga-surface p-2.5 transition-colors hover:bg-manga-border focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-bg ${
                isBookmarked ? 'text-manga-warning' : 'text-manga-muted'
              }`}
              type="button"
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
                className="rounded-full border border-manga-accent/18 bg-manga-accent/10 px-1.5 py-0.5 text-xs font-medium text-manga-accent"
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
          <div className="space-y-1">
            {recentChapters.slice(0, 3).map((chapter, index) => (
              <Link
                key={chapter.id}
                to={`/series/${series.id}/chapter/${chapter.id}`}
                className={`${index === 2 ? 'hidden sm:flex' : 'flex'} min-h-[44px] items-center justify-between rounded-lg px-2 py-2 text-xs transition-colors duration-200 hover:bg-manga-surface focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-bg ${
                  chapter.isRead 
                    ? 'text-manga-text-secondary hover:text-manga-text' 
                    : 'text-manga-accent hover:text-manga-text font-medium'
                }`}
                aria-label={`Chapter ${chapter.chapterNumber}`}
              >
                <div className="flex w-full items-center justify-between gap-3">
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

export default memo(ListItem);
