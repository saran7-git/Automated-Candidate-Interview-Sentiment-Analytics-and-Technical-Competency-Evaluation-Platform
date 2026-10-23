import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

// Landing Page
import LandingPage from './pages/landing/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import StartInterviewPage from './pages/candidate/StartInterviewPage';
import InterviewSessionPage from './pages/candidate/InterviewSessionPage';
import InterviewReportPage from './pages/candidate/InterviewReportPage';
import InterviewHistoryPage from './pages/candidate/InterviewHistoryPage';
import CandidatePerformancePage from './pages/candidate/CandidatePerformancePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCandidatesPage from './pages/admin/AdminCandidatesPage';
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage';
import AdminInterviewsPage from './pages/admin/AdminInterviewsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Standalone Assessment Room */}
        <Route path="/candidate/interview/active/:id" element={<InterviewSessionPage />} />

        {/* Candidate Protected Portal */}
        <Route element={<AppLayout requiredRole="candidate" />}>
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/candidate/interview/setup" element={<StartInterviewPage />} />
          <Route path="/candidate/results/:id" element={<InterviewReportPage />} />
          <Route path="/candidate/interviews" element={<InterviewHistoryPage />} />
          <Route path="/candidate/performance" element={<CandidatePerformancePage />} />
          <Route path="/candidate/reports" element={<InterviewHistoryPage />} />
          <Route path="/candidate/profile" element={<CandidateDashboard />} />
          <Route path="/candidate/settings" element={<CandidateDashboard />} />
        </Route>

        {/* Admin Protected Console */}
        <Route element={<AppLayout requiredRole="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/candidates" element={<AdminCandidatesPage />} />
          <Route path="/admin/questions" element={<AdminQuestionsPage />} />
          <Route path="/admin/interviews" element={<AdminInterviewsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
