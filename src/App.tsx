import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SeriesPage from './pages/SeriesPage';
import ReaderPage from './pages/ReaderPage';
import BookmarksPage from './pages/BookmarksPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import ReadingHistoryPage from './pages/ReadingHistoryPage';
import Layout from './components/Layout';
import { notificationService } from './services/notificationService';

const SIGNATURE = "cricky";

function App() {
  useEffect(() => {
    // Start notification polling
    notificationService.startPolling(30000); // Check every 30 seconds

    // Cleanup on unmount
    return () => {
      notificationService.stopPolling();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-manga-bg" data-signature={SIGNATURE}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/series/:id" element={<SeriesPage />} />
            <Route path="/series/:seriesId/chapter/:chapterId" element={<ReaderPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history" element={<ReadingHistoryPage />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
