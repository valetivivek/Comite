import { Series, Chapter } from '../types';

export interface ReadingStats {
  totalChaptersRead: number;
  genreCounts: { [genre: string]: number };
  lastUpdated: string;
}

export interface ValidReadData {
  chapterId: string;
  seriesId: string;
  activeTime: number; // in seconds
  scrollDepth: number; // percentage 0-100
  imagesSeen: number; // count of images seen for >= 0.5s
  totalImages: number;
  userId: string;
}

export class ReadingStatsService {
  private static instance: ReadingStatsService;
  private stats: { [userId: string]: ReadingStats } = {};
  private activeReads: { [key: string]: ValidReadData } = {};
  private heartbeatTimers: { [key: string]: NodeJS.Timeout } = {};
  private lastActivityTimes: { [key: string]: number } = {};

  static getInstance(): ReadingStatsService {
    if (!ReadingStatsService.instance) {
      ReadingStatsService.instance = new ReadingStatsService();
    }
    return ReadingStatsService.instance;
  }

  // Start tracking a chapter read
  startChapterRead(userId: string, chapterId: string, seriesId: string, totalImages: number): void {
    const key = `${userId}-${chapterId}`;
    
    // Don't start if already tracking or if chapter was already read
    if (this.activeReads[key] || this.isChapterAlreadyRead(userId, chapterId)) {
      return;
    }

    this.activeReads[key] = {
      chapterId,
      seriesId,
      userId,
      activeTime: 0,
      scrollDepth: 0,
      imagesSeen: 0,
      totalImages
    };

    this.lastActivityTimes[key] = Date.now();
    this.startHeartbeat(key);
  }

  // Update activity (scroll, touch, keypress, click)
  updateActivity(userId: string, chapterId: string): void {
    const key = `${userId}-${chapterId}`;
    if (this.activeReads[key]) {
      this.lastActivityTimes[key] = Date.now();
    }
  }

  // Update scroll depth
  updateScrollDepth(userId: string, chapterId: string, depth: number): void {
    const key = `${userId}-${chapterId}`;
    if (this.activeReads[key]) {
      this.activeReads[key].scrollDepth = Math.max(this.activeReads[key].scrollDepth, depth);
    }
  }

  // Update image visibility
  updateImageSeen(userId: string, chapterId: string): void {
    const key = `${userId}-${chapterId}`;
    if (this.activeReads[key]) {
      this.activeReads[key].imagesSeen = Math.min(
        this.activeReads[key].imagesSeen + 1,
        this.activeReads[key].totalImages
      );
    }
  }

  // Stop tracking and validate read
  stopChapterRead(userId: string, chapterId: string, series: Series): Promise<boolean> {
    const key = `${userId}-${chapterId}`;
    const readData = this.activeReads[key];
    
    if (!readData) return Promise.resolve(false);

    // Clear tracking
    this.clearTracking(key);

    // Validate read requirements
    const isValidRead = this.validateRead(readData);
    
    if (isValidRead) {
      return this.recordValidRead(userId, readData, series);
    }

    return Promise.resolve(false);
  }

  private startHeartbeat(key: string): void {
    this.heartbeatTimers[key] = setInterval(() => {
      const readData = this.activeReads[key];
      if (!readData) {
        this.clearTracking(key);
        return;
      }

      const now = Date.now();
      const lastActivity = this.lastActivityTimes[key];
      const timeSinceActivity = (now - lastActivity) / 1000;

      // If user has been inactive for more than 15 seconds, pause counting
      if (timeSinceActivity <= 15) {
        readData.activeTime += 5; // 5 second heartbeat
      }

      // Check if tab is visible (simplified check)
      if (!document.hidden) {
        // Only count time when tab is visible
        // This is a simplified implementation - in production you'd use Page Visibility API
      }
    }, 5000);
  }

