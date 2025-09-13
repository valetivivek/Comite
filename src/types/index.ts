export interface Series {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  tags: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  genre: string[];
  rating: number;
  totalChapters: number;
  lastUpdated: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  seriesId: string;
  title: string;
  chapterNumber: number;
  pages: string[];
  publishedAt: string;
  isRead: boolean;
  readAt?: string;
}

export interface Bookmark {
  id: string;
  seriesId: string;
  series: Series;
  lastReadChapterId?: string;
  lastReadAt: string;
  isCompleted: boolean;
}

export interface ReadState {
  seriesId: string;
  chapterId: string;
  readAt: string;
  progress: number; // 0-1
}

export interface Notification {
  id: string;
  type: 'new_chapter' | 'series_update';
  seriesId: string;
  seriesTitle: string;
  chapterId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  genre: string[];
  status: string[];
  sortBy: 'title' | 'lastUpdated' | 'rating' | 'totalChapters';
  sortOrder: 'asc' | 'desc';
}

export interface ViewMode {
  type: 'list' | 'grid';
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark';
  viewMode: 'list' | 'grid';
  itemsPerPage: number;
  autoMarkAsRead: boolean;
  notifications: boolean;
  selectedFlairs: string[]; // User's manually selected genre flairs
}

export interface UserRating {
  id: string;
  userId: string;
  seriesId: string;
  rating: number; // 1-5
  createdAt: string;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  seriesId: string;
  chapterId: string;
  readAt: string;
  progress: number; // 0-1
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  avatar?: string;
  likes: number;
  likedBy: string[]; // Array of user IDs who liked this comment
  images?: string[]; // Array of image URLs
  parentId?: string; // For nested replies
  replies?: Comment[]; // Nested replies
}

export interface AppState {
  series: Series[];
  bookmarks: Bookmark[];
  readStates: ReadState[];
  notifications: Notification[];
  searchFilters: SearchFilters;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  userRatings: UserRating[];
  readingHistory: ReadingHistory[];
}
