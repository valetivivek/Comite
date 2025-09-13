// Copyright © 2025 Vishnu Vivek Valeti. All rights reserved.
// Licensed under ComiTe Proprietary License 1.0. See LICENSE.txt.

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  ClockIcon,
  BellIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { User, Notification } from '../types';
import { dataService } from '../services/dataService';
import { useNavSearch } from '../hooks/useNavSearch';
import Footer from './Footer';
import UserFlairs from './UserFlairs';
import FlairManager from './FlairManager';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSurpriseMeRolling, setIsSurpriseMeRolling] = useState(false);
  const [flairUpdateKey, setFlairUpdateKey] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    query,
    setQuery,
    results,
    isSearching,
    showResults,
    setShowResults,
    clearSearch,
    handleResultClick
  } = useNavSearch();

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

  const handleSurpriseMe = async () => {
    if (isSurpriseMeRolling) return;
    
    setIsSurpriseMeRolling(true);
    
    try {
      // Start both the animation and the selection logic in parallel
      const [selectedSeries] = await Promise.all([
        user 
          ? dataService.getPersonalizedSurpriseSeries(user.id)
          : dataService.getRandomSeries(),
        new Promise(resolve => setTimeout(resolve, 1000)) // Minimum 1 second wait
      ]);
      
      // Wait for either 1.5 seconds total or until selection is complete
      const maxWait = new Promise(resolve => setTimeout(resolve, 1500));
      await Promise.race([Promise.resolve(selectedSeries), maxWait]);
      
      if (selectedSeries) {
        navigate(`/series/${selectedSeries.id}`);
        setIsProfileDrawerOpen(false);
      }
    } catch (error) {
      console.error('Error getting surprise series:', error);
    } finally {
      setIsSurpriseMeRolling(false);
    }
  };

  const handleFlairsUpdated = () => {
    setFlairUpdateKey(prev => prev + 1);
  };

  const handleSignOut = () => {
    localStorage.removeItem('manga-reader-user');
    localStorage.removeItem('manga-reader-user-ratings');
    setUser(null);
    setIsProfileDrawerOpen(false);
    navigate('/');
  };


  const clearAllNotifications = async () => {
    await dataService.clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowResults]);


  return (
    <div className="min-h-screen bg-manga-bg">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-manga-card/95 backdrop-blur-sm border-b border-manga-border">
        <div className="mobile-container py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo with enhanced contrast and tagline */}
            <div className="flex flex-col">
              <Link 
                to="/" 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white hover:text-midnight-primary-300 transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-midnight-primary-500 to-midnight-primary-600 bg-clip-text text-transparent drop-shadow-lg"
              >
                ComiTe
              </Link>
              <p className="text-xs sm:text-sm text-midnight-secondary-300 hidden sm:block">
                Read thousands of manga, manhwa & comics online
              </p>
            </div>

            {/* Primary Navigation - Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link to="/" className="text-manga-text hover:text-midnight-primary-400 transition-colors font-medium">
                Browse
              </Link>
              <Link to="/popular" className="text-manga-text hover:text-midnight-primary-400 transition-colors font-medium">
                Popular
              </Link>
              <Link to="/new-releases" className="text-manga-text hover:text-midnight-primary-400 transition-colors font-medium">
                New Releases
              </Link>
              <Link to="/anime-adaptation" className="text-manga-text hover:text-midnight-primary-400 transition-colors font-medium">
                Anime Adaptation
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-2" ref={searchRef}>
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-manga-muted" />
                <input
                  type="text"
                  placeholder="Search manga, manhwa, or authors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  className="w-full pl-10 pr-10 py-2 bg-manga-surface border border-manga-border rounded-lg text-manga-text placeholder-manga-muted focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:border-transparent transition-colors"
                  aria-label="Search manga, manhwa, or authors"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-manga-border rounded transition-colors"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className="h-4 w-4 text-manga-muted" />
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {showResults && (query || results.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-manga-card border border-manga-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
                    >
                      {isSearching ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-midnight-primary-500 mx-auto"></div>
                          <p className="text-sm text-manga-muted mt-2">Searching...</p>
                        </div>
                      ) : results.length > 0 ? (
                        <div className="py-2">
                          {results.slice(0, 8).map((series) => (
                            <Link
                              key={series.id}
                              to={`/series/${series.id}`}
                              onClick={handleResultClick}
                              className="block px-4 py-3 hover:bg-manga-surface transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={series.coverImage}
                                  alt={series.title}
                                  className="w-10 h-14 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-manga-text truncate">
                                    {series.title}
                                  </h4>
                                  <p className="text-xs text-manga-muted">
                                    by {series.author}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : query ? (
                        <div className="p-4 text-center">
                          <p className="text-sm text-manga-muted">No results found</p>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="flex lg:hidden items-center flex-1 max-w-[200px] mx-1" ref={searchRef}>
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-manga-muted" />
                <input
                  type="text"
                  placeholder="Search manga, manhwa, or authors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  className="w-full pl-8 pr-8 py-2 bg-manga-surface border border-manga-border rounded-lg text-manga-text placeholder-manga-muted focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:border-transparent transition-colors text-sm"
                  aria-label="Search manga, manhwa, or authors"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-manga-border rounded transition-colors"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className="h-3 w-3 text-manga-muted" />
                  </button>
                )}
                
                {/* Mobile Search Results Dropdown */}
                <AnimatePresence>
                  {showResults && (query || results.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-manga-card border border-manga-border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
                    >
                      {isSearching ? (
                        <div className="p-3 text-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-midnight-primary-500 mx-auto"></div>
                          <p className="text-xs text-manga-muted mt-2">Searching...</p>
                        </div>
                      ) : results.length > 0 ? (
                        <div className="py-1">
                          {results.slice(0, 5).map((series) => (
                            <Link
                              key={series.id}
                              to={`/series/${series.id}`}
                              onClick={handleResultClick}
                              className="block px-3 py-2 hover:bg-manga-surface transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={series.coverImage}
                                  alt={series.title}
                                  className="w-8 h-10 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-medium text-manga-text truncate">
                                    {series.title}
                                  </h4>
                                  <p className="text-xs text-manga-muted truncate">
                                    by {series.author}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : query ? (
                        <div className="p-3 text-center">
                          <p className="text-xs text-manga-muted">No results found</p>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Notification Icon */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 rounded-lg bg-manga-surface hover:bg-manga-border transition-colors relative"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                  title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
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
                                    : 'bg-midnight-primary-50 hover:bg-midnight-primary-100'
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
                aria-label="Open profile dashboard"
                title="Open profile dashboard"
              >
                <UserIcon className="h-6 w-6 text-manga-text" />
              </button>
            </div>
          </div>
        </div>
      </nav>



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
                  aria-label="Close profile dashboard"
                  title="Close profile dashboard"
                >
                  <XMarkIcon className="h-6 w-6 text-manga-text" />
                </button>
              </div>

              <div className="space-y-4">
                {user ? (
                  <>
                    {/* User Profile Section */}
                    <div className="p-4 bg-manga-surface rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-midnight-primary-500 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-manga-text">{user.username}</p>
                          <p className="text-sm text-manga-muted">{user.email}</p>
                        </div>
                      </div>
                      {/* Rank and Genre Flairs */}
                      <UserFlairs 
                        key={`${user.id}-${flairUpdateKey}`}
                        userId={user.id} 
                        variant="dashboard" 
                      />
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
                
                {/* Flair Manager - Only for signed-in users */}
                {user && (
                  <div className="mt-4 pt-4 border-t border-manga-border">
                    <FlairManager 
                      userId={user.id} 
                      onFlairsUpdated={handleFlairsUpdated}
                    />
                  </div>
                )}
                
                {/* Surprise Me Button - Available for all users */}
                <div className="mt-4 pt-4 border-t border-manga-border">
                  <button
                    onClick={handleSurpriseMe}
                    disabled={isSurpriseMeRolling}
                    className={`flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors w-full text-left ${
                      isSurpriseMeRolling ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label="Surprise me"
                    aria-busy={isSurpriseMeRolling}
                  >
                    <span className={`mr-3 text-lg ${isSurpriseMeRolling ? 'dice-rolling' : ''}`}>🎲</span>
                    {isSurpriseMeRolling ? 'Rolling...' : 'Surprise me'}
                  </button>
                </div>
                
                {/* Sign Out Button - Only for signed-in users */}
                {user && (
                  <div className="mt-4 pt-4 border-t border-manga-border">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-3 rounded-lg text-midnight-accent-500 hover:bg-midnight-accent-500/10 hover:text-midnight-accent-400 transition-colors w-full text-left"
                      aria-label="Sign out"
                    >
                      <span className="mr-3 text-lg">🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col min-h-screen">
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      
      {/* Dice rolling animation styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes diceRoll {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(90deg) scale(1.1); }
            50% { transform: rotate(180deg) scale(1); }
            75% { transform: rotate(270deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
          
          .dice-rolling {
            animation: diceRoll 0.3s linear infinite;
          }
        `
      }} />
    </div>
  );
};

export default Layout;
