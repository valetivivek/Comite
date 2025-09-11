import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  BookmarkIcon, 
  ClockIcon, 
  StarIcon,
  ArrowLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { User, UserRating, ReadingHistory, Bookmark } from '../types';
import { dataService } from '../services/dataService';

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('manga-reader-user');
        const ratingsData = localStorage.getItem('manga-reader-user-ratings');
        const historyData = localStorage.getItem('manga-reader-reading-history');

        if (userData) {
          setUser(JSON.parse(userData));
        }

        if (ratingsData) {
          setUserRatings(JSON.parse(ratingsData));
        }

        if (historyData) {
          setReadingHistory(JSON.parse(historyData));
        }

        // Load bookmarks from data service
        const bookmarksData = await dataService.getBookmarks();
        setBookmarks(bookmarksData);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('manga-reader-user');
    localStorage.removeItem('manga-reader-user-ratings');
    localStorage.removeItem('manga-reader-reading-history');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-manga-text mb-2">Not Logged In</h2>
          <p className="text-manga-muted mb-4">Please sign in to view your profile.</p>
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const recentHistory = readingHistory
    .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
    .slice(0, 10);

  const totalReadChapters = readingHistory.length;
  const averageRating = userRatings.length > 0 
    ? userRatings.reduce((sum, rating) => sum + rating.rating, 0) / userRatings.length 
    : 0;

  return (
    <div className="min-h-screen bg-manga-bg">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center text-manga-muted hover:text-manga-text transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </Link>
            <h1 className="text-3xl font-bold text-manga-text">Profile</h1>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-manga-text mb-1">{user.username}</h2>
                <p className="text-manga-muted mb-2">{user.email}</p>
                <p className="text-sm text-manga-muted">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button className="p-2 hover:bg-manga-surface rounded-lg transition-colors">
                <Cog6ToothIcon className="h-5 w-5 text-manga-muted" />
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 text-center"
            >
              <BookmarkIcon className="h-8 w-8 text-teal-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-manga-text mb-1">
                {bookmarks.length}
              </h3>
              <p className="text-manga-muted">Bookmarked Series</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 text-center"
            >
              <ClockIcon className="h-8 w-8 text-teal-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-manga-text mb-1">
                {totalReadChapters}
              </h3>
              <p className="text-manga-muted">Chapters Read</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 text-center"
            >
              <StarIcon className="h-8 w-8 text-teal-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-manga-text mb-1">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </h3>
              <p className="text-manga-muted">Average Rating</p>
            </motion.div>
          </div>

          {/* Recent Reading History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-manga-text mb-4">Recent Reading History</h3>
            {recentHistory.length > 0 ? (
              <div className="space-y-3">
                {recentHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-3 bg-manga-surface rounded-lg"
                  >
                    <div>
                      <p className="text-manga-text font-medium">Chapter {history.chapterId.split('-').pop()}</p>
                      <p className="text-sm text-manga-muted">
                        {new Date(history.readAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-manga-muted">
                      {Math.round(history.progress * 100)}% complete
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-manga-muted text-center py-8">No reading history yet</p>
            )}
          </motion.div>

          {/* Saved Titles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-manga-text mb-4">Saved Titles</h3>
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bookmark) => (
                  <Link
                    key={bookmark.id}
                    to={`/series/${bookmark.seriesId}`}
                    className="block p-3 bg-manga-surface rounded-lg hover:bg-manga-border transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={bookmark.series.coverImage}
                        alt={bookmark.series.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-manga-text font-medium truncate">
                          {bookmark.series.title}
                        </h4>
                        <p className="text-sm text-manga-muted">
                          {bookmark.series.author}
                        </p>
                        <p className="text-xs text-manga-muted">
                          {new Date(bookmark.lastReadAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-manga-muted text-center py-8">No saved titles yet</p>
            )}
          </motion.div>

          {/* User Ratings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6"
          >
            <h3 className="text-xl font-bold text-manga-text mb-4">Your Ratings</h3>
            {userRatings.length > 0 ? (
              <div className="space-y-3">
                {userRatings.map((rating) => (
                  <div
                    key={rating.id}
                    className="flex items-center justify-between p-3 bg-manga-surface rounded-lg"
                  >
                    <div>
                      <p className="text-manga-text font-medium">Series {rating.seriesId.split('-').pop()}</p>
                      <p className="text-sm text-manga-muted">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarSolidIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < rating.rating ? 'text-yellow-400' : 'text-manga-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-manga-muted text-center py-8">No ratings yet</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
