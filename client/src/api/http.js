import axios from 'axios';
import { API_REST_BASE } from '../lib/apiBase';

const http = axios.create({ baseURL: API_REST_BASE });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
