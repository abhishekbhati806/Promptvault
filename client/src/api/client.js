
import axios from 'axios';

// In development, Vite proxies /api to http://localhost:8000.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
});

// Attach the JWT when present.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('promptvault_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const api = {
  // Health
  health: () => client.get('/health').then((r) => r.data),

  // Prompts
  getPrompts: (params) =>
    client.get('/prompts', { params }).then((r) => r.data),
  getMyPrompts: () => client.get('/prompts/mine').then((r) => r.data),
  getPrompt: (id) => client.get(`/prompts/${id}`).then((r) => r.data),
  createPrompt: (data) => client.post('/prompts', data).then((r) => r.data),
  updatePrompt: (id, data) =>
    client.put(`/prompts/${id}`, data).then((r) => r.data),
  deletePrompt: (id) => client.delete(`/prompts/${id}`).then((r) => r.data),
  likePrompt: (id) => client.post(`/prompts/${id}/like`).then((r) => r.data),


  // Admin - Day 27
  adminStats: () => client.get('/admin/stats').then((r) => r.data),
  adminPrompts: () => client.get('/admin/prompts').then((r) => r.data),
  toggleFeature: (id) =>
    client.post(`/admin/prompts/${id}/feature`).then((r) => r.data),
    deleteAdminPrompt: (id) =>
    client.delete(`/admin/prompts/${id}`),
  // Dashboard stats
  getDashboard: () => client.get('/stats/dashboard').then((r) => r.data),

  // Favorites
  getFavorites: () => client.get('/favorites').then((r) => r.data),
  addFavorite: (id) => client.post(`/favorites/${id}`).then((r) => r.data),
  removeFavorite: (id) => client.delete(`/favorites/${id}`).then((r) => r.data),

  // Authentication
  register: (data) => client.post('/auth/register', data).then((r) => r.data),
  login: (email, password) =>
    client.post('/auth/login', { email, password }).then((r) => r.data),
  getMe: () => client.get('/auth/me').then((r) => r.data),

  // AI â€” Day 23 to Day 26
  aiStatus: () => client.get('/ai/status').then((r) => r.data),
  improvePrompt: (data) =>
    client.post('/ai/improve', data).then((r) => r.data),
  generatePrompt: (data) =>
    client.post('/ai/generate', data).then((r) => r.data),
  scorePrompt: (data) =>
    client.post('/ai/score', data).then((r) => r.data),
};

export default client;


