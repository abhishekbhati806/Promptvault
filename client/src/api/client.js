import axios from 'axios';
import { getStoredToken } from '../utils/auth.js';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
    : '/api',
});

// Attach JWT on both X-Auth-Token and Authorization for full proxy compatibility.
client.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Auth-Token'] = token;
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

  // Admin
  adminStats: () => client.get('/admin/stats').then((r) => r.data),
  adminPrompts: () => client.get('/admin/prompts').then((r) => r.data),
  toggleFeature: (id) =>
    client.post(`/admin/prompts/${id}/feature`).then((r) => r.data),
  deleteAdminPrompt: (id) => client.delete(`/admin/prompts/${id}`),

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

  // AI Studio
  aiStatus: () => client.get('/ai/status').then((r) => r.data),
  improvePrompt: (data) =>
    client.post('/ai/improve', data).then((r) => r.data),
  generatePrompt: (data) =>
    client.post('/ai/generate', data).then((r) => r.data),
  scorePrompt: (data) =>
    client.post('/ai/score', data).then((r) => r.data),
};

export default client;
