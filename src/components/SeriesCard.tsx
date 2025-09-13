import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Series } from '../types';

interface SeriesCardProps {
  series: Series;
  viewMode: 'grid' | 'list';
}

const SeriesCard = ({ series, viewMode }: SeriesCardProps) => {
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
                <h3 className="font-semibold text-manga-text truncate">
                  {series.title}
                </h3>
              </div>
              <p className="text-sm text-manga-muted mb-2">{series.author}</p>
              
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
                    className={`px-2 py-1 text-xs rounded ${
                      chapter.isRead 
                        ? 'bg-manga-surface text-manga-muted' 
                        : 'bg-neon-500 text-white'
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
            <h3 className="font-semibold text-manga-text text-sm line-clamp-2">
              {series.title}
            </h3>
          </div>
          <p className="text-xs text-manga-muted mb-2 truncate">{series.author}</p>
          
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
                className={`px-2 py-1 text-xs rounded ${
                  chapter.isRead 
                    ? 'bg-manga-surface text-manga-muted' 
                    : 'bg-neon-500 text-white'
                }`}
                aria-label={`Chapter ${chapter.chapterNumber}`}
              >
                {chapter.chapterNumber}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default SeriesCard;
