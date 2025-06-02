import axios from 'axios';
import { getTokens, refreshAccessToken, clearTokens } from './auth';
import { API_CONFIG } from '../config/api';

// Ensure URL is HTTPS
const normalizeUrl = (url: string) => {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true // Enable credentials for CORS
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Add a callback to retry the original request
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Execute all stored callbacks with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip auth header for code exchange endpoint
    if (config.url === API_CONFIG.AUTH_ENDPOINTS.EXCHANGE_CODE) {
      return config;
    }

    // Ensure the URL is HTTPS in production
    if (!import.meta.env.DEV && config.url) {
      config.url = normalizeUrl(config.url);
    }

    const { access_token } = getTokens();
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }

    // Log request for debugging in development
    if (import.meta.env.DEV) {
      console.debug('API Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
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
  (response) => {
    // Log successful response for debugging in development
    if (import.meta.env.DEV) {
      console.debug('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    // Log error details for debugging in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    }

    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection and try again.'));
    }

    const originalRequest = error.config;

    // Handle 401 and token refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for token refresh and retry with new token
        try {
          const token = await new Promise<string>(resolve => {
            subscribeTokenRefresh((token: string) => {
              resolve(token);
            });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const { access_token } = getTokens();
          if (access_token) {
            isRefreshing = false;
            onTokenRefreshed(access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      isRefreshing = false;
      clearTokens();
      window.location.href = '/';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle other common status codes
    switch (error.response.status) {
      case 400:
        return Promise.reject(new Error(error.response.data?.detail || 'Invalid request. Please check your input.'));
      case 403:
        return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
      case 404:
        return Promise.reject(new Error('Resource not found. The requested data might have been moved or deleted.'));
      case 429:
        return Promise.reject(new Error('Too many requests. Please try again later.'));
      case 500:
        return Promise.reject(new Error('Server error. Our team has been notified. Please try again later.'));
      default:
        return Promise.reject(error.response.data?.detail || error.message || 'An unexpected error occurred.');
    }
  }
);

export default axiosInstance; 