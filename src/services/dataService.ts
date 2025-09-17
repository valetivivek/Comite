// Copyright © 2025 Vishnu Vivek Valeti. All rights reserved.
// Licensed under ComiTe Proprietary License 1.0. See LICENSE.txt.

import { Series, Chapter, Bookmark, ReadState, Notification, SearchFilters, UserRating, ReadingHistory } from '../types';

class DataService {
  private series: Series[] = [];
  private bookmarks: Bookmark[] = [];
  private readStates: ReadState[] = [];
  private notifications: Notification[] = [];
  private userRatings: UserRating[] = [];
  private readingHistory: ReadingHistory[] = [];

  constructor() {
    this.loadFromStorage();
    // If no data present, seed demo/sample content
    if (!Array.isArray(this.series) || this.series.length === 0) {
      this.seedDemoData();
      this.saveToStorage();
    }
  }

  // Series methods
  async getSeries(): Promise<Series[]> {
    return [...this.series];
  }

  async addSeries(newSeries: Series): Promise<Series> {
    this.series.unshift(newSeries);
    this.saveToStorage();
    return newSeries;
  }

  async updateSeries(updated: Series): Promise<Series | null> {
    const index = this.series.findIndex(s => s.id === updated.id);
    if (index === -1) return null;
    this.series[index] = { ...this.series[index], ...updated, lastUpdated: new Date().toISOString() };
    this.saveToStorage();
    return this.series[index];
  }

  async getSeriesById(id: string): Promise<Series | null> {
    return this.series.find(s => s.id === id) || null;
  }

  async getRandomSeries(): Promise<Series | null> {
    if (this.series.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.series.length);
    return this.series[randomIndex];
  }

