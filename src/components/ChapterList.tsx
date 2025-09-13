import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
  const [displayedChapters, setDisplayedChapters] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sort') as 'asc' | 'desc') || 'desc'
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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

  const loadMoreChapters = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayedChapters(prev => Math.min(prev + 20, sortedChapters.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, sortedChapters.length]);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setDisplayedChapters(20); // Reset to first 20 when sorting changes
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreChapters && !isLoading) {
          loadMoreChapters();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMoreChapters, isLoading, loadMoreChapters]);

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

      {/* Chapter List - Vertical List Design */}
      <div className="space-y-1">
        <AnimatePresence>
          {visibleChapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.02 }}
            >
              <Link
                to={`/series/${seriesId}/chapter/${chapter.id}`}
                className="block w-full p-4 rounded-lg transition-all duration-200 hover:bg-manga-surface active:bg-manga-border"
              >
                <div className="flex items-center justify-between">
                  {/* Left aligned title */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-left transition-all duration-200 ${
                      chapter.isRead 
                        ? 'text-manga-text' 
                        : 'text-midnight-primary-400 font-semibold'
                    }`}>
                      Ch {chapter.chapterNumber}
                    </h3>
                    <p className="text-sm text-manga-muted text-left">
                      {new Date(chapter.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Right aligned status */}
                  <div className="flex items-center gap-3 ml-4">
                    {chapter.isRead ? (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Read
                      </span>
                    ) : (
                      <span className="text-xs bg-midnight-primary-500 text-white px-2 py-1 rounded-full">
                        New
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

      {/* Infinite Scroll Loading Indicator */}
      {hasMoreChapters && (
        <div ref={loadMoreRef} className="flex justify-center pt-4">
          {isLoading ? (
            <div className="flex items-center gap-2 px-6 py-3 text-manga-muted">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-midnight-primary-500"></div>
              Loading more chapters...
            </div>
          ) : (
            <div className="text-sm text-manga-muted">
              Scroll down to load more chapters ({sortedChapters.length - displayedChapters} remaining)
            </div>
          )}
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