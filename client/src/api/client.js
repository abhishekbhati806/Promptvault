import axios from 'axios';

// In development the Vite server proxies /api -> http://localhost:8000,
// so a relative base URL works out of the box.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

// Attach the JWT to every request when present.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('promptvault_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // health
  health: () => client.get('/health').then((r) => r.data),

  // prompts
  getPrompts: (params) => client.get('/prompts', { params }).then((r) => r.data),
  getMyPrompts: () => client.get('/prompts/mine').then((r) => r.data),
  getPrompt: (id) => client.get(`/prompts/${id}`).then((r) => r.data),
  createPrompt: (data) => client.post('/prompts', data).then((r) => r.data),
  updatePrompt: (id, data) => client.put(`/prompts/${id}`, data).then((r) => r.data),
  deletePrompt: (id) => client.delete(`/prompts/${id}`).then((r) => r.data),
  likePrompt: (id) => client.post(`/prompts/${id}/like`).then((r) => r.data),

  // stats
  getDashboard: () => client.get('/stats/dashboard').then((r) => r.data),

  // favorites
  getFavorites: () => client.get('/favorites').then((r) => r.data),
  addFavorite: (id) => client.post(`/favorites/${id}`).then((r) => r.data),
  removeFavorite: (id) => client.delete(`/favorites/${id}`).then((r) => r.data),

  // auth
  register: (data) => client.post('/auth/register', data).then((r) => r.data),
  login: (email, password) =>
    client.post('/auth/login', { email, password }).then((r) => r.data),
  getMe: () => client.get('/auth/me').then((r) => r.data),
};

export default client;

