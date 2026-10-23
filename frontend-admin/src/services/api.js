import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('interviewiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('interviewiq_token');
        localStorage.removeItem('interviewiq_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// 1. Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};
export const authService = authAPI;

// 2. Questions API
export const questionAPI = {
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestionById: (id) => api.get(`/questions/${id}`),
  createQuestion: (data) => api.post('/questions', data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
};
export const questionService = questionAPI;

// 3. Interview API
export const interviewAPI = {
  startInterview: (data) => api.post('/interviews/start', data),
  getInterviewById: (id) => api.get(`/interviews/${id}`),
  completeInterview: (id, data) => api.post(`/interviews/${id}/complete`, data),
  getCandidateHistory: () => api.get('/interviews/history'),
  getAllInterviews: (params) => api.get('/interviews', { params }),
};
export const interviewService = interviewAPI;

// 4. Answer API
export const answerAPI = {
  saveAnswer: (data) => api.post('/answers', data),
  getInterviewAnswers: (interviewId) => api.get(`/answers/${interviewId}`),
};
export const answerService = answerAPI;

// 5. Evaluation & Results API
export const evaluationAPI = {
  analyzeAnswer: (data) => api.post('/evaluation/analyze', data),
  getInterviewResult: (interviewId) => api.get(`/results/${interviewId}`),
};
export const evaluationService = evaluationAPI;

// 6. Recording API
export const recordingAPI = {
  uploadRecording: (data) => api.post('/recordings/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getInterviewRecordings: (interviewId) => api.get(`/recordings/${interviewId}`),
};
export const recordingService = recordingAPI;

// 7. Candidate API
export const candidateAPI = {
  getCandidateDashboard: () => api.get('/candidates/dashboard'),
  getCandidates: () => api.get('/candidates'),
  getCandidateById: (id) => api.get(`/candidates/${id}`),
};
export const candidateService = candidateAPI;

// 8. Timed Assessment API (The 5 Sections: Aptitude, Logical, Verbal, Numerical, Coding)
export const assessmentAPI = {
  getSections: () => api.get('/assessments/sections'),
  startSession: (sectionType) => api.post(`/assessments/start/${sectionType}`),
  saveAnswer: (sessionId, data) => api.post(`/assessments/session/${sessionId}/save-answer`, data),
  submitSession: (sessionId, data) => api.post(`/assessments/session/${sessionId}/submit`, data),
  runCode: (data) => api.post('/assessments/coding/run', data),
  submitCode: (data) => api.post('/assessments/coding/submit', data),
  getCandidateSummary: (candidateId) => api.get(`/assessments/candidate-summary/${candidateId || ''}`),
};
export const assessmentService = assessmentAPI;

// 9. Proctoring & Integrity API
export const proctoringAPI = {
  logEvent: (data) => api.post('/proctoring/log', data),
  getSessionLogs: (sessionType, sessionId) => api.get(`/proctoring/logs/${sessionType}/${sessionId}`),
  getSettings: () => api.get('/proctoring/settings'),
  updateSettings: (data) => api.put('/proctoring/settings', data),
};
export const proctoringService = proctoringAPI;

// 10. Admin & Recruiter API
export const adminAPI = {
  getAdminDashboard: () => api.get('/admin/dashboard'),
  getAdminAnalytics: () => api.get('/admin/analytics'),
  compareCandidates: (ids) => api.get(`/admin/candidates/compare${ids ? `?ids=${ids}` : ''}`),
  getUsers: (role) => api.get(`/admin/users${role ? `?role=${role}` : ''}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  exportReports: () => api.get('/admin/export-reports'),
};
export const adminService = adminAPI;

export default api;
