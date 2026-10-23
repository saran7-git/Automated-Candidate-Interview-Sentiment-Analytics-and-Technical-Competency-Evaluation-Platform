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

// 2. Questions API
export const questionAPI = {
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestionById: (id) => api.get(`/questions/${id}`),
  createQuestion: (data) => api.post('/questions', data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
};

// 3. Interview API
export const interviewAPI = {
  startInterview: (data) => api.post('/interviews/start', data),
  getInterviewById: (id) => api.get(`/interviews/${id}`),
  completeInterview: (id, data) => api.post(`/interviews/${id}/complete`, data),
  getCandidateHistory: () => api.get('/interviews/history'),
  getAllInterviews: (params) => api.get('/interviews', { params }),
};

// 4. Answer API
export const answerAPI = {
  saveAnswer: (data) => api.post('/answers', data),
  getInterviewAnswers: (interviewId) => api.get(`/answers/${interviewId}`),
};

// 5. Evaluation & Results API
export const evaluationAPI = {
  analyzeAnswer: (data) => api.post('/evaluation/analyze', data),
  getInterviewResult: (interviewId) => api.get(`/results/${interviewId}`),
};

// 6. Candidate API
export const candidateAPI = {
  getCandidateDashboard: () => api.get('/candidates/dashboard'),
  getCandidates: () => api.get('/candidates'),
  getCandidateById: (id) => api.get(`/candidates/${id}`),
};

// 7. Admin API
export const adminAPI = {
  getAdminDashboard: () => api.get('/admin/dashboard'),
  getAdminAnalytics: () => api.get('/admin/analytics'),
};

export default api;
