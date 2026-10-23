import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';

// Admin Pages
import AdminLoginPage from './pages/auth/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCandidatesPage from './pages/admin/AdminCandidatesPage';
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage';
import AdminInterviewsPage from './pages/admin/AdminInterviewsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminInterviewReviewPage from './pages/admin/AdminInterviewReviewPage';
import InterviewReportPage from './pages/candidate/InterviewReportPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/register" element={<AdminLoginPage />} />

        {/* Admin Protected Console */}
        <Route element={<AppLayout requiredRole="admin" />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/candidates" element={<AdminCandidatesPage />} />
          <Route path="/admin/candidates" element={<AdminCandidatesPage />} />

          <Route path="/interviews" element={<AdminInterviewsPage />} />
          <Route path="/admin/interviews" element={<AdminInterviewsPage />} />

          <Route path="/questions" element={<AdminQuestionsPage />} />
          <Route path="/admin/questions" element={<AdminQuestionsPage />} />

          <Route path="/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />

          {/* Audit & Report Pages */}
          <Route path="/results/:id" element={<InterviewReportPage />} />
          <Route path="/candidate/results/:id" element={<InterviewReportPage />} />
          <Route path="/review/:id" element={<AdminInterviewReviewPage />} />
          <Route path="/admin/review/:id" element={<AdminInterviewReviewPage />} />

          <Route path="/profile" element={<AdminDashboard />} />
          <Route path="/settings" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
