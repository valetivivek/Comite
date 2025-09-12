import { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ClockIcon,
  BellIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { User, Notification } from '../types';
import { dataService } from '../services/dataService';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('manga-reader-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notificationData = await dataService.getNotifications();
        setNotifications(notificationData);
        setUnreadCount(notificationData.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await dataService.markNotificationAsRead(notification.id);
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    setIsNotificationOpen(false);

    // Navigate to chapter if available
    if (notification.chapterId) {
      window.location.href = `/series/${notification.seriesId}/chapter/${notification.chapterId}`;
    } else {
      window.location.href = `/series/${notification.seriesId}`;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const clearAllNotifications = async () => {
    await dataService.clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };


  return (
    <div className="min-h-screen bg-manga-bg">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-manga-card/95 backdrop-blur-sm border-b border-manga-border">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo - Extreme Left */}
            <Link 
              to="/" 
              className="text-xl sm:text-2xl font-bold text-neon-500 hover:text-neon-400 transition-colors"
            >
              ComiTe
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search series..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 bg-manga-surface border border-manga-border rounded-lg text-manga-text placeholder-manga-muted focus:outline-none focus:ring-2 focus:ring-neon-500 focus:border-transparent transition-colors"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-manga-muted" />
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-manga-border rounded transition-colors"
                  >
                    <FunnelIcon className="h-4 w-4 text-manga-muted" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Notification Icon */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 rounded-lg bg-manga-surface hover:bg-manga-border transition-colors relative"
                >
                  <BellIcon className="h-6 w-6 text-manga-text" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {isNotificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-manga-card border border-manga-border rounded-lg shadow-xl z-50"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-manga-text">Notifications</h3>
                          <div className="flex items-center space-x-2">
                            {notifications.length > 0 && (
                              <button
                                onClick={clearAllNotifications}
                                className="text-xs text-manga-muted hover:text-manga-text px-2 py-1 rounded hover:bg-manga-surface transition-colors"
                              >
                                Clear All
                              </button>
                            )}
                            <button
                              onClick={() => setIsNotificationOpen(false)}
                              className="text-manga-muted hover:text-manga-text"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {notifications.length === 0 ? (
                          <p className="text-manga-muted text-sm text-center py-4">No notifications</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {notifications.slice(0, 5).map((notification) => (
                              <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${
                                  notification.isRead 
                                    ? 'bg-manga-surface hover:bg-manga-border' 
                                    : 'bg-neon-50 hover:bg-neon-100'
                                }`}
                              >
                                <p className="text-sm font-medium text-manga-text mb-1">
                                  {notification.seriesTitle}
                                </p>
                                <p className="text-xs text-manga-muted">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-manga-muted mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Icon */}
              <button
                onClick={() => setIsProfileDrawerOpen(true)}
                className="p-2 rounded-lg bg-manga-surface hover:bg-manga-border transition-colors"
              >
                <UserIcon className="h-6 w-6 text-manga-text" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-manga-card shadow-lg border border-manga-border jitter-hover"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-manga-text" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-manga-text" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-manga-card shadow-xl z-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="text-xl font-bold text-neon-500 hover:text-neon-400 transition-colors">
                  ComiTe
                </Link>
              </div>
              {/* Mobile Search */}
              <div className="mb-6">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search series..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-12 py-2 bg-manga-surface border border-manga-border rounded-lg text-manga-text placeholder-manga-muted focus:outline-none focus:ring-2 focus:ring-neon-500 focus:border-transparent transition-colors"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-manga-muted" />
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-manga-border rounded transition-colors"
                    >
                      <FunnelIcon className="h-4 w-4 text-manga-muted" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Dashboard Drawer */}
      <AnimatePresence>
        {isProfileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setIsProfileDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileDrawerOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-72 sm:w-80 bg-manga-card shadow-xl z-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-manga-text">Dashboard</h2>
                <button
                  onClick={() => setIsProfileDrawerOpen(false)}
                  className="p-2 rounded-lg hover:bg-manga-surface transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-manga-text" />
                </button>
              </div>

              <div className="space-y-4">
                {user ? (
                  <>
                    {/* User Profile Section */}
                    <div className="flex items-center space-x-3 p-4 bg-manga-surface rounded-lg">
                      <div className="w-12 h-12 bg-neon-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-manga-text">{user.username}</p>
                        <p className="text-sm text-manga-muted">{user.email}</p>
                      </div>
                    </div>

                    {/* Dashboard Options */}
                    <div className="space-y-2">
                      <Link
                        to="/bookmarks"
                        onClick={() => setIsProfileDrawerOpen(false)}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <BookmarkIcon className="mr-3 h-5 w-5" />
                        Bookmarks
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDrawerOpen(false)}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <UserIcon className="mr-3 h-5 w-5" />
                        Profile Settings
                      </Link>
                      <Link
                        to="/history"
                        onClick={() => setIsProfileDrawerOpen(false)}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <ClockIcon className="mr-3 h-5 w-5" />
                        Reading History
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Guest User Options */}
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsProfileDrawerOpen(false)}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <UserIcon className="mr-3 h-5 w-5" />
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsProfileDrawerOpen(false)}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <UserIcon className="mr-3 h-5 w-5" />
                        Sign Up
                      </Link>
                      <Link
                        to="/history"
                        onClick={() => setIsProfileDrawerOpen(false)}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <ClockIcon className="mr-3 h-5 w-5" />
                        Reading History
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
