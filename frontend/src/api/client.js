import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('interview_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network request failed';
    if (error.response?.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('interview_token')) {
        localStorage.removeItem('interview_token');
        localStorage.removeItem('interview_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const candidateAPI = {
  getAll: () => api.get('/candidates'),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
};

export const interviewAPI = {
  getAll: () => api.get('/interviews'),
  getById: (id) => api.get(`/interviews/${id}`),
  create: (data) => api.post('/interviews', data),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
};

export const sessionAPI = {
  create: (data) => api.post('/sessions', data),
  getById: (id) => api.get(`/sessions/${id}`),
  getByCandidate: (candidateId) => api.get(`/sessions/candidate/${candidateId}`),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  startSession: (id) => api.post(`/sessions/${id}/start`),
  submit: (id, data) => api.post(`/sessions/${id}/submit`, data),
};

export const responseAPI = {
  saveAnswer: (data) => api.post('/responses', data),
  getBySession: (sessionId) => api.get(`/responses/${sessionId}`),
};

export const aiAPI = {
  analyzeText: (data) => api.post('/ai/analyze', data),
  analyzeResponse: (responseId) => api.post(`/ai/analyze/${responseId}`),
  analyzeSession: (sessionId) => api.post(`/ai/analyze-session/${sessionId}`),
};

export const reportAPI = {
  getBySession: (sessionId) => api.get(`/reports/${sessionId}`),
  getByCandidate: (candidateId) => api.get(`/reports/candidate/${candidateId}`),
};

export const dashboardAPI = {
  getStatistics: () => api.get('/dashboard/statistics'),
  compareCandidates: (sessionIds) => api.post('/dashboard/compare', { sessionIds }),
};

export default api;
