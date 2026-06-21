import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach admin token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin/')) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin';
    }
    return Promise.reject(err);
  }
);

export default api;

// Public endpoints
export const getCount = () => api.get('/members/count');
export const registerHousehold = (data) => api.post('/members/register', data);
export const checkAadhaar = (aadhaar) => api.get(`/members/check-aadhaar?aadhaar=${aadhaar}`);

// News endpoints (public)
export const getNews = () => api.get('/news');

// Admin endpoints
export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const getStats = () => api.get('/admin/stats');
export const getDailyStats = (days = 30) => api.get(`/admin/stats/daily?days=${days}`);
export const getHouseholds = (params) => api.get('/admin/households', { params });
// Admin news endpoints
export const getAdminNews = () => api.get('/admin/news');
export const addNewsItem = (data) => api.post('/admin/news', data);
export const updateNewsItem = (id, data) => api.patch(`/admin/news/${id}`, data);
export const deleteNewsItem = (id) => api.delete(`/admin/news/${id}`);

export const exportToExcel = (district = '') => {
  const token = localStorage.getItem('adminToken');
  const url = `/api/admin/export${district ? `?district=${encodeURIComponent(district)}` : ''}`;
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  // Add token via header is not possible for direct link — use fetch blob
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `meru_darji_census_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    });
};
