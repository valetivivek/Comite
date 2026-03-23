// Copyright © 2025 Vishnu Vivek Valeti. All rights reserved.
// Licensed under ComiTe Proprietary License 1.0. See LICENSE.txt.

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  ClockIcon,
  BellIcon,
  BookmarkIcon,
  BookOpenIcon,
  CheckCircleIcon,
  HomeIcon,
  FireIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { User, Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { useNavSearch } from '../hooks/useNavSearch';
import UserFlairs from './UserFlairs';
import FlairManager from './FlairManager';
import LazyImage from './LazyImage';
import DestructiveTextButton from './DestructiveTextButton';
import Footer from './Footer';
import { useDialogAccessibility } from '../hooks/useDialogAccessibility';
import BrandLogo from './BrandLogo';
import { cn } from '@/lib/utils';
import ExpandableSearchBar from '@/components/ui/expandable-search-bar';
import { MagnetizeButton } from '@/components/ui/magnetize-button';

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
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const [flairUpdateKey, setFlairUpdateKey] = useState(0);
  const [showEasterGif, setShowEasterGif] = useState(false);
  const [surpriseMessage, setSurpriseMessage] = useState<string | null>(null);
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
    handleResultClick,
  } = useNavSearch();

  const primaryNavItems = [
    { to: '/', label: 'Browse', end: true, icon: HomeIcon, gradient: 'radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 70%)' },
    { to: '/popular', label: 'Popular', end: false, icon: FireIcon, gradient: 'radial-gradient(circle, rgba(234,179,8,0.14) 0%, transparent 70%)' },
    { to: '/new-releases', label: 'New Releases', end: false, icon: SparklesIcon, gradient: 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)' },
    { to: '/history', label: 'History', end: false, icon: ClockIcon, gradient: 'radial-gradient(circle, rgba(155,170,114,0.14) 0%, transparent 70%)' },
  ];

  const closeProfileDrawer = () => setIsProfileDrawerOpen(false);
  const closeEasterGif = () => setShowEasterGif(false);

  useDialogAccessibility({
    isOpen: isProfileDrawerOpen,
    isEnabled: !showEasterGif,
    onClose: closeProfileDrawer,
    containerRef: profileDrawerRef,
  });

  useDialogAccessibility({
    isOpen: showEasterGif,
    onClose: closeEasterGif,
    containerRef: easterGifDialogRef,
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
        setUnreadCount(notificationData.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    loadNotifications();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    await dataService.markNotificationAsRead(notification.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setIsNotificationOpen(false);
    if (notification.chapterId) {
      navigate(`/series/${notification.seriesId}/chapter/${notification.chapterId}`);
    } else {
      navigate(`/series/${notification.seriesId}`);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    await Promise.all(unread.map((n) => dataService.markNotificationAsRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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

    setIsSurpriseMeRolling(true);
    try {
      const [selectedSeries] = await Promise.all([
        user
          ? dataService.getPersonalizedSurpriseSeries(user.id)
          : dataService.getRandomSeries(),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      const maxWait = new Promise((resolve) => setTimeout(resolve, 1500));
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
    setFlairUpdateKey((prev) => prev + 1);
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


  return (
    <div className="min-h-screen bg-manga-bg">
      {/* ── Top Navigation Bar ── */}
      <nav className="navbar-container">
        <div className="mobile-container">
          <div className="flex items-center h-14">
            {/* Logo */}
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/?page=1', { replace: true, state: { resetHome: true } });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 flex-shrink-0"
            >
              <BrandLogo variant="mark" className="h-7 w-7" />
              <span className="text-[1.25rem] font-semibold tracking-[-0.03em] text-manga-text">
                <span style={{ fontFamily: "'CaskaydiaMono NF', monospace" }}>Comi</span>
                <span style={{ fontFamily: "'Hurmit NF', monospace" }}>Te</span>
              </span>
            </Link>

            {/* Desktop Nav Links — Animated Tabs */}
            <div className="hidden lg:flex items-center ml-6 xl:ml-10">
              {primaryNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className="py-2 relative"
                  onMouseEnter={() => setHoveredNavItem(item.to)}
                  onMouseLeave={() => setHoveredNavItem(null)}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        'px-5 py-2 relative duration-300 transition-colors hover:!text-manga-accent',
                        isActive ? 'text-manga-accent' : 'text-manga-muted'
                      )}>
                        <span className="relative z-10">{item.label}</span>
                        {hoveredNavItem === item.to && (
                          <motion.div
                            layoutId="nav-hover-bg"
                            className="absolute bottom-0 left-0 right-0 w-full h-full bg-manga-accent/10"
                            style={{ borderRadius: 6 }}
                          />
                        )}
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-manga-accent"
                        />
                      )}
                      {hoveredNavItem === item.to && (
                        <motion.div
                          layoutId="nav-hover"
                          className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-manga-accent"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right: Search + Notifications + Profile */}
            <div className="flex items-center gap-0.5">
              {/* Search */}
              <ExpandableSearchBar
                expandDirection="left"
                placeholder="Search titles or authors"
                value={query}
                onChange={(v) => {
                  setQuery(v);
                  setShowResults(true);
                }}
                onClear={clearSearch}
                width={340}
              >
                {/* Search results dropdown */}
                {showResults && (query || results.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-manga-card border border-manga-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-manga-accent mx-auto" />
                        <p className="text-sm text-manga-muted mt-2">Searching...</p>
                      </div>
                    ) : results.length > 0 ? (
                      <div className="py-1">
                        {results.slice(0, 8).map((series) => (
                          <Link
                            key={series.id}
                            to={`/series/${series.id}`}
                            onClick={() => handleResultClick()}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-manga-surface transition-colors"
                          >
                            <LazyImage
                              src={series.coverImage}
                              alt={series.title}
                              className="w-9 h-12 rounded"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium text-manga-text truncate">
                                {series.title}
                              </h4>
                              <p className="text-xs text-manga-muted">by {series.author}</p>
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
              </ExpandableSearchBar>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="navbar-icon-btn"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                  aria-haspopup="dialog"
                  aria-expanded={isNotificationOpen}
                  aria-controls="notifications-panel"
                  title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-manga-accent text-manga-on-accent text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      id="notifications-panel"
                      role="region"
                      aria-label="Notifications"
                      className="absolute right-0 top-full mt-2 w-80 bg-manga-card border border-manga-border rounded-xl shadow-xl z-50"
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
                          <p className="text-manga-muted text-sm text-center py-4">
                            No notifications
                          </p>
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
                                    <div
                                      className={`mt-0.5 h-8 w-8 flex items-center justify-center rounded-lg flex-shrink-0 ${
                                        notification.isRead
                                          ? 'bg-manga-surface border border-manga-border'
                                          : 'bg-manga-accent text-manga-on-accent'
                                      }`}
                                    >
                                      {notification.type === 'new_chapter' ? (
                                        <BookOpenIcon
                                          className={`h-5 w-5 ${notification.isRead ? 'text-manga-accent' : 'text-manga-on-accent'}`}
                                        />
                                      ) : (
                                        <CheckCircleIcon
                                          className={`h-5 w-5 ${notification.isRead ? 'text-manga-accent' : 'text-manga-on-accent'}`}
                                        />
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

              {/* Profile */}
              <button
                onClick={() => setIsProfileDrawerOpen(true)}
                className="navbar-icon-btn"
                aria-label="Open profile dashboard"
                aria-haspopup="dialog"
                aria-expanded={isProfileDrawerOpen}
                title="Open profile dashboard"
              >
                <UserIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Profile Dashboard Drawer ── */}
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
                <h2 id="profile-drawer-title" className="text-xl font-bold text-manga-text">
                  Dashboard
                </h2>
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
                      {isAdmin ? (
                        <div className="flex items-center gap-2 mt-2" aria-label="Admin badges">
                          {isOwner && (
                            <span className="theme-chip theme-chip-info px-2 py-1 text-xs">
                              Owner
                            </span>
                          )}
                          <span className="theme-chip theme-chip-danger px-2 py-1 text-xs">
                            Admin
                          </span>
                        </div>
                      ) : (
                        <UserFlairs
                          key={`${user.id}-${flairUpdateKey}`}
                          userId={user.id}
                          variant="dashboard"
                        />
                      )}
                    </div>

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

                {/* Flair Manager */}
                {user && !isAdmin && !isOwner && (
                  <div className="mt-4 pt-4 border-t border-manga-border">
                    <FlairManager userId={user.id} onFlairsUpdated={handleFlairsUpdated} />
                  </div>
                )}

                {/* Sign Out */}
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

                {/* Surprise Me — MagnetizeButton */}
                <div className="mt-4 pt-4 border-t border-manga-border">
                  <MagnetizeButton
                    onClick={handleSurpriseMe}
                    isLoading={isSurpriseMeRolling}
                    aria-label="Surprise me"
                    aria-busy={isSurpriseMeRolling}
                    particleCount={14}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex flex-col min-h-screen">
        <main id="main" className="flex-1 pb-16 lg:pb-0">
          {children}
        </main>
        <Footer />
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="mobile-bottom-bar lg:hidden" aria-label="Mobile navigation">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `mobile-bottom-link group ${isActive ? 'mobile-bottom-link-active' : ''}`
            }
          >
            <span
              className="navbar-link-glow"
              style={{ background: item.gradient }}
              aria-hidden="true"
            />
            <item.icon className="h-5 w-5 relative z-10" />
            <span className="text-[0.625rem] font-medium relative z-10 leading-tight">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* ── Easter Egg GIF Overlay ── */}
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
              <h2 id="easter-gif-title" className="sr-only">
                Surprise video
              </h2>
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

      {/* ── Surprise Toast ── */}
      <AnimatePresence>
        {surpriseMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-4 left-1/2 z-[70] w-[min(90vw,28rem)] -translate-x-1/2"
          >
            <div
              className="card px-4 py-3 text-sm text-manga-text"
              role="status"
              aria-live="polite"
            >
              {surpriseMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dice rolling animation */}
      <style
        dangerouslySetInnerHTML={{
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
        `,
        }}
      />
    </div>
  );
};

export default Layout;
