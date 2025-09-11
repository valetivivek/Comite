import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookmarkIcon, EyeIcon } from '@heroicons/react/24/outline';
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

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex p-4">
        {/* Cover Image */}
        <div className="relative flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden">
          <Link to={`/series/${series.id}`}>
            <img
              src={series.coverImage}
              alt={series.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </Link>
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
          <Link to={`/series/${series.id}`} className="block">
            <h3 className="font-semibold text-manga-text truncate mb-1 hover:text-teal-400 transition-colors">
              {series.title}
            </h3>
          </Link>
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

          <p className="text-sm text-manga-muted mb-3 line-clamp-2">
            {series.description}
          </p>

          {/* Latest Chapter Link */}
          {latestChapter && (
            <div className="flex items-center justify-between">
              <Link
                to={`/series/${series.id}/chapter/${latestChapter.id}`}
                className="inline-flex items-center px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors"
              >
                Chapter {latestChapter.chapterNumber}
              </Link>
              
              {readChapters > 0 && (
                <div className="flex items-center text-sm text-manga-muted">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {readChapters}/{series.totalChapters} read
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListItem;
