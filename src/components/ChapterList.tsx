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

  // Calculate reading time estimate (assuming 2 minutes per page)
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
      return `${diffInDays}d ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}y ago`;
  };

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
      <div className="space-y-0.5">
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
                className="block w-full p-3 rounded-lg transition-all duration-200 hover:bg-manga-surface active:bg-manga-border min-h-[40px] focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-manga-bg"
                aria-label={`Open chapter ${chapter.chapterNumber}${chapter.publishedAt ? `, updated ${formatRelativeTime(chapter.publishedAt)}` : ''}`}
              >
                <div className="flex items-center justify-between">
                  {/* Left aligned chapter info */}
                  <div className="flex-1 min-w-0">
                    <div className="chapter-main">
                      <h3 className={`font-semibold text-left transition-all duration-200 text-sm sm:text-base ${
                        chapter.isRead 
                          ? 'text-manga-text' 
                          : 'text-midnight-primary-400'
                      }`}>
                        Ch. {chapter.chapterNumber}
                        {chapter.title && (
                          <span className="block text-xs text-manga-muted mt-1 truncate">
                            {chapter.title}
                          </span>
                        )}
                      </h3>
                    </div>
                    
                    {/* Mobile: time on second line */}
                    <div className="chapter-time sm:hidden">
                      {chapter.publishedAt && formatRelativeTime(chapter.publishedAt) && (
                        <p className="text-xs text-neutral-400 font-medium mt-1">
                          {formatRelativeTime(chapter.publishedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Right aligned status and time (desktop) */}
                  <div className="flex items-center gap-3 ml-4">
                    {/* Desktop: time right-aligned */}
                    <div className="chapter-time hidden sm:block">
                      {chapter.publishedAt && formatRelativeTime(chapter.publishedAt) && (
                        <span className="text-xs text-neutral-400 font-medium">
                          {formatRelativeTime(chapter.publishedAt)}
                        </span>
                      )}
                    </div>
                    
                    {chapter.isRead ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                        Read
                      </span>
                    ) : (
                      <span className="text-xs bg-midnight-primary-500/20 text-midnight-primary-400 px-2 py-1 rounded-full border border-midnight-primary-500/30">
                        New
                      </span>
                    )}
                    <span className="text-xs text-manga-muted">
                      {chapter.pages.length} pages
                    </span>
                    {!chapter.isRead && (
                      <span className="text-xs bg-midnight-accent-500/20 text-midnight-accent-400 px-2 py-1 rounded-full border border-midnight-accent-500/30">
                        Continue Reading
                      </span>
                    )}
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