import { dataService } from './dataService';

class NotificationService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastCheckTime = 0;
  private throttleDelay = 5000; // 5 seconds throttle
  private seenNotifications = new Set<string>();

  startPolling(intervalMs: number = 30000) { // 30 seconds default
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      await this.checkForNewChapters();
    }, intervalMs);
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async checkForNewChapters() {
    const now = Date.now();
    
    // Throttle checks to prevent excessive API calls
    if (now - this.lastCheckTime < this.throttleDelay) {
      return;
    }
    
    this.lastCheckTime = now;
    
    try {
      // Get all bookmarked series
      const bookmarks = await dataService.getBookmarks();
      
      // For demo purposes, randomly generate a notification
      // In a real app, this would check against an API
      if (Math.random() < 0.1 && bookmarks.length > 0) { // 10% chance
        const randomBookmark = bookmarks[Math.floor(Math.random() * bookmarks.length)];
        await this.generateUniqueNotification(randomBookmark.seriesId);
      }
    } catch (error) {
      console.error('Error checking for new chapters:', error);
    }
  }

  private async generateUniqueNotification(seriesId: string) {
    try {
      const series = await dataService.getSeriesById(seriesId);
      if (!series) return;

      // Create a unique key for this notification
      const notificationKey = `${seriesId}-${series.chapters[0]?.chapterNumber || 'latest'}`;
      
      // Check if we've already seen this notification
      if (this.seenNotifications.has(notificationKey)) {
        return;
      }

      // Generate the notification
      await dataService.generateMockNotification(seriesId);
      
      // Mark as seen
      this.seenNotifications.add(notificationKey);
      
      // Clean up old seen notifications (keep only last 100)
      if (this.seenNotifications.size > 100) {
        const seenArray = Array.from(this.seenNotifications);
        this.seenNotifications = new Set(seenArray.slice(-50));
      }
    } catch (error) {
      console.error('Error generating unique notification:', error);
    }
  }

  // Simulate a new chapter notification for demo
  async simulateNewChapter(seriesId: string) {
    await this.generateUniqueNotification(seriesId);
  }

  // Clear seen notifications (useful for testing)
  clearSeenNotifications() {
    this.seenNotifications.clear();
  }
}

export const notificationService = new NotificationService();
