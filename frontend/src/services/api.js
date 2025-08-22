import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login/', credentials),
  register: (userData) => api.post('/api/auth/register/', userData),
  logout: () => api.post('/api/auth/logout/'),
  getProfile: () => api.get('/api/auth/profile/'),
};

export const tasksAPI = {
  getTasks: (params = {}) => api.get('/api/tasks/', { params }),
  getTask: (id) => api.get(`/api/tasks/${id}/`),
  createTask: (data) => api.post('/api/tasks/', data),
  updateTask: (id, data) => api.patch(`/api/tasks/${id}/`, data),
  deleteTask: (id) => api.delete(`/api/tasks/${id}/`),
  getTasksByStatus: (status) => api.get(`/api/tasks/by_status/?status=${status}`),
  getAISuggestion: (id, message) => api.post(`/api/tasks/${id}/ai_suggest/`, { message }),
  breakdownTask: (id) => api.post(`/api/tasks/${id}/breakdown/`),
};

export const tagsAPI = {
  getTags: () => api.get('/api/tags/'),
  createTag: (data) => api.post('/api/tags/', data),
  updateTag: (id, data) => api.patch(`/api/tags/${id}/`, data),
  deleteTag: (id) => api.delete(`/api/tags/${id}/`),
};

export default api;