// api.js
import axios from 'axios';
import useAuthStore from '../store/auth.store';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Normaliza: saca slashes finales y asegura que termine en /api
let baseURL = rawBaseURL.replace(/\/+$/, '');
if (!baseURL.endsWith('/api')) {
  baseURL += '/api';
}

const api = axios.create({ baseURL });

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;