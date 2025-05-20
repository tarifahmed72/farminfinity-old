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
  : normalizeUrl('https://dev-api.farmeasytechnologies.com/api');

// Ensure the base URL is always HTTPS in production
if (!import.meta.env.DEV && !BASE_URL.startsWith('https://')) {
  throw new Error('Production API URL must use HTTPS');
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  },
  withCredentials: false // Disable credentials for cross-origin requests
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const { access_token } = getTokens();
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    
    // Convert request data to URLSearchParams if it's not already a string
    if (config.data && typeof config.data === 'object' && !(config.data instanceof URLSearchParams)) {
      config.data = new URLSearchParams(config.data).toString();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          // If refresh successful, retry the original request
          const { access_token } = getTokens();
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and reject
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 