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
import DeviceCheckPage from './pages/candidate/DeviceCheckPage';
import InterviewSessionPage from './pages/candidate/InterviewSessionPage';
import InterviewReportPage from './pages/candidate/InterviewReportPage';
import InterviewHistoryPage from './pages/candidate/InterviewHistoryPage';
import CandidatePerformancePage from './pages/candidate/CandidatePerformancePage';

// Timed Assessment Suite
import AssessmentHubPage from './pages/candidate/AssessmentHubPage';
import ObjectiveAssessmentPage from './pages/candidate/ObjectiveAssessmentPage';
import CodingAssessmentPage from './pages/candidate/CodingAssessmentPage';
import CandidateComprehensiveReportPage from './pages/candidate/CandidateComprehensiveReportPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Marketing Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Candidate Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Standalone Proctoring & Active Interview Room */}
        <Route path="/interview/active/:id" element={<InterviewSessionPage />} />
        <Route path="/candidate/interview/active/:id" element={<InterviewSessionPage />} />

        {/* Standalone Assessment Exam Rooms */}
        <Route path="/assessment/objective/:sectionType" element={<ObjectiveAssessmentPage />} />
        <Route path="/assessment/coding" element={<CodingAssessmentPage />} />

        {/* Candidate Protected Portal */}
        <Route element={<AppLayout requiredRole="candidate" />}>
          <Route path="/dashboard" element={<CandidateDashboard />} />
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />

          {/* Timed Assessment Suite (5 Sections) */}
          <Route path="/assessments" element={<AssessmentHubPage />} />
          <Route path="/candidate/assessments" element={<AssessmentHubPage />} />
          <Route path="/candidate/comprehensive-report" element={<CandidateComprehensiveReportPage />} />
          <Route path="/candidate/comprehensive-report/:id" element={<CandidateComprehensiveReportPage />} />

          {/* Interview & Proctoring Setup */}
          <Route path="/interview/setup" element={<StartInterviewPage />} />
          <Route path="/candidate/interview/setup" element={<StartInterviewPage />} />
          <Route path="/interview/device-check" element={<DeviceCheckPage />} />

          {/* Results & History */}
          <Route path="/results/:id" element={<InterviewReportPage />} />
          <Route path="/candidate/results/:id" element={<InterviewReportPage />} />

          <Route path="/history" element={<InterviewHistoryPage />} />
          <Route path="/candidate/interviews" element={<InterviewHistoryPage />} />

          <Route path="/performance" element={<CandidatePerformancePage />} />
          <Route path="/candidate/performance" element={<CandidatePerformancePage />} />

          <Route path="/profile" element={<CandidateDashboard />} />
          <Route path="/settings" element={<CandidateDashboard />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
