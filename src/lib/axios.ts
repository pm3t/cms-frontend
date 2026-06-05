import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Authorization Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      // 401: Unauthorized -> Logout and Redirect
      if (response.status === 401) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }

      // 403: Forbidden -> Throw with specific message
      if (response.status === 403) {
        const message = response.data?.error || 'Access denied';
        return Promise.reject(new Error(message));
      }
    }

    // Generic error handling
    const errorMessage = response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
