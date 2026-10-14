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
  error => {
    const serverMessage = error.response?.data?.message;
    const message =
      serverMessage ||
      (error.code === 'ECONNABORTED'
        ? 'The SmartRide server took too long to respond. Please try again.'
        : error.request
          ? `Cannot connect to the SmartRide API at ${env.apiUrl}. Make sure the backend is running and your phone and computer are on the same network.`
          : error.message || 'Unable to complete your request');

    return Promise.reject(new Error(message));
  },
);
