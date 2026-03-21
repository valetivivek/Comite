// Copyright © 2025 Vishnu Vivek Valeti. All rights reserved.
// Licensed under ComiTe Proprietary License 1.0. See LICENSE.txt.

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  ClockIcon,
  BellIcon,
  BookmarkIcon,
  BookOpenIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { User, Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { useNavSearch } from '../hooks/useNavSearch';
import Footer from './Footer';
import UserFlairs from './UserFlairs';
import FlairManager from './FlairManager';
import LazyImage from './LazyImage';
import ThemeToggle from './ThemeToggle';
import DestructiveTextButton from './DestructiveTextButton';
import { useDialogAccessibility } from '../hooks/useDialogAccessibility';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user: authUser, isAdmin, isOwner, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSurpriseMeRolling, setIsSurpriseMeRolling] = useState(false);
  const [flairUpdateKey, setFlairUpdateKey] = useState(0);
  const [showEasterGif, setShowEasterGif] = useState(false);
  const [surpriseMessage, setSurpriseMessage] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileDrawerRef = useRef<HTMLDivElement>(null);
  const easterGifDialogRef = useRef<HTMLDivElement>(null);
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
  const primaryNavItems = [
    { to: '/', label: 'Browse', end: true },
    { to: '/popular', label: 'Popular' },
    { to: '/new-releases', label: 'New Releases' },
    { to: '/history', label: 'History' }
  ];

  const closeProfileDrawer = () => setIsProfileDrawerOpen(false);
  const closeEasterGif = () => setShowEasterGif(false);

  useDialogAccessibility({
    isOpen: isProfileDrawerOpen,
    isEnabled: !showEasterGif,
    onClose: closeProfileDrawer,
    containerRef: profileDrawerRef
  });

  useDialogAccessibility({
    isOpen: showEasterGif,
    onClose: closeEasterGif,
    containerRef: easterGifDialogRef
  });

  useEffect(() => {
    const userData = localStorage.getItem('manga-reader-user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, [authUser]);

  useEffect(() => {
    if (!surpriseMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSurpriseMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [surpriseMessage]);

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
      navigate(`/series/${notification.seriesId}/chapter/${notification.chapterId}`);
    } else {
      navigate(`/series/${notification.seriesId}`);
    }
  };

  const markAllNotificationsAsRead = async () => {
    // Mark all unread notifications as read in service and state
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    await Promise.all(unread.map(n => dataService.markNotificationAsRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleSurpriseMe = async () => {
    if (isSurpriseMeRolling) return;

    if (isAdmin || isOwner) {
      if (Math.random() < 0.5) {
        setShowEasterGif(true);
      } else {
        setSurpriseMessage('Try the search bar for a precise pick.');
      }
      return;
    }

    // Easter egg for admins/owner
    if (isAdmin || isOwner) {
      if (Math.random() < 0.5) {
        // Show Rickroll GIF inline to avoid autoplay restrictions
        setShowEasterGif(true);
      } else {
        alert("Why don't you search it up yourself? 😉");
      }
      return;
    }
    
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

      if (!selectedSeries) {
        setSurpriseMessage('No series is available for a surprise pick right now.');
        return;
      }

      if (selectedSeries) {
        navigate(`/series/${selectedSeries.id}`);
        closeProfileDrawer();
      }
    } catch (error) {
      console.error('Error getting surprise series:', error);
      setSurpriseMessage('Could not load a surprise pick. Try again.');
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
    logout();
    setUser(null);
    closeProfileDrawer();
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
      <nav className="static z-50 bg-manga-card border-b border-manga-border">
        <div className="mobile-container py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Wordmark */}
            <div className="min-w-0">
              <Link 
                to="/" 
                onClick={(e) => { e.preventDefault(); navigate('/?page=1', { replace: true, state: { resetHome: true } }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group relative inline-flex flex-col"
              >
                <span
                  className="pointer-events-none absolute inset-x-3 top-2 h-7 rounded-full bg-manga-accent/25 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="relative bg-gradient-to-r from-manga-accent-light via-manga-accent to-manga-warning bg-clip-text font-heading text-[1.95rem] font-semibold tracking-[-0.04em] text-transparent drop-shadow-[0_0_24px_rgba(180,83,9,0.2)] transition-transform duration-300 group-hover:scale-[1.02] sm:text-[2.2rem]">
                  ComiTe
                </span>
              </Link>
              <p className="eyebrow mt-1 hidden sm:block">
                Read manga, manhwa & comics without losing your place
              </p>
            </div>

            {/* Primary Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-1 rounded-full border border-manga-border/70 bg-manga-surface/80 p-1 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.8)] backdrop-blur">
              {primaryNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-[0.95rem] font-medium tracking-[0.01em] transition-all duration-200 ${
                      isActive
                        ? 'bg-manga-card text-manga-accent shadow-[0_10px_25px_-18px_rgba(99,102,241,0.9)]'
                        : 'text-manga-muted hover:bg-manga-card hover:text-manga-text'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-2" ref={searchRef}>
              <div className="relative w-full overflow-hidden rounded-full border border-manga-border/70 bg-manga-surface/85 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.85)] backdrop-blur">
                <span className="pointer-events-none absolute inset-y-2 left-8 w-px bg-manga-border/70" aria-hidden="true" />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-manga-muted" />
                <input
                  type="text"
                  placeholder="Search titles or authors"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  className="w-full bg-transparent py-2.5 pl-12 pr-10 text-manga-text placeholder-manga-muted transition-colors focus:outline-none focus:ring-2 focus:ring-manga-accent/70"
                  aria-label="Search titles or authors"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1.5 transition-colors hover:bg-manga-border"
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
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-manga-accent mx-auto"></div>
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
                                <LazyImage
                                  src={series.coverImage}
                                  alt={series.title}
                                  className="w-10 h-14 rounded"
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
              <div className="relative w-full overflow-hidden rounded-full border border-manga-border/70 bg-manga-surface/85 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.85)] backdrop-blur">
                <span className="pointer-events-none absolute inset-y-2 left-7 w-px bg-manga-border/70" aria-hidden="true" />
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-manga-muted" />
                <input
                  type="text"
                  placeholder="Search titles or authors"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  className="w-full bg-transparent py-2 pl-9 pr-8 text-sm text-manga-text placeholder-manga-muted transition-colors focus:outline-none focus:ring-2 focus:ring-manga-accent/70"
                  aria-label="Search titles or authors"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-manga-border"
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
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-manga-accent mx-auto"></div>
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
                                <LazyImage
                                  src={series.coverImage}
                                  alt={series.title}
                                  className="w-8 h-10 rounded"
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
            <div className="flex items-center gap-1 rounded-full border border-manga-border/70 bg-manga-surface/80 p-1 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.8)] backdrop-blur sm:gap-1.5">
              {/* Theme Toggle */}
              <ThemeToggle size="md" />
              
              {/* Notification Icon */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 rounded-lg bg-manga-surface hover:bg-manga-border transition-colors relative"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                  aria-haspopup="dialog"
                  aria-expanded={isNotificationOpen}
                  aria-controls="notifications-panel"
                  title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <BellIcon className="h-6 w-6 text-manga-text" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-manga-accent text-manga-on-accent text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
                      id="notifications-panel"
                      role="region"
                      aria-label="Notifications"
                      className="absolute right-0 top-full mt-2 w-80 bg-manga-card border border-manga-border rounded-lg shadow-xl z-50"
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-manga-text">Notifications</h3>
                          <div className="flex items-center space-x-1">
                            {notifications.length > 0 && (
                              <>
                                <button
                                  onClick={markAllNotificationsAsRead}
                                  className="text-xs text-manga-muted hover:text-manga-text px-2 py-1 rounded hover:bg-manga-surface transition-colors"
                                  title="Mark all as read"
                                >
                                  Mark all read
                                </button>
                                <button
                                  onClick={clearAllNotifications}
                                  className="text-xs text-manga-muted hover:text-manga-text px-2 py-1 rounded hover:bg-manga-surface transition-colors"
                                >
                                  Clear All
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setIsNotificationOpen(false)}
                              className="text-manga-muted hover:text-manga-text p-1 rounded hover:bg-manga-surface"
                              aria-label="Close notifications"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {notifications.length === 0 ? (
                          <p className="text-manga-muted text-sm text-center py-4">No notifications</p>
                        ) : (
                          <ul className="space-y-2 max-h-72 overflow-y-auto">
                            <AnimatePresence initial={false}>
                              {notifications.slice(0, 8).map((notification) => (
                                <motion.li
                                  key={notification.id}
                                  initial={{ opacity: 0, y: -6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }}
                                >
                                  <button
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                                      notification.isRead 
                                        ? 'bg-manga-surface hover:bg-manga-border border-manga-border' 
                                        : 'bg-manga-accent/10 hover:bg-manga-accent/15 border-manga-accent/20'
                                    } active:scale-[0.99]`}
                                  >
                                    <div className={`mt-0.5 h-8 w-8 flex items-center justify-center rounded-lg flex-shrink-0 ${notification.isRead ? 'bg-manga-surface border border-manga-border' : 'bg-manga-accent text-manga-on-accent'} `}>
                                      {notification.type === 'new_chapter' ? (
                                        <BookOpenIcon className={`h-5 w-5 ${notification.isRead ? 'text-manga-accent' : 'text-manga-on-accent'}`} />
                                      ) : (
                                        <CheckCircleIcon className={`h-5 w-5 ${notification.isRead ? 'text-manga-accent' : 'text-manga-on-accent'}`} />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-manga-text truncate">
                                        {notification.seriesTitle}
                                      </p>
                                      <p className="text-xs text-manga-text-secondary line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="text-[11px] text-manga-muted mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </button>
                                </motion.li>
                              ))}
                            </AnimatePresence>
                          </ul>
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
                aria-haspopup="dialog"
                aria-expanded={isProfileDrawerOpen}
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
            className="theme-backdrop fixed inset-0 z-50"
            onClick={closeProfileDrawer}
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
            ref={profileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-drawer-title"
            tabIndex={-1}
            className="fixed right-0 top-0 bottom-0 w-72 sm:w-80 bg-manga-card shadow-xl z-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 id="profile-drawer-title" className="text-xl font-bold text-manga-text">Dashboard</h2>
                <button
                  type="button"
                  onClick={closeProfileDrawer}
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
                        <div className="w-12 h-12 bg-manga-accent rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-manga-on-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-manga-text">{user.username}</p>
                          <p className="text-sm text-manga-muted">{user.email}</p>
                        </div>
                      </div>
                      {/* Admin/Owner badges or user flairs */}
                      {isAdmin ? (
                        <div className="flex items-center gap-2 mt-2" aria-label="Admin badges">
                          {isOwner && (
                            <span className="theme-chip theme-chip-info px-2 py-1 text-xs">Owner</span>
                          )}
                          <span className="theme-chip theme-chip-danger px-2 py-1 text-xs">Admin</span>
                        </div>
                      ) : (
                        <UserFlairs 
                          key={`${user.id}-${flairUpdateKey}`}
                          userId={user.id} 
                          variant="dashboard" 
                        />
                      )}
                    </div>

                    {/* Dashboard Options */}
                    <div className="space-y-2">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={closeProfileDrawer}
                          className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                        >
                          <UserIcon className="mr-3 h-5 w-5" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/bookmarks"
                        onClick={closeProfileDrawer}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <BookmarkIcon className="mr-3 h-5 w-5" />
                        Bookmarks
                      </Link>
                      <Link
                        to="/profile"
                        onClick={closeProfileDrawer}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <UserIcon className="mr-3 h-5 w-5" />
                        Profile Settings
                      </Link>
                      <Link
                        to="/settings"
                        onClick={closeProfileDrawer}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <UserIcon className="mr-3 h-5 w-5" />
                        App Settings
                      </Link>
                      <Link
                        to="/history"
                        onClick={closeProfileDrawer}
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
                        onClick={closeProfileDrawer}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <UserIcon className="mr-3 h-5 w-5" />
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={closeProfileDrawer}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <UserIcon className="mr-3 h-5 w-5" />
                        Sign Up
                      </Link>
                      <Link
                        to="/history"
                        onClick={closeProfileDrawer}
                        className="flex items-center px-4 py-3 rounded-lg text-manga-text hover:bg-manga-surface transition-colors"
                      >
                        <ClockIcon className="mr-3 h-5 w-5" />
                        Reading History
                      </Link>
                    </div>
                  </>
                )}
                
                {/* Flair Manager - hide for admin/owner */}
                {user && !isAdmin && !isOwner && (
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
                  <div className="mt-4 border-t border-manga-border px-4 pt-4">
                    <DestructiveTextButton
                      onClick={handleSignOut}
                      className="w-full justify-start py-2 text-left"
                      aria-label="Sign out"
                    >
                      <span className="mr-3 text-lg">🚪</span>
                      Sign Out
                    </DestructiveTextButton>
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

      {/* Admin/Owner Easter GIF Overlay */}
      <AnimatePresence>
        {showEasterGif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="theme-backdrop-strong fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={closeEasterGif}
            role="dialog"
            aria-modal="true"
            aria-labelledby="easter-gif-title"
          >
            <div
              ref={easterGifDialogRef}
              className="max-w-[600px] w-full"
              tabIndex={-1}
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="easter-gif-title" className="sr-only">Surprise video</h2>
              <div className="relative">
                <button
                  className="absolute -top-3 -right-3 bg-manga-card border border-manga-border rounded-full p-2"
                  type="button"
                  onClick={closeEasterGif}
                  aria-label="Close surprise video"
                >
                  <XMarkIcon className="h-5 w-5 text-manga-text" />
                </button>
                <img
                  src="https://media.giphy.com/media/Vuw9m5wXviFIQ/giphy.gif"
                  alt="Rick Astley dancing"
                  className="w-full h-auto rounded-lg border border-manga-border shadow-xl"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {surpriseMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-4 left-1/2 z-[70] w-[min(90vw,28rem)] -translate-x-1/2"
          >
            <div className="card px-4 py-3 text-sm text-manga-text" role="status" aria-live="polite">
              {surpriseMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
