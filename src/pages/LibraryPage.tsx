import { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { Bookmark } from '../types';

const LibraryPage = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => { dataService.getBookmarks().then(setBookmarks); }, []);

  return (
    <div className="min-h-screen bg-manga-bg section-spacing">
      <div className="container-spacing">
        <h1 className="text-2xl font-bold text-manga-text mb-4">Library</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bookmarks.map(b => (
            <div key={b.id} className="card p-4">
              <p className="text-manga-text font-medium">{b.series.title}</p>
              <p className="text-manga-muted text-sm">Last read: {new Date(b.lastReadAt).toLocaleDateString()}</p>
            </div>
          ))}
          {bookmarks.length === 0 && (
            <div className="card p-4 text-manga-muted text-sm">No bookmarks yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;


