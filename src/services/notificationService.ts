import { dataService } from './dataService';

class NotificationService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

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
    try {
      // Get all bookmarked series
      const bookmarks = await dataService.getBookmarks();
      
      // For demo purposes, randomly generate a notification
      // In a real app, this would check against an API
      if (Math.random() < 0.1 && bookmarks.length > 0) { // 10% chance
        const randomBookmark = bookmarks[Math.floor(Math.random() * bookmarks.length)];
        await dataService.generateMockNotification(randomBookmark.seriesId);
      }
    } catch (error) {
      console.error('Error checking for new chapters:', error);
    }
  }

  // Simulate a new chapter notification for demo
  async simulateNewChapter(seriesId: string) {
    await dataService.generateMockNotification(seriesId);
  }
}

export const notificationService = new NotificationService();
