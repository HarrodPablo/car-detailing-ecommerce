import axios from 'axios';
import useAuthStore from '../store/auth.store';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL });

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      useAuthStore.getState().logout();
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login?error=sesion-expirada';
      }
    }

    return Promise.reject(error);
  }
);

export default api;