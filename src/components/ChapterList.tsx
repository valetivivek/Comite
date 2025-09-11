import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { Chapter } from '../types';

interface ChapterListProps {
  chapters: Chapter[];
  seriesId: string;
}

const ChapterList = ({ chapters, seriesId }: ChapterListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [displayedChapters, setDisplayedChapters] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sort') as 'asc' | 'desc') || 'desc'
  );

  // Update URL when sort changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortOrder);
    setSearchParams(newParams, { replace: true });
  }, [sortOrder, searchParams, setSearchParams]);

  // Sort chapters based on current sort order
  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.chapterNumber - b.chapterNumber 
      : b.chapterNumber - a.chapterNumber;
  });

  const visibleChapters = sortedChapters.slice(0, displayedChapters);
  const hasMoreChapters = displayedChapters < sortedChapters.length;

  const loadMoreChapters = () => {
    setDisplayedChapters(prev => Math.min(prev + 10, sortedChapters.length));
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setDisplayedChapters(10); // Reset to first 10 when sorting changes
  };

  return (
    <div className="space-y-4">
      {/* Sort Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-manga-text">Chapters</h2>
        <button
          onClick={toggleSort}
          className="flex items-center gap-2 px-3 py-2 bg-manga-surface border border-manga-border rounded-lg text-sm text-manga-text hover:bg-manga-border transition-colors"
        >
          {sortOrder === 'asc' ? (
            <>
              <ArrowUpIcon className="h-4 w-4" />
              Ascending
            </>
          ) : (
            <>
              <ArrowDownIcon className="h-4 w-4" />
              Descending
            </>
          )}
        </button>
      </div>

      {/* Chapter List */}
      <div className="space-y-2">
        <AnimatePresence>
          {visibleChapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/series/${seriesId}/chapter/${chapter.id}`}
                className={`block p-4 card hover:shadow-lg transition-all duration-200 jitter-hover ${
                  chapter.isRead ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-manga-text">
                      Chapter {chapter.chapterNumber}
                    </h3>
                    <p className="text-sm text-manga-muted">
                      {new Date(chapter.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {chapter.isRead && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Read
                      </span>
                    )}
                    <span className="text-sm text-manga-muted">
                      {chapter.pages.length} pages
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {hasMoreChapters && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMoreChapters}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <ChevronDownIcon className="h-4 w-4" />
            Load More Chapters ({sortedChapters.length - displayedChapters} remaining)
          </button>
        </div>
      )}

      {visibleChapters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-manga-muted">No chapters found</p>
        </div>
      )}
    </div>
  );
};

export default ChapterList;
