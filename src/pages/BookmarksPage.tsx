import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookmarkIcon, 
  BellIcon, 
  XMarkIcon,
  EyeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { dataService } from '../services/dataService';
import { Bookmark, Notification } from '../types';
import SeriesCard from '../components/SeriesCard';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [bookmarksData, notificationsData] = await Promise.all([
          dataService.getBookmarks(),
          dataService.getNotifications()
        ]);
        setBookmarks(bookmarksData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRemoveBookmark = async (seriesId: string) => {
    try {
      await dataService.removeBookmark(seriesId);
      setBookmarks(prev => prev.filter(b => b.seriesId !== seriesId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await dataService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await dataService.clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-bg">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-manga-text mb-2">My Bookmarks</h1>
            <p className="text-manga-muted">
              {bookmarks.length} bookmarked series
            </p>
          </div>

          {/* Notifications */}
          <div className="relative mt-4 sm:mt-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 card hover:shadow-lg transition-all jitter-hover"
            >
              <BellIcon className="h-6 w-6 text-manga-muted" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-manga-card rounded-lg shadow-xl border border-manga-border z-20"
                >
                  <div className="p-4 border-b border-manga-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-manga-text">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAllNotifications}
                          className="text-sm text-manga-muted hover:text-manga-text"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-manga-muted">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-manga-border last:border-b-0 hover:bg-manga-surface transition-colors ${
                            !notification.isRead ? 'bg-teal-500/10' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-manga-text">
                                {notification.message}
                              </p>
                              <p className="text-xs text-manga-muted mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkNotificationAsRead(notification.id)}
                                className="ml-2 p-1 hover:bg-manga-border rounded transition-colors"
                              >
                                <XMarkIcon className="h-4 w-4 text-manga-muted" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon className="h-16 w-16 text-manga-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-manga-text mb-2">No Bookmarks Yet</h3>
            <p className="text-manga-muted mb-6">
              Start bookmarking your favorite series to see them here
            </p>
            <Link to="/" className="btn-primary">
              Browse Series
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {bookmarks.map((bookmark) => {
                const series = bookmark.series;
                const latestChapter = series.chapters[0];
                const readChapters = series.chapters.filter(ch => ch.isRead).length;
                const hasNewChapter = latestChapter && 
                  new Date(latestChapter.publishedAt) > new Date(bookmark.lastReadAt);

                return (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <div className="card hover:shadow-lg transition-all duration-200">
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

                          {/* New Chapter Badge */}
                          {hasNewChapter && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                                New!
                              </span>
                            </div>
                          )}

                          {/* Remove Bookmark Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveBookmark(series.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors jitter-hover"
                          >
                            <BookmarkSolidIcon className="h-4 w-4 text-yellow-400" />
                          </button>

                          {/* Status Badge */}
                          <div className="absolute bottom-2 left-2">
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
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          <h3 className="font-semibold text-manga-text text-sm mb-1 line-clamp-2">
                            {series.title}
                          </h3>
                          <p className="text-xs text-manga-muted mb-2 truncate">{series.author}</p>
                          
                          <div className="flex items-center justify-between text-xs text-manga-muted mb-2">
                            <span>{series.totalChapters} ch</span>
                            {readChapters > 0 && (
                              <div className="flex items-center">
                                <EyeIcon className="h-3 w-3 mr-1" />
                                {readChapters}
                              </div>
                            )}
                          </div>

                          {latestChapter && (
                            <div className="text-xs text-manga-muted">
                              Latest: Ch {latestChapter.chapterNumber}
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Continue Reading Button */}
                      {latestChapter && (
                        <div className="p-3 pt-0">
                          <Link
                            to={`/series/${series.id}/chapter/${latestChapter.id}`}
                            className="w-full flex items-center justify-center px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors jitter-hover"
                          >
                            {readChapters > 0 ? 'Continue Reading' : 'Start Reading'}
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
