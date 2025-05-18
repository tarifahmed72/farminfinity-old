import axios from 'axios';
import keycloak from '../keycloak';

const BASE_URL = 'https://dev-api.farmeasytechnologies.com/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable credentials for cross-origin requests
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip token for public endpoints
    if (config.url?.includes('/send-otp') || config.url?.includes('/verify-otp')) {
      return config;
    }

    try {
      // Check if token needs refresh
      const tokenExpired = keycloak.isTokenExpired();
      if (tokenExpired) {
        const refreshed = await keycloak.updateToken(5);
        if (refreshed) {
          localStorage.setItem('keycloak-token', keycloak.token || '');
        }
      }

      // Get the current valid token
      const token = keycloak.token || localStorage.getItem('keycloak-token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Redirect to login if no token available
        window.location.href = '/login';
        return Promise.reject('No valid token available');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Redirect to login on token refresh failure
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Try to refresh the token
        const refreshed = await keycloak.updateToken(5);
        if (refreshed) {
          // Token refreshed successfully, retry the original request
          const token = keycloak.token;
          localStorage.setItem('keycloak-token', token || '');
          error.config.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(error.config);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If refresh failed or not possible, redirect to login
      localStorage.removeItem('keycloak-token');
      localStorage.removeItem('keycloak-refresh-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 