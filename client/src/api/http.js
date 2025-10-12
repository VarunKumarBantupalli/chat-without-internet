import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const http = axios.create({ baseURL: `${API}/api` });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
