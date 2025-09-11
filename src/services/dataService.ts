import { Series, Chapter, Bookmark, ReadState, Notification, SearchFilters } from '../types';

// Mock data generator
const generateMockSeries = (): Series[] => {
  const series: Series[] = [];
  const titles = [
    'Solo Leveling', 'Tower of God', 'The Beginning After The End', 'Omniscient Reader',
    'Martial Peak', 'Cultivation Chat Group', 'Reverend Insanity', 'A Will Eternal',
    'I Shall Seal the Heavens', 'Desolate Era', 'Perfect World', 'Battle Through the Heavens'
  ];
  
  const authors = [
    'Chugong', 'SIU', 'TurtleMe', 'Sing Shong', 'Mo Xiang Tong Xiu', 'Er Gen',
    'I Eat Tomatoes', 'Tian Can Tu Dou', 'Meng Xi Shi', 'Feng Nian Qin Ge'
  ];
  
  const genres = ['Action', 'Adventure', 'Fantasy', 'Romance', 'Comedy', 'Drama', 'Supernatural', 'School Life'];
  const statuses: ('ongoing' | 'completed' | 'hiatus')[] = ['ongoing', 'completed', 'hiatus'];
  
  for (let i = 0; i < 20; i++) {
    const chapterCount = Math.floor(Math.random() * 200) + 10;
    const chapters: Chapter[] = [];
    
    for (let j = 1; j <= chapterCount; j++) {
      chapters.push({
        id: `series-${i}-chapter-${j}`,
        seriesId: `series-${i}`,
        title: `Chapter ${j}`,
        chapterNumber: j,
        pages: Array.from({ length: Math.floor(Math.random() * 20) + 10 }, (_, k) => 
          `https://picsum.photos/400/600?random=${i}-${j}-${k}`
        ),
        publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: Math.random() > 0.7,
        readAt: Math.random() > 0.7 ? new Date().toISOString() : undefined
      });
    }
    
    series.push({
      id: `series-${i}`,
      title: titles[i % titles.length],
      author: authors[i % authors.length],
      description: `This is a compelling story about ${titles[i % titles.length].toLowerCase()}. Follow the protagonist as they embark on an incredible journey filled with adventure, mystery, and growth. The story features intricate world-building, complex characters, and plot twists that will keep you engaged from start to finish.`,
      coverImage: `https://picsum.photos/300/400?random=${i}`,
      bannerImage: `https://picsum.photos/800/200?random=${i}`,
      tags: genres.slice(0, Math.floor(Math.random() * 3) + 2),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      genre: genres.slice(0, Math.floor(Math.random() * 4) + 1),
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      totalChapters: chapterCount,
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      chapters: chapters.sort((a, b) => b.chapterNumber - a.chapterNumber)
    });
  }
  
  return series;
};

class DataService {
  private series: Series[] = [];
  private bookmarks: Bookmark[] = [];
  private readStates: ReadState[] = [];
  private notifications: Notification[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.series.length === 0) {
      this.series = generateMockSeries();
      this.saveToStorage();
    }
  }

  // Series methods
  async getSeries(): Promise<Series[]> {
    return [...this.series];
  }

  async getSeriesById(id: string): Promise<Series | null> {
    return this.series.find(s => s.id === id) || null;
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
      lastReadAt: new Date().toISOString()
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

  // Mock notification generation (for demo purposes)
  async generateMockNotification(seriesId: string): Promise<void> {
    const series = this.series.find(s => s.id === seriesId);
    if (!series) return;

    const notification: Notification = {
      id: `notification-${Date.now()}`,
      type: 'new_chapter',
      seriesId,
      seriesTitle: series.title,
      message: `New chapter available for ${series.title}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.unshift(notification);
    this.saveToStorage();
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
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('manga-reader-series', JSON.stringify(this.series));
      localStorage.setItem('manga-reader-bookmarks', JSON.stringify(this.bookmarks));
      localStorage.setItem('manga-reader-read-states', JSON.stringify(this.readStates));
      localStorage.setItem('manga-reader-notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }
}

export const dataService = new DataService();
