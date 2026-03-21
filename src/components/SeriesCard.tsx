import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Series } from '../types';
import LazyImage from './LazyImage';

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

    if (Number.isNaN(chapterDate.getTime())) return null;

    const diffInSeconds = Math.floor((now.getTime() - chapterDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} years ago`;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card transition-shadow duration-200 hover:shadow-lg"
      >
        <Link to={`/series/${series.id}`} className="block">
          <div className="flex p-4">
            <div className="relative mr-4 h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg">
              <LazyImage
                src={series.coverImage}
                alt={series.title}
                className="h-full w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="flex-1 truncate font-semibold text-manga-text">
                    {series.title}
                  </h3>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <span className="text-manga-warning" aria-hidden="true">&#9733;</span>
                    <span className="text-sm text-manga-text" aria-label={`Rating ${series.rating}`}>
                      {series.rating}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mb-2 text-sm text-manga-muted">{series.author}</p>

              <div className="mb-3">
                <span className="text-sm text-manga-muted">{series.totalChapters} chapters</span>
              </div>

              <div className="space-y-1">
                {recentChapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`rounded px-2 py-1 text-xs ${
                      chapter.isRead
                        ? 'bg-manga-surface text-manga-muted'
                        : 'bg-manga-accent text-manga-on-accent'
                    }`}
                    aria-label={`Chapter ${chapter.chapterNumber}`}
                  >
                    <div className="flex items-center justify-between">
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
      className="card transition-all duration-200 hover:shadow-lg"
    >
      <Link to={`/series/${series.id}`} className="block">
        <div className="relative">
          <div className="aspect-[3/4] overflow-hidden">
            <LazyImage
              src={series.coverImage}
              alt={series.title}
              className="h-full w-full"
            />
          </div>

          <div className="absolute bottom-2 left-2 flex items-center rounded border border-manga-overlay-border bg-manga-overlay px-2 py-1 backdrop-blur-sm">
            <span className="text-sm text-manga-warning" aria-hidden="true">&#9733;</span>
            <span className="ml-1 text-sm text-manga-overlay-text">{series.rating}</span>
          </div>
        </div>

        <div className="p-3">
          <div className="mb-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex-1 line-clamp-2 text-sm font-semibold text-manga-text">
                {series.title}
              </h3>
              <div className="flex flex-shrink-0 items-center gap-1">
                <span className="text-manga-warning" aria-hidden="true">&#9733;</span>
                <span className="text-sm text-manga-text" aria-label={`Rating ${series.rating}`}>
                  {series.rating}
                </span>
              </div>
            </div>
          </div>
          <p className="mb-2 truncate text-xs text-manga-muted">{series.author}</p>

          <div className="mb-3">
            <span className="text-sm text-manga-muted">{series.totalChapters} chapters</span>
          </div>

          <div className="space-y-1">
            {recentChapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/series/${series.id}/chapter/${chapter.id}`}
                className={`block rounded px-2 py-1 text-xs transition-colors ${
                  chapter.isRead
                    ? 'text-manga-muted hover:bg-manga-surface hover:text-manga-text'
                    : 'bg-manga-accent/8 text-manga-accent hover:bg-manga-accent/14 hover:text-manga-accent-hover'
                }`}
                aria-label={`Chapter ${chapter.chapterNumber}`}
              >
                <div className="flex items-center justify-between">
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
