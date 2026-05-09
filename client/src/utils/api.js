import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Users
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  submitVerification: (data) => api.post('/users/verify', data),
  getCredit: (id) => api.get(`/users/${id}/credit`),
};

// Products
export const productsAPI = {
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getDetail: (id) => api.get(`/products/${id}`),
  search: (params) => api.get('/products/search', { params }),
  getMine: (params) => api.get('/products/mine', { params }),
  markSold: (id) => api.put(`/products/${id}/sold`),
  markOffline: (id) => api.put(`/products/${id}/offline`),
};

// Favorites
export const favoritesAPI = {
  toggle: (productId) => api.post(`/favorites/${productId}`),
  remove: (productId) => api.delete(`/favorites/${productId}`),
  getMine: () => api.get('/favorites/mine'),
};

// Wants
export const wantsAPI = {
  create: (data) => api.post('/wants', data),
  update: (id, data) => api.put(`/wants/${id}`, data),
  delete: (id) => api.delete(`/wants/${id}`),
  getList: (params) => api.get('/wants/list', params),
  getMine: () => api.get('/wants/mine'),
};

// Messages
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  send: (data) => api.post('/messages/send', data),
  markRead: (userId) => api.put(`/messages/read/${userId}`),
};

// Reports
export const reportsAPI = {
  create: (data) => api.post('/reports', data),
};

// Admin
export const adminAPI = {
  getVerifications: (params) => api.get('/admin/verifications', { params }),
  handleVerification: (id, data) => api.put(`/admin/verifications/${id}`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
  handleReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  getUsers: (params) => api.get('/admin/users', { params }),
};

// Upload
export const uploadAPI = {
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
