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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-manga-text">Chapters</h2>
        <button
          onClick={toggleSort}
          className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-lg border border-manga-border bg-manga-surface px-3 py-2 text-sm text-manga-text transition-colors hover:bg-manga-border focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-bg"
          type="button"
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
                className="block w-full min-h-[44px] rounded-xl p-4 transition-all duration-200 hover:bg-manga-surface active:bg-manga-border focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-bg sm:p-3"
                aria-label={`Open chapter ${chapter.chapterNumber}${chapter.publishedAt ? `, updated ${formatRelativeTime(chapter.publishedAt)}` : ''}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-left text-sm font-semibold transition-all duration-200 sm:text-base ${
                      chapter.isRead 
                        ? 'text-manga-text' 
                        : 'text-manga-accent'
                    }`}>
                      Ch. {chapter.chapterNumber}
                      {chapter.title && (
                        <span className="mt-1 block truncate text-xs text-manga-muted">
                          {chapter.title}
                        </span>
                      )}
                    </h3>
                  </div>
                   
                  <div className="flex flex-wrap items-center gap-2 sm:ml-4 sm:justify-end">
                    {chapter.publishedAt && formatRelativeTime(chapter.publishedAt) && (
                      <span className="basis-full text-xs font-medium text-manga-muted sm:basis-auto">
                        {formatRelativeTime(chapter.publishedAt)}
                      </span>
                    )}
                    {chapter.isRead ? (
                      <span className="inline-flex items-center rounded-full bg-manga-success px-2.5 py-1 text-xs font-medium text-manga-on-success">
                        Read
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-manga-accent px-2.5 py-1 text-xs font-medium text-manga-on-accent">
                        New
                      </span>
                    )}
                    <span className="text-xs text-manga-muted">
                      {chapter.pages.length} pages
                    </span>
                    {!chapter.isRead && (
                      <span className="hidden items-center rounded-full border border-manga-accent px-2.5 py-1 text-xs font-medium text-manga-accent sm:inline-flex">
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
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-manga-accent"></div>
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
