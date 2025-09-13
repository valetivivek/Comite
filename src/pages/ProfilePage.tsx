import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  BookmarkIcon, 
  ClockIcon, 
  StarIcon,
  ArrowLeftIcon,
  Cog6ToothIcon,
  CameraIcon,
  PencilIcon,
  XMarkIcon
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
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tempPicture, setTempPicture] = useState<string>('');
  const [tempDescription, setTempDescription] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('manga-reader-user');
        const ratingsData = localStorage.getItem('manga-reader-user-ratings');
        const historyData = localStorage.getItem('manga-reader-reading-history');

        if (userData) {
          const user = JSON.parse(userData);
          setUser(user);
          setProfilePicture(user.avatar || '');
          setDescription(user.description || '');
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

  const handleEditProfile = () => {
    setTempPicture(profilePicture);
    setTempDescription(description);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (user) {
      const updatedUser = {
        ...user,
        avatar: tempPicture,
        description: tempDescription
      };
      setUser(updatedUser);
      setProfilePicture(tempPicture);
      setDescription(tempDescription);
      localStorage.setItem('manga-reader-user', JSON.stringify(updatedUser));
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setTempPicture(profilePicture);
    setTempDescription(description);
    setIsEditing(false);
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempPicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-midnight-primary-600"></div>
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
              {/* Profile Picture */}
              <div className="relative">
                {isEditing ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-manga-surface border-2 border-manga-border">
                    {tempPicture ? (
                      <img
                        src={tempPicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="h-10 w-10 text-manga-muted" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-midnight-primary-600 flex items-center justify-center">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-10 w-10 text-white" />
                    )}
                  </div>
                )}
                
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-midnight-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-midnight-primary-700 transition-colors">
                    <CameraIcon className="h-3 w-3 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-manga-text mb-1">{user.username}</h2>
                <p className="text-manga-muted mb-2">{user.email}</p>
                <p className="text-sm text-manga-muted mb-3">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
                
                {/* Description */}
                {isEditing ? (
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 bg-manga-surface border border-manga-border rounded-lg text-manga-text placeholder-manga-muted focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-manga-text text-sm">
                    {description || "No description provided"}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="p-2 bg-midnight-primary-600 hover:bg-midnight-primary-700 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-manga-surface hover:bg-manga-border rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 text-manga-muted" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditProfile}
                    className="p-2 hover:bg-manga-surface rounded-lg transition-colors"
                  >
                    <Cog6ToothIcon className="h-5 w-5 text-manga-muted" />
                  </button>
                )}
              </div>
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
              <BookmarkIcon className="h-8 w-8 text-midnight-primary-500 mx-auto mb-2" />
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
              <ClockIcon className="h-8 w-8 text-midnight-primary-500 mx-auto mb-2" />
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
              <StarIcon className="h-8 w-8 text-midnight-primary-500 mx-auto mb-2" />
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
