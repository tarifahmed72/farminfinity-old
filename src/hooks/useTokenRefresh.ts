import { useEffect } from 'react';
import { isAuthenticated, refreshAccessToken, isTokenExpired } from '../utils/auth';
import { API_CONFIG } from '../config/api';

export const useTokenRefresh = () => {
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      return;
    }

    // Function to refresh token
    const refreshToken = async () => {
      if (isTokenExpired()) {
        await refreshAccessToken();
      }
    };

    // Initial token refresh
    refreshToken();

    // Set up periodic token refresh
    const intervalId = setInterval(refreshToken, API_CONFIG.TOKEN_REFRESH_INTERVAL);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
}; 