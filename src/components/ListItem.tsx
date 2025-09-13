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

  const recentChapters = series.chapters.slice(0, 3); // Show 3 chapters

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card hover:shadow-lg transition-shadow duration-200 relative"
    >
      <Link to={`/series/${series.id}`} className="block">
        <div className="flex p-4">
          {/* Cover Image - Left aligned */}
          <div className="relative flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden mr-4">
            <img
              src={series.coverImage}
              alt={series.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Content - Right side details */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-manga-text text-lg sm:text-base hover:text-teal-400 transition-colors flex-1 min-w-0">
                {series.title}
              </h3>
              
              {/* Bookmark Button - Far Right */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBookmark(e);
                }}
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
            
            {/* Rating */}
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">★</span>
                <span className="text-sm text-manga-text" aria-label={`Rating ${series.rating}`}>
                  {series.rating}
                </span>
              </div>
            </div>

            {/* Chapter count */}
            <div className="mb-3">
              <span className="text-sm text-manga-muted">{series.totalChapters} chapters</span>
            </div>

            {/* Recent Chapters - Compact Pills */}
            <div className="flex flex-wrap gap-1">
              {recentChapters.map((chapter) => (
                <span
                  key={chapter.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/series/${series.id}/chapter/${chapter.id}`;
                  }}
                  className={`px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
                    chapter.isRead 
                      ? 'bg-manga-surface text-manga-muted hover:bg-manga-border' 
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                  aria-label={`Chapter ${chapter.chapterNumber}`}
                >
                  {chapter.chapterNumber}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ListItem;