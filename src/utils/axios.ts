import axios from 'axios';

const BASE_URL = 'https://dev-api.farmeasytechnologies.com/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
  },
  withCredentials: false // Set this to false for cross-origin requests without credentials
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Don't add token for login-related endpoints
    if (config.url?.includes('/send-otp') || config.url?.includes('/verify-otp')) {
      return config;
    }

    const token = localStorage.getItem('keycloak-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('keycloak-token');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 