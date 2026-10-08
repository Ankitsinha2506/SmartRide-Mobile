import axios from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/authStore';
export const api = axios.create({ baseURL: env.apiUrl, timeout: 15000 });
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  response => response.data.data,
  error =>
    Promise.reject(
      new Error(
        error.response?.data?.message || 'Unable to complete your request',
      ),
    ),
);
