import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookmarkIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  FunnelIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { dataService } from '../services/dataService';
import { Series, Chapter, User, UserRating } from '../types';
import StarRating from '../components/StarRating';

const SeriesPage = () => {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<'number' | 'date'>('number');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    const loadSeries = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const seriesData = await dataService.getSeriesById(id);
        if (seriesData) {
          setSeries(seriesData);
          const bookmarked = await dataService.isBookmarked(id);
          setIsBookmarked(bookmarked);
        }
      } catch (error) {
        console.error('Error loading series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeries();
  }, [id]);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('manga-reader-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load user rating for this series
    if (id) {
      const ratingsData = localStorage.getItem('manga-reader-user-ratings');
      if (ratingsData) {
        const ratings: UserRating[] = JSON.parse(ratingsData);
        const userRating = ratings.find(r => r.seriesId === id);
        if (userRating) {
          setUserRating(userRating.rating);
        }
      }
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookmark = async () => {
    if (!id) return;
    
    try {
      if (isBookmarked) {
        await dataService.removeBookmark(id);
        setIsBookmarked(false);
      } else {
        await dataService.addBookmark(id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user || !id || isRating) return;
    
    setIsRating(true);
    try {
      const ratingsData = localStorage.getItem('manga-reader-user-ratings');
      const ratings: UserRating[] = ratingsData ? JSON.parse(ratingsData) : [];
      
      const existingRatingIndex = ratings.findIndex(r => r.seriesId === id && r.userId === user.id);
      const newRating: UserRating = {
        id: `rating-${Date.now()}`,
        userId: user.id,
        seriesId: id,
        rating,
        createdAt: new Date().toISOString()
      };

      if (existingRatingIndex >= 0) {
        ratings[existingRatingIndex] = newRating;
      } else {
        ratings.push(newRating);
      }

      localStorage.setItem('manga-reader-user-ratings', JSON.stringify(ratings));
      setUserRating(rating);
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setIsRating(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-cool-900 mb-2">Series Not Found</h2>
          <p className="text-cool-600 mb-4">The series you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Filter and sort chapters
  const filteredChapters = series.chapters
    .filter(chapter => {
      if (filterRead === 'read') return chapter.isRead;
      if (filterRead === 'unread') return !chapter.isRead;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      return b.chapterNumber - a.chapterNumber;
    });

  const readChapters = series.chapters.filter(ch => ch.isRead).length;
  const latestChapter = series.chapters[0];

  return (
    <div className="min-h-screen bg-manga-bg">
      {/* Hero Section */}
      <section className="relative">
        {/* Background Image */}
        <div 
          className="h-64 md:h-80 lg:h-96 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${series.bannerImage || series.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Cover Image */}
              <div className="flex-shrink-0">
                <img
                  src={series.coverImage}
                  alt={series.title}
                  className="w-32 h-48 md:w-40 md:h-60 rounded-lg shadow-xl"
                />
              </div>

              {/* Series Info */}
              <div className="flex-1 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{series.title}</h1>
                <p className="text-lg md:text-xl text-gray-200 mb-4">by {series.author}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {series.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="text-white ml-1 font-medium">{series.rating}</span>
                  </div>
                  <span className="text-gray-200">{series.totalChapters} chapters</span>
                  <span className="text-gray-200 capitalize">{series.status}</span>
                </div>

                {/* User Rating */}
                {user && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-300 mb-2">Your Rating:</p>
                    <StarRating
                      rating={userRating}
                      onRatingChange={handleRating}
                      interactive={true}
                      size="lg"
                      showValue={true}
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleBookmark}
                    className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors jitter-hover"
                  >
                    {isBookmarked ? (
                      <BookmarkSolidIcon className="h-5 w-5 mr-2" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5 mr-2" />
                    )}
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-manga-text mb-4">Description</h2>
            <div className="card p-6">
              <p className={`text-manga-text leading-relaxed ${
                !showDescription ? 'line-clamp-3' : ''
              }`}>
                {series.description}
              </p>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="mt-2 text-teal-500 hover:text-teal-400 font-medium flex items-center transition-colors"
              >
                {showDescription ? (
                  <>
                    <ChevronUpIcon className="h-4 w-4 mr-1" />
                    Read Less
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                    Read More
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section className="pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl">
            {/* Chapter Controls */}
            <div className="card p-4 mb-6 sticky top-4 z-10">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-manga-text">Chapters</h2>
                  <span className="text-sm text-manga-muted">
                    {readChapters}/{series.totalChapters} read
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'number' | 'date')}
                      className="appearance-none bg-manga-surface border border-manga-border rounded-lg px-3 py-2 pr-8 text-sm text-manga-text focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="number">Chapter Number</option>
                      <option value="date">Publish Date</option>
                    </select>
                    <FunnelIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-manga-muted pointer-events-none" />
                  </div>

                  {/* Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={filterRead}
                      onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
                      className="appearance-none bg-manga-surface border border-manga-border rounded-lg px-3 py-2 pr-8 text-sm text-manga-text focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All Chapters</option>
                      <option value="read">Read</option>
                      <option value="unread">Unread</option>
                    </select>
                    <FunnelIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-manga-muted pointer-events-none" />
                  </div>

                  {/* Quick Jump */}
                  <div className="relative">
                    <button
                      onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                      className="flex items-center px-3 py-2 bg-manga-surface border border-manga-border rounded-lg text-sm text-manga-text hover:bg-manga-border transition-colors"
                    >
                      Jump to Chapter
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </button>

                    <AnimatePresence>
                      {showChapterDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-1 w-48 bg-manga-card border border-manga-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto"
                        >
                          {series.chapters.slice(0, 20).map((chapter) => (
                            <Link
                              key={chapter.id}
                              to={`/series/${series.id}/chapter/${chapter.id}`}
                              onClick={() => setShowChapterDropdown(false)}
                              className="block px-3 py-2 text-sm text-manga-text hover:bg-manga-surface border-b border-manga-border last:border-b-0"
                            >
                              Chapter {chapter.chapterNumber}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter List */}
            <div className="space-y-2">
              <AnimatePresence>
                {filteredChapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/series/${series.id}/chapter/${chapter.id}`}
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

            {filteredChapters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-manga-muted">No chapters found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-colors jitter-hover z-20"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeriesPage;
