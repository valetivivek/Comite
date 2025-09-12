import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookmarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { Series } from '../types';
import { dataService } from '../services/dataService';
import StarRating from './StarRating';

interface ListItemProps {
  series: Series;
}

const ListItem = ({ series }: ListItemProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [seriesProgress, setSeriesProgress] = useState({ read: 0, total: 0 });

  // Check if series is bookmarked and get user rating
  useEffect(() => {
    const checkBookmark = async () => {
      const bookmarked = await dataService.isBookmarked(series.id);
      setIsBookmarked(bookmarked);
    };
    
    const checkUserRating = async () => {
      const rating = await dataService.getUserRating(series.id);
      setUserRating(rating);
    };

    const checkProgress = async () => {
      const progress = await dataService.getSeriesProgress(series.id);
      setSeriesProgress(progress);
    };

    checkBookmark();
    checkUserRating();
    checkProgress();
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

  const handleRatingChange = async (rating: number) => {
    try {
      await dataService.submitRating(series.id, rating);
      setUserRating(rating);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card hover:shadow-lg transition-shadow duration-200 relative"
    >
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
            
            {/* Status Badge - Top Right */}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                series.status === 'ongoing' 
                  ? 'bg-green-500 text-white' 
                  : series.status === 'completed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-orange-500 text-white'
              }`}>
                {series.status}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 sm:ml-4 min-w-0 flex flex-col">
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
                className="ml-4 p-2 rounded-lg bg-manga-surface hover:bg-manga-border transition-colors flex-shrink-0"
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <BookmarkIcon className="h-5 w-5 text-manga-muted" />
                )}
              </button>
            </div>
            
            {/* Rating in place of author */}
            <div className="mb-3">
              <StarRating 
                rating={userRating || series.rating} 
                onRatingChange={handleRatingChange}
                interactive={true}
                size="sm"
                showValue={true}
              />
            </div>

            {/* Chapter count and progress */}
            <div className="flex items-center gap-2 mb-4 text-sm text-manga-muted">
              <span>{series.totalChapters} chapters</span>
              {seriesProgress.read > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {seriesProgress.read}/{seriesProgress.total} read
                  </div>
                </>
              )}
            </div>

            {/* Recent Chapters - Vertical List */}
            <div className="mb-3">
              <p className="text-sm text-manga-muted mb-2 font-medium">Recent chapters:</p>
              <div className="space-y-1">
                {recentChapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/series/${series.id}/chapter/${chapter.id}`;
                    }}
                    className={`w-full p-2 rounded-lg transition-colors cursor-pointer text-sm ${
                      chapter.isRead 
                        ? 'bg-manga-surface text-manga-muted hover:bg-manga-border' 
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    Chapter {chapter.chapterNumber}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ListItem;