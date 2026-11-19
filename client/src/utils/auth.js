import { formatApiDetail } from './helpers.js';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'promptvault_token';

let memoryToken = null;

export function getStoredToken() {
  if (memoryToken) return memoryToken;
  try {
    const val = localStorage.getItem(TOKEN_KEY);
    if (val) memoryToken = val;
    return val;
  } catch {
    return memoryToken;
  }
}

export function setStoredToken(token) {
  memoryToken = token || null;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* localStorage blocked in strict iframe contexts; memoryToken keeps session alive */
  }
}

export function buildAuthHeaders(token) {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    'X-Auth-Token': token,
  };
}

export async function authRequest(path, payload, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(token),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatApiDetail(data.detail, 'Request failed. Please try again.'));
  }

  return data;
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Your session has expired. Please log in again.');
  }

  const data = await response.json();
  return data.user;
}
