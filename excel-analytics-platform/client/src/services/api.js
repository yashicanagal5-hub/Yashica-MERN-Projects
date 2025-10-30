import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000, // TODO: Make this configurable per request type
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added auth token to request:', config.url);
    } else {
      console.log('⚠️  No auth token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('📤 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response received:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('📥 Response error:', error.config?.url, 'Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      console.log('🚫 Unauthorized access - clearing token and redirecting to login');
      localStorage.removeItem('token');
      // TODO: Use React Router navigation instead of window.location
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.log('🚫 Forbidden access - insufficient permissions');
    } else if (error.response?.status >= 500) {
      console.log('💥 Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// TODO: Add request caching for GET requests
// TODO: Add request retry mechanism
// TODO: Add request/response logging for debugging
// TODO: Add offline queue support

// Auth API
export const authAPI = {
  login: (email, password) => {
    console.log('🔐 Attempting login for:', email);
    return api.post('/auth/login', { email, password });
  },
  register: (userData) => {
    console.log('📝 Attempting registration for:', userData.email);
    return api.post('/auth/register', userData);
  },
  getProfile: () => {
    console.log('👤 Fetching user profile');
    return api.get('/auth/profile');
  },
  updateProfile: (userData) => {
    console.log('✏️  Updating user profile');
    return api.put('/auth/profile', userData);
  },
  changePassword: (passwordData) => {
    console.log('🔑 Changing password');
    return api.post('/auth/change-password', passwordData);
  },
  verifyToken: () => {
    console.log('🔍 Verifying token');
    return api.get('/auth/verify');
  },
  getUserStats: () => {
    console.log('📊 Fetching user stats');
    return api.get('/auth/stats');
  },
  logout: () => {
    console.log('🚪 Logging out');
    return api.post('/auth/logout');
  },
};

// Files API
export const filesAPI = {
  uploadFile: (formData, onUploadProgress) => 
    api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }),
  getUserFiles: (params) => api.get('/files', { params }),
  getFileDetails: (fileId) => api.get(`/files/${fileId}`),
  getFileData: (fileId, params) => api.get(`/files/${fileId}/data`, { params }),
  updateFile: (fileId, data) => api.put(`/files/${fileId}`, data),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  downloadFile: (fileId) => api.get(`/files/${fileId}/download`, {
    responseType: 'blob',
  }),
};

// Analytics API
export const analyticsAPI = {
  createAnalysis: (data) => api.post('/analytics', data),
  getUserAnalyses: (params) => api.get('/analytics', { params }),
  getAnalysisDetails: (analysisId) => api.get(`/analytics/${analysisId}`),
  updateAnalysis: (analysisId, data) => api.put(`/analytics/${analysisId}`, data),
  deleteAnalysis: (analysisId) => api.delete(`/analytics/${analysisId}`),
  getChartData: (analysisId, params) => api.get(`/analytics/${analysisId}/chart`, { params }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updatePreferences: (preferences) => api.put('/users/preferences', { preferences }),
  getDashboard: () => api.get('/users/dashboard'),
  getActivityHistory: (params) => api.get('/users/activity', { params }),
  getFavorites: () => api.get('/users/favorites'),
  toggleBookmark: (analysisId) => api.post(`/users/favorites/${analysisId}/toggle`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSystemHealth: () => api.get('/admin/system/health'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAllFiles: (params) => api.get('/admin/files', { params }),
  getAllAnalyses: (params) => api.get('/admin/analyses', { params }),
  deleteFile: (fileId) => api.delete(`/admin/files/${fileId}`),
  deleteAnalysis: (analysisId) => api.delete(`/admin/analyses/${analysisId}`),
};

export default api;