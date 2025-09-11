import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookmarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { Series } from '../types';
import { dataService } from '../services/dataService';

interface SeriesCardProps {
  series: Series;
  viewMode: 'grid' | 'list';
}

const SeriesCard = ({ series, viewMode }: SeriesCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if series is bookmarked
  useState(() => {
    const checkBookmark = async () => {
      const bookmarked = await dataService.isBookmarked(series.id);
      setIsBookmarked(bookmarked);
    };
    checkBookmark();
  });

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

  const latestChapter = series.chapters[0];
  const readChapters = series.chapters.filter(ch => ch.isRead).length;
  const recentChapters = series.chapters.slice(0, 5);

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card hover:shadow-lg transition-shadow duration-200"
      >
        <Link to={`/series/${series.id}`} className="block">
          <div className="flex p-4">
            {/* Cover Image */}
            <div className="relative flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden">
              <img
                src={series.coverImage}
                alt={series.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-1 right-1">
                <button
                  onClick={handleBookmark}
                  disabled={isLoading}
                  className="p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  {isBookmarked ? (
                    <BookmarkSolidIcon className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <BookmarkIcon className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 ml-4 min-w-0">
              <h3 className="font-semibold text-manga-text truncate mb-1">
                {series.title}
              </h3>
              <p className="text-sm text-manga-muted mb-2">{series.author}</p>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="text-sm text-manga-muted ml-1">{series.rating}</span>
                </div>
                <span className="text-sm text-manga-muted">•</span>
                <span className="text-sm text-manga-muted">{series.totalChapters} ch</span>
                <span className="text-sm text-manga-muted">•</span>
                <span className="text-sm text-manga-muted capitalize">{series.status}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {series.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-teal-600 text-white text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Recent Chapters */}
              <div className="mb-2">
                <p className="text-xs text-manga-muted mb-1">Recent chapters:</p>
                <div className="flex flex-wrap gap-1">
                  {recentChapters.map((chapter) => (
                    <span
                      key={chapter.id}
                      className={`px-2 py-1 text-xs rounded ${
                        chapter.isRead 
                          ? 'bg-manga-surface text-manga-muted' 
                          : 'bg-teal-600 text-white'
                      }`}
                    >
                      Ch {chapter.chapterNumber}
                    </span>
                  ))}
                </div>
              </div>

              {readChapters > 0 && (
                <div className="flex items-center text-sm text-manga-muted">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {readChapters}/{series.totalChapters} read
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="card hover:shadow-lg transition-all duration-200"
    >
      <Link to={`/series/${series.id}`} className="block">
        <div className="relative">
          {/* Cover Image */}
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={series.coverImage}
              alt={series.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={isLoading}
            className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors jitter-hover"
          >
            {isBookmarked ? (
              <BookmarkSolidIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <BookmarkIcon className="h-4 w-4 text-white" />
            )}
          </button>

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              series.status === 'ongoing' 
                ? 'bg-green-500 text-white' 
                : series.status === 'completed'
                ? 'bg-blue-500 text-white'
                : 'bg-orange-500 text-white'
            }`}>
              {series.status}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute bottom-2 left-2 flex items-center bg-black bg-opacity-50 rounded px-2 py-1">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-white text-sm ml-1">{series.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-manga-text text-sm mb-1 line-clamp-2">
            {series.title}
          </h3>
          <p className="text-xs text-manga-muted mb-2 truncate">{series.author}</p>
          
          <div className="flex items-center justify-between text-xs text-manga-muted">
            <span>{series.totalChapters} ch</span>
            {readChapters > 0 && (
              <div className="flex items-center">
                <EyeIcon className="h-3 w-3 mr-1" />
                {readChapters}
              </div>
            )}
          </div>

          {latestChapter && (
            <div className="mt-2">
              <span className="text-xs text-manga-muted">
                Latest: Ch {latestChapter.chapterNumber}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default SeriesCard;
