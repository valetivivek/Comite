import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Series } from '../types';

interface SeriesCardProps {
  series: Series;
  viewMode: 'grid' | 'list';
}

const SeriesCard = ({ series, viewMode }: SeriesCardProps) => {
  const recentChapters = series.chapters.slice(0, 5);

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

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card hover:shadow-lg transition-shadow duration-200"
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
            <div className="flex-1 min-w-0">
              <div className="mb-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-manga-text truncate flex-1">
                    {series.title}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-manga-text" aria-label={`Rating ${series.rating}`}>
                      {series.rating}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-manga-muted mb-2">{series.author}</p>

              {/* Chapter count */}
              <div className="mb-3">
                <span className="text-sm text-manga-muted">{series.totalChapters} chapters</span>
              </div>

              {/* Recent Chapters - Vertical List */}
              <div className="space-y-1">
                {recentChapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`text-xs py-1 px-2 rounded ${
                      chapter.isRead 
                        ? 'bg-manga-surface text-manga-muted' 
                        : 'bg-neon-500 text-white'
                    }`}
                    aria-label={`Chapter ${chapter.chapterNumber}`}
                  >
                    <div className="flex justify-between items-center">
                      <span>Ch. {chapter.chapterNumber}</span>
                      {chapter.publishedAt && formatRelativeTime(chapter.publishedAt) && (
                        <span 
                          className="text-xs opacity-75"
                          title={new Date(chapter.publishedAt).toLocaleString()}
                        >
                          {formatRelativeTime(chapter.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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


          {/* Rating */}
          <div className="absolute bottom-2 left-2 flex items-center bg-black bg-opacity-50 rounded px-2 py-1">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-white text-sm ml-1">{series.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="mb-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-manga-text text-sm line-clamp-2 flex-1">
                {series.title}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-yellow-500">★</span>
                <span className="text-sm text-manga-text" aria-label={`Rating ${series.rating}`}>
                  {series.rating}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-manga-muted mb-2 truncate">{series.author}</p>

          {/* Chapter count */}
          <div className="mb-3">
            <span className="text-sm text-manga-muted">{series.totalChapters} chapters</span>
          </div>

          {/* Recent Chapters - Vertical List */}
          <div className="space-y-1">
            {recentChapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/series/${series.id}/chapter/${chapter.id}`}
                className={`block text-xs py-1 px-2 rounded transition-colors ${
                  chapter.isRead 
                    ? 'text-manga-muted hover:text-manga-text hover:bg-manga-surface' 
                    : 'text-teal-400 hover:text-teal-300 hover:bg-teal-50'
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
      </Link>
    </motion.div>
  );
};

export default SeriesCard;
