import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  BookmarkIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { User } from '../types';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('manga-reader-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Bookmarks', href: '/bookmarks', icon: BookmarkIcon },
  ];

  return (
    <div className="min-h-screen bg-manga-bg">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
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
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
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
            className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-manga-card shadow-xl z-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold text-teal-500">Manga Reader</h1>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-teal-600 text-white'
                          : 'text-manga-muted hover:bg-manga-surface hover:text-manga-text'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
                
                {/* Auth Links */}
                <div className="border-t border-manga-border pt-2 mt-4">
                  {user ? (
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === '/profile'
                          ? 'bg-teal-600 text-white'
                          : 'text-manga-muted hover:bg-manga-surface hover:text-manga-text'
                      }`}
                    >
                      <UserIcon className="mr-3 h-5 w-5" />
                      Profile
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-manga-muted hover:bg-manga-surface hover:text-manga-text"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-manga-muted hover:bg-manga-surface hover:text-manga-text"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-manga-card lg:shadow-lg lg:z-30">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <h1 className="text-xl font-bold text-teal-500">Manga Reader</h1>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors jitter-hover ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-manga-muted hover:bg-manga-surface hover:text-manga-text'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Auth Links */}
            <div className="border-t border-manga-border pt-2 mt-4">
              {user ? (
                <Link
                  to="/profile"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors jitter-hover ${
                    location.pathname === '/profile'
                      ? 'bg-teal-600 text-white'
                      : 'text-manga-muted hover:bg-manga-surface hover:text-manga-text'
                  }`}
                >
                  <UserIcon className="mr-3 h-5 w-5" />
                  Profile
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors jitter-hover text-manga-muted hover:bg-manga-surface hover:text-manga-text"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors jitter-hover text-manga-muted hover:bg-manga-surface hover:text-manga-text"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
