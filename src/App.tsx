// Copyright © 2025 Vishnu Vivek Valeti. All rights reserved.
// Licensed under ComiTe Proprietary License 1.0. See LICENSE.txt.

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SeriesPage from './pages/SeriesPage';
import ReaderPage from './pages/ReaderPage';
import BookmarksPage from './pages/BookmarksPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import ReadingHistoryPage from './pages/ReadingHistoryPage';
import PopularPage from './pages/PopularPage';
import NewReleasesPage from './pages/NewReleasesPage';
import LicensePage from './pages/legal/LicensePage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import DMCAPage from './pages/legal/DMCAPage';
import Layout from './components/Layout';
import { notificationService } from './services/notificationService';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ForbiddenPage from './pages/ForbiddenPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SeriesAdminPage from './pages/admin/SeriesAdminPage';
import ChaptersAdminPage from './pages/admin/ChaptersAdminPage';
import UsersAdminPage from './pages/admin/UsersAdminPage';
import ToolsAdminPage from './pages/admin/ToolsAdminPage';
import UploadAdminPage from './pages/admin/UploadAdminPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import LibraryPage from './pages/LibraryPage';

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
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-manga-bg" data-signature={SIGNATURE}>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/welcome" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/series/:id" element={<SeriesPage />} />
                <Route path="/series/:seriesId/chapter/:chapterId" element={<ReaderPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/history" element={<ReadingHistoryPage />} />
                <Route path="/popular" element={<PopularPage />} />
                <Route path="/new-releases" element={<NewReleasesPage />} />
                <Route path="/legal/license" element={<LicensePage />} />
                <Route path="/legal/terms" element={<TermsPage />} />
                <Route path="/legal/privacy" element={<PrivacyPage />} />
                <Route path="/legal/dmca" element={<DMCAPage />} />

                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />

                <Route path="/403" element={<ForbiddenPage />} />

                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/series" element={<AdminRoute><SeriesAdminPage /></AdminRoute>} />
                <Route path="/admin/chapters" element={<AdminRoute><ChaptersAdminPage /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><UsersAdminPage /></AdminRoute>} />
                <Route path="/admin/tools" element={<AdminRoute><ToolsAdminPage /></AdminRoute>} />
                <Route path="/admin/upload" element={<AdminRoute><UploadAdminPage /></AdminRoute>} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