  async getPersonalizedSurpriseSeries(userId: string): Promise<Series | null> {
    if (this.series.length === 0) return null;

    // Get user's reading history to find read series
    const userHistory = this.readingHistory.filter(h => h.userId === userId);
    const readSeriesIds = new Set(userHistory.map(h => h.seriesId));


    // Filter to unread series only
    const unreadSeries = this.series.filter(s => !readSeriesIds.has(s.id));

    if (unreadSeries.length === 0) return null;

    // Calculate genre distribution from user's reading history
    const genreCounts: { [key: string]: number } = {};
    userHistory.forEach(history => {
      const series = this.series.find(s => s.id === history.seriesId);
      if (series) {
        series.genre.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    // Find least-read genres (inverse weighting)
    const allGenres = [...new Set(this.series.flatMap(s => s.genre))];
    const genreWeights: { [key: string]: number } = {};
    
    allGenres.forEach(genre => {
      const count = genreCounts[genre] || 0;
      // Inverse weighting: less read = higher weight
      genreWeights[genre] = 1 / (count + 1);
    });

    // Score unread series based on least-read genres
    const scoredSeries = unreadSeries.map(series => {
      let score = 0;
      series.genre.forEach(genre => {
        score += genreWeights[genre] || 0;
      });
      return { series, score };
    });

    // Sort by score (highest first) and pick randomly from top candidates
    scoredSeries.sort((a, b) => b.score - a.score);
    
    // Take top 30% or at least 3 series for randomization
    const topCandidates = scoredSeries.slice(0, Math.max(3, Math.ceil(scoredSeries.length * 0.3)));
    
    if (topCandidates.length === 0) return unreadSeries[Math.floor(Math.random() * unreadSeries.length)];
    
    const randomIndex = Math.floor(Math.random() * topCandidates.length);
    return topCandidates[randomIndex].series;
  }

  async getPopularSeries(): Promise<Series[]> {
    // Calculate popularity based on reading history and engagement
    const seriesWithPopularity = this.series.map(series => {
      const seriesHistory = this.readingHistory.filter(h => h.seriesId === series.id);
      
      // Calculate popularity metrics
      const uniqueReaders = new Set(seriesHistory.map(h => h.userId)).size;
      const totalProgress = seriesHistory.reduce((sum, h) => sum + (h.progress || 0), 0);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentActivity = seriesHistory.filter(h => 
        new Date(h.readAt) > thirtyDaysAgo
      ).length;
      
      // Weighted popularity score
      const popularityScore = 
        (uniqueReaders * 2) +           // More readers = more popular
        (totalProgress * 0.5) +         // More reading = more popular
        (recentActivity * 1.5) +        // Recent activity = more popular
        (series.rating * 0.3);          // Higher rating = more popular
      
      return {
        ...series,
        popularityScore,
        uniqueReaders,
        totalProgress,
        recentActivity
      };
    });
    
    // Filter to only show series with significant engagement
    const engagedSeries = seriesWithPopularity.filter(series => 
      series.uniqueReaders > 0 &&           // Must have at least 1 reader
      series.totalProgress > 0.5 &&         // Must have significant reading progress
      series.popularityScore > 1            // Must have meaningful popularity score
    );
    
    // Sort by popularity score (descending) and return only engaged series
    return engagedSeries
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .map(({ popularityScore, uniqueReaders, totalProgress, recentActivity, ...series }) => series);
  }

  async searchSeries(filters: SearchFilters): Promise<Series[]> {
    let filtered = [...this.series];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(series => 
        series.title.toLowerCase().includes(query) ||
        series.author.toLowerCase().includes(query) ||
        series.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.genre.length > 0) {
      filtered = filtered.filter(series => 
        series.genre.some(g => filters.genre.includes(g))
      );
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(series => 
        filters.status.includes(series.status)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated);
          bValue = new Date(b.lastUpdated);
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'totalChapters':
          aValue = a.totalChapters;
          bValue = b.totalChapters;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  // Chapter methods
  async getChapter(seriesId: string, chapterId: string): Promise<Chapter | null> {
    const series = this.series.find(s => s.id === seriesId);
    if (!series) return null;
    
    return series.chapters.find(c => c.id === chapterId) || null;
  }

  async markChapterAsRead(seriesId: string, chapterId: string): Promise<void> {
    const series = this.series.find(s => s.id === seriesId);
    if (!series) return;

    const chapter = series.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    chapter.isRead = true;
    chapter.readAt = new Date().toISOString();

    // Update read state
    const existingReadState = this.readStates.find(rs => rs.seriesId === seriesId && rs.chapterId === chapterId);
    if (existingReadState) {
      existingReadState.readAt = new Date().toISOString();
      existingReadState.progress = 1;
    } else {
      this.readStates.push({
        seriesId,
        chapterId,
        readAt: new Date().toISOString(),
        progress: 1
      });
    }

    // Add to reading history
    const existingHistory = this.readingHistory.find(h => h.seriesId === seriesId && h.chapterId === chapterId);
    if (!existingHistory) {
      this.readingHistory.push({
        id: `history-${Date.now()}`,
        userId: 'current-user', // In a real app, this would be the actual user ID
        seriesId,
        chapterId,
        readAt: new Date().toISOString(),
        progress: 1
      });
    }

    this.saveToStorage();
  }

  // Bookmark methods
  async getBookmarks(): Promise<Bookmark[]> {
    return [...this.bookmarks];
  }

  async addBookmark(seriesId: string): Promise<void> {
    const series = this.series.find(s => s.id === seriesId);
    if (!series) return;

    const existingBookmark = this.bookmarks.find(b => b.seriesId === seriesId);
    if (existingBookmark) return;

    this.bookmarks.push({
      id: `bookmark-${Date.now()}`,
      seriesId,
      series,
      lastReadAt: new Date().toISOString(),
      isCompleted: false
    });

    this.saveToStorage();
  }

  async removeBookmark(seriesId: string): Promise<void> {
    this.bookmarks = this.bookmarks.filter(b => b.seriesId !== seriesId);
    this.saveToStorage();
  }

  async isBookmarked(seriesId: string): Promise<boolean> {
    return this.bookmarks.some(b => b.seriesId === seriesId);
  }

  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    return [...this.notifications];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveToStorage();
    }
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    this.saveToStorage();
  }

  // Mock notification generation (for demo purposes) - only for bookmarked series
  async generateMockNotification(seriesId: string): Promise<void> {
    const series = this.series.find(s => s.id === seriesId);
    if (!series) return;

    // Only generate notifications for bookmarked series
    const isBookmarked = this.bookmarks.some(b => b.seriesId === seriesId);
    if (!isBookmarked) return;

    // Get the latest chapter for redirection
    const latestChapter = series.chapters[0];

    // Check if notification already exists for this chapter
    const existingNotification = this.notifications.find(n => 
      n.seriesId === seriesId && 
      n.chapterId === latestChapter?.id &&
      n.type === 'new_chapter'
    );

    if (existingNotification) {
      return; // Don't create duplicate notifications
    }

    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'new_chapter',
      seriesId,
      seriesTitle: series.title,
      chapterId: latestChapter?.id,
      message: `New chapter ${latestChapter?.chapterNumber} available for ${series.title}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.unshift(notification);
    
    // Keep only the last 50 notifications to prevent storage bloat
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    this.saveToStorage();
  }

  // User Rating methods
  async submitRating(seriesId: string, rating: number): Promise<void> {
    const userId = 'current-user'; // In a real app, this would be the actual user ID
    
    // Remove existing rating if any
    this.userRatings = this.userRatings.filter(r => !(r.seriesId === seriesId && r.userId === userId));
    
    // Add new rating
    this.userRatings.push({
      id: `rating-${Date.now()}`,
      userId,
      seriesId,
      rating,
      createdAt: new Date().toISOString()
    });

    // Update series average rating
    const series = this.series.find(s => s.id === seriesId);
    if (series) {
      const allRatings = this.userRatings.filter(r => r.seriesId === seriesId);
      const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      series.rating = Math.round(averageRating * 10) / 10;
    }

    this.saveToStorage();
  }

  async getUserRating(seriesId: string): Promise<number | null> {
    const userId = 'current-user';
    const rating = this.userRatings.find(r => r.seriesId === seriesId && r.userId === userId);
    return rating ? rating.rating : null;
  }

  // Reading History methods
  async getReadingHistory(): Promise<ReadingHistory[]> {
    return [...this.readingHistory].sort((a, b) => 
      new Date(b.readAt).getTime() - new Date(a.readAt).getTime()
    );
  }

  async getSeriesProgress(seriesId: string): Promise<{ read: number; total: number }> {
    const series = this.series.find(s => s.id === seriesId);
    if (!series) return { read: 0, total: 0 };

    const readChapters = series.chapters.filter(ch => ch.isRead).length;
    return { read: readChapters, total: series.totalChapters };
  }

  // Storage methods
  private loadFromStorage(): void {
    try {
      const seriesData = localStorage.getItem('manga-reader-series');
      if (seriesData) {
        this.series = JSON.parse(seriesData);
      }

      const bookmarksData = localStorage.getItem('manga-reader-bookmarks');
      if (bookmarksData) {
        this.bookmarks = JSON.parse(bookmarksData);
      }

      const readStatesData = localStorage.getItem('manga-reader-read-states');
      if (readStatesData) {
        this.readStates = JSON.parse(readStatesData);
      }

      const notificationsData = localStorage.getItem('manga-reader-notifications');
      if (notificationsData) {
        this.notifications = JSON.parse(notificationsData);
      }

      const userRatingsData = localStorage.getItem('manga-reader-user-ratings');
      if (userRatingsData) {
        this.userRatings = JSON.parse(userRatingsData);
      }

      const readingHistoryData = localStorage.getItem('manga-reader-reading-history');
      if (readingHistoryData) {
        this.readingHistory = JSON.parse(readingHistoryData);
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  // User flair preferences methods
  async getUserFlairPreferences(_userId: string): Promise<string[]> {
    try {
      const userData = localStorage.getItem('manga-reader-user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.preferences?.selectedFlairs || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading user flair preferences:', error);
      return [];
    }
  }

  async saveUserFlairPreferences(_userId: string, selectedFlairs: string[]): Promise<boolean> {
    try {
      const userData = localStorage.getItem('manga-reader-user');
      if (userData) {
        const user = JSON.parse(userData);
        user.preferences = user.preferences || {};
        user.preferences.selectedFlairs = selectedFlairs;
        localStorage.setItem('manga-reader-user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving user flair preferences:', error);
      return false;
    }
  }

  async getEligibleGenres(userId: string): Promise<string[]> {
    try {
      // Get user's reading stats to find genres they've read
      const readingStatsService = (await import('./readingStatsService')).readingStatsService;
      const stats = readingStatsService.getUserStats(userId);
      
      if (!stats) return [];
      
      // Return genres they have at least 1 read in
      return Object.keys(stats.genreCounts).filter(genre => stats.genreCounts[genre] > 0);
    } catch (error) {
      console.error('Error getting eligible genres:', error);
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('manga-reader-series', JSON.stringify(this.series));
      localStorage.setItem('manga-reader-bookmarks', JSON.stringify(this.bookmarks));
      localStorage.setItem('manga-reader-read-states', JSON.stringify(this.readStates));
      localStorage.setItem('manga-reader-notifications', JSON.stringify(this.notifications));
      localStorage.setItem('manga-reader-user-ratings', JSON.stringify(this.userRatings));
      localStorage.setItem('manga-reader-reading-history', JSON.stringify(this.readingHistory));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  // Provide demo/sample content with placeholder images
  private seedDemoData(): void {
    const now = new Date();
    const iso = (d: Date) => d.toISOString();
    const daysAgo = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d;
    };

    const makePages = (count: number, seed: number) =>
      Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/comite-${seed}-${i}/1024/1536`);

    const demo: Series[] = [
      {
        id: 'series-1',
        title: 'Crimson Blade',
        author: 'A. Nakamura',
        description: 'A wandering swordsman battles ancient spirits across feudal lands.',
        coverImage: 'https://picsum.photos/seed/comite-cover-1/600/900',
        bannerImage: 'https://picsum.photos/seed/comite-banner-1/1600/900',
        tags: ['Action', 'Adventure', 'Supernatural'],
        status: 'ongoing',
        genre: ['Action', 'Fantasy'],
        rating: 4.6,
        totalChapters: 12,
        lastUpdated: iso(daysAgo(2)),
        uploadedAt: iso(daysAgo(30)),
        firstChapterPublishedAt: iso(daysAgo(28)),
        chapters: [
          {
            id: 'ch-1-12',
            seriesId: 'series-1',
            title: 'Whispers of Steel',
            chapterNumber: 12,
            pages: makePages(12, 112),
            publishedAt: iso(daysAgo(2)),
            isRead: false
          },
          {
            id: 'ch-1-11',
            seriesId: 'series-1',
            title: 'Ash and Echoes',
            chapterNumber: 11,
            pages: makePages(12, 111),
            publishedAt: iso(daysAgo(7)),
            isRead: false
          }
        ]
      },
      {
        id: 'series-2',
        title: 'Skybound Academy',
        author: 'L. Park',
        description: 'Students learn to harness the wind above floating islands.',
        coverImage: 'https://picsum.photos/seed/comite-cover-2/600/900',
        bannerImage: 'https://picsum.photos/seed/comite-banner-2/1600/900',
        tags: ['School', 'Fantasy', 'Comedy'],
        status: 'ongoing',
        genre: ['Fantasy', 'Slice of Life'],
        rating: 4.3,
        totalChapters: 24,
        lastUpdated: iso(daysAgo(5)),
        uploadedAt: iso(daysAgo(60)),
        firstChapterPublishedAt: iso(daysAgo(58)),
        chapters: [
          {
            id: 'ch-2-24',
            seriesId: 'series-2',
            title: 'Trade Winds',
            chapterNumber: 24,
            pages: makePages(10, 224),
            publishedAt: iso(daysAgo(5)),
            isRead: false
          },
          {
            id: 'ch-2-23',
            seriesId: 'series-2',
            title: 'Thermals',
            chapterNumber: 23,
            pages: makePages(10, 223),
            publishedAt: iso(daysAgo(12)),
            isRead: false
          }
        ]
      },
      {
        id: 'series-3',
        title: 'Neon Circuit',
        author: 'K. Rao',
        description: 'A courier deciphers encrypted messages in a neon-drenched megacity.',
        coverImage: 'https://picsum.photos/seed/comite-cover-3/600/900',
        bannerImage: 'https://picsum.photos/seed/comite-banner-3/1600/900',
        tags: ['Sci-Fi', 'Thriller'],
        status: 'hiatus',
        genre: ['Sci-Fi'],
        rating: 4.1,
        totalChapters: 8,
        lastUpdated: iso(daysAgo(20)),
        uploadedAt: iso(daysAgo(120)),
        firstChapterPublishedAt: iso(daysAgo(119)),
        chapters: [
          {
            id: 'ch-3-8',
            seriesId: 'series-3',
            title: 'Checksum',
            chapterNumber: 8,
            pages: makePages(9, 308),
            publishedAt: iso(daysAgo(20)),
            isRead: false
          }
        ]
      }
    ];

    this.series = demo;
  }
}

export const dataService = new DataService();
