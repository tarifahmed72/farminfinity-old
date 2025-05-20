import axios from 'axios';
import { getTokens, refreshAccessToken, clearTokens } from './auth';

// Ensure URL is HTTPS
const normalizeUrl = (url: string) => {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

// Use proxy in development, direct URL in production
const BASE_URL = import.meta.env.DEV 
  ? '/api'  // This will use the Vite proxy
  : 'https://dev-api.farmeasytechnologies.com/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: false
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Ensure the URL is HTTPS in production
    if (!import.meta.env.DEV && config.url) {
      config.url = normalizeUrl(config.url);
    }

    const { access_token } = getTokens();
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }

    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection and try again.'));
    }

    if (error.response.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const { access_token } = getTokens();
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return axiosInstance(error.config);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearTokens();
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }

    // Handle other common status codes
    switch (error.response.status) {
      case 400:
        return Promise.reject(new Error(error.response.data.detail || 'Invalid request. Please check your input.'));
      case 403:
        return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
      case 404:
        return Promise.reject(new Error('Resource not found.'));
      case 500:
        return Promise.reject(new Error('Server error. Please try again later.'));
      default:
        return Promise.reject(error);
    }
  }
);

export default axiosInstance; 