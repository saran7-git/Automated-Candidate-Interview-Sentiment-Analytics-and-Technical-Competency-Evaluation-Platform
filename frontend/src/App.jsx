import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import CandidateLayout from './layouts/CandidateLayout';

// Public Pages
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import InterviewInstructions from './pages/candidate/InterviewInstructions';
import InterviewSessionPage from './pages/candidate/InterviewSessionPage';
import InterviewCompletionPage from './pages/candidate/InterviewCompletionPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CandidateManagement from './pages/admin/CandidateManagement';
import InterviewManagement from './pages/admin/InterviewManagement';
import CandidateReportPage from './pages/admin/CandidateReportPage';
import CandidateComparisonPage from './pages/admin/CandidateComparisonPage';

const RootRedirect = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to="/candidate" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Candidate Portal Routes */}
      <Route path="/candidate" element={<CandidateLayout />}>
        <Route index element={<CandidateDashboard />} />
        <Route path="instructions/:sessionId" element={<InterviewInstructions />} />
        <Route path="interview/:sessionId" element={<InterviewSessionPage />} />
        <Route path="complete/:sessionId" element={<InterviewCompletionPage />} />
      </Route>

      {/* Admin / Recruiter Dashboard Routes */}
      <Route path="/admin" element={<MainLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="candidates" element={<CandidateManagement />} />
        <Route path="interviews" element={<InterviewManagement />} />
        <Route path="reports/:sessionId" element={<CandidateReportPage />} />
        <Route path="compare" element={<CandidateComparisonPage />} />
      </Route>

      {/* Root & Fallback */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