  private clearTracking(key: string): void {
    if (this.heartbeatTimers[key]) {
      clearInterval(this.heartbeatTimers[key]);
      delete this.heartbeatTimers[key];
    }
    delete this.activeReads[key];
    delete this.lastActivityTimes[key];
  }

  private validateRead(readData: ValidReadData): boolean {
    const { activeTime, scrollDepth, imagesSeen, totalImages } = readData;
    
    // All validation rules must be met
    return (
      activeTime >= 45 && // At least 45 seconds active time
      scrollDepth >= 80 && // At least 80% scroll depth
      (imagesSeen / totalImages) >= 0.7 // At least 70% of images seen
    );
  }

  private async recordValidRead(userId: string, readData: ValidReadData, series: Series): Promise<boolean> {
    // Server validation would happen here
    // For now, we'll simulate server validation
    const isValid = this.validateRead(readData);
    
    if (!isValid) {
      return false;
    }

    // Update local stats
    this.updateUserStats(userId, readData, series);
    
    // Save to localStorage
    this.saveStatsToStorage();
    
    return true;
  }

  private updateUserStats(userId: string, readData: ValidReadData, series: Series): void {
    if (!this.stats[userId]) {
      this.stats[userId] = {
        totalChaptersRead: 0,
        genreCounts: {},
        lastUpdated: new Date().toISOString()
      };
    }

    // Increment total chapters read
    this.stats[userId].totalChaptersRead++;

    // Update genre counts
    series.genre.forEach(genre => {
      this.stats[userId].genreCounts[genre] = (this.stats[userId].genreCounts[genre] || 0) + 1;
    });

    this.stats[userId].lastUpdated = new Date().toISOString();
  }

  private isChapterAlreadyRead(userId: string, chapterId: string): boolean {
    // Check if chapter was already counted as read
    // This would integrate with your existing reading progress system
    const userHistory = JSON.parse(localStorage.getItem('manga-reader-user-history') || '[]');
    return userHistory.some((h: any) => h.userId === userId && h.chapterId === chapterId && h.validRead);
  }

  private saveStatsToStorage(): void {
    localStorage.setItem('manga-reader-reading-stats', JSON.stringify(this.stats));
  }

  // Load stats from storage
  loadStatsFromStorage(): void {
    const stored = localStorage.getItem('manga-reader-reading-stats');
    if (stored) {
      this.stats = JSON.parse(stored);
    }
  }

  // Get user stats
  getUserStats(userId: string): ReadingStats | null {
    this.loadStatsFromStorage();
    return this.stats[userId] || null;
  }

  // Get rank based on total chapters read
  getRank(totalChaptersRead: number): string {
    if (totalChaptersRead >= 1000) return 'Archivist';
    if (totalChaptersRead >= 500) return 'Binger';
    if (totalChaptersRead >= 200) return 'Enthusiast';
    if (totalChaptersRead >= 50) return 'Reader';
    return 'Newbie';
  }

  // Get top 3 genre flairs
  getGenreFlairs(genreCounts: { [genre: string]: number }): string[] {
    const sortedGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([genre]) => genre);
    
    return sortedGenres.slice(0, 3);
  }

  // Get all flairs (rank + genres) with optional manual selection
  getUserFlairs(userId: string, manualGenres?: string[]): { rank: string; genres: string[] } {
    const stats = this.getUserStats(userId);
    if (!stats) {
      return { rank: 'Newbie', genres: ['Explorer'] };
    }

    const rank = this.getRank(stats.totalChaptersRead);
    
    // Use manual selection if provided, otherwise use auto top 3
    let genres: string[];
    if (manualGenres && manualGenres.length > 0) {
      genres = manualGenres.slice(0, 3); // Limit to 3
    } else {
      genres = this.getGenreFlairs(stats.genreCounts);
    }
    
    return {
      rank,
      genres: genres.length > 0 ? genres : ['Explorer']
    };
  }
}

export const readingStatsService = ReadingStatsService.getInstance();
