const DEFAULT_API = 'https://chat-without-internet.onrender.com';

const raw = (import.meta.env?.VITE_API_URL || DEFAULT_API).trim();

const normalized = raw.replace(/\/+$/, '');

export const API_BASE_URL = normalized;
export const API_REST_BASE = `${API_BASE_URL}/api`;

export function buildApiUrl(path = '') {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
