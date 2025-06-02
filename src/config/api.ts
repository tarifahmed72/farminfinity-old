// Ensure HTTPS URL
const normalizeUrl = (url: string) => {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_URL || 'https://dev-api.farmeasytechnologies.com/api');

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  TOKEN_REFRESH_INTERVAL: 4 * 60 * 1000, // 4 minutes (shorter than the buffer time)
  AUTH_ENDPOINTS: {
    LOGIN: '/login',
    REFRESH_TOKEN: '/refresh-token',
    VERIFY_OTP: '/verify-otp',
    SEND_OTP: '/send-otp'
  }
};

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
  USER_TYPE: 'user_type'
};

export const USER_TYPES = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT'
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES]; 