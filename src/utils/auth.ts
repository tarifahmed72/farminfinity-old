import axios from 'axios';
import { API_CONFIG, TOKEN_KEYS, UserType, USER_TYPES } from '../config/api';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

const isValidToken = (token: string | null): token is string => {
  return typeof token === 'string' && token.length > 0;
};

export const setTokens = (tokens: TokenResponse, userType?: UserType) => {
  if (!tokens.access_token) {
    throw new Error('Invalid access token');
  }

  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access_token);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, (Date.now() + tokens.expires_in * 1000).toString());
  if (userType) {
    localStorage.setItem(TOKEN_KEYS.USER_TYPE, userType);
  }
};

export const getTokens = () => {
  const tokens = {
    access_token: localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN),
    refresh_token: localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN),
    token_expiry: localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY),
    user_type: localStorage.getItem(TOKEN_KEYS.USER_TYPE) as UserType | null
  };

  // Validate tokens
  if (!isValidToken(tokens.access_token) && !isValidToken(tokens.refresh_token)) {
    clearTokens();
    return tokens;
  }

  return tokens;
};

export const clearTokens = () => {
  Object.values(TOKEN_KEYS).forEach(key => localStorage.removeItem(key));
  // Clear any other auth-related data
  localStorage.removeItem('keycloak-token');
  localStorage.removeItem('token');
};

export const isTokenExpired = () => {
  const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
  if (!expiry) return true;
  
  const expiryTime = parseInt(expiry);
  if (isNaN(expiryTime)) {
    clearTokens();
    return true;
  }
  
  // Add 30-second buffer to prevent edge cases
  return Date.now() > (expiryTime - 30000);
};

export const isAuthenticated = () => {
  const { access_token, user_type } = getTokens();
  return isValidToken(access_token) && !isTokenExpired() && !!user_type;
};

export const getUserType = (): UserType | null => {
  const userType = localStorage.getItem(TOKEN_KEYS.USER_TYPE) as UserType | null;
  return userType && Object.values(USER_TYPES).includes(userType) ? userType : null;
};

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const { refresh_token, user_type } = getTokens();
    if (!isValidToken(refresh_token)) {
      clearTokens();
      return false;
    }

    const formData = new URLSearchParams();
    formData.append('refresh_token', refresh_token);
    if (user_type) {
      formData.append('user_type', user_type);
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.REFRESH_TOKEN}`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        timeout: API_CONFIG.TIMEOUT
      }
    );

    const { data } = response;
    if (data.access_token) {
      setTokens(data, user_type || undefined);
      return true;
    }

    clearTokens();
    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    clearTokens();
    return false;
  }
}; 