import axios from 'axios';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const setTokens = (tokens: TokenResponse) => {
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  localStorage.setItem('token_expiry', (Date.now() + tokens.expires_in * 1000).toString());
};

export const getTokens = () => {
  return {
    access_token: localStorage.getItem('access_token'),
    refresh_token: localStorage.getItem('refresh_token'),
    token_expiry: localStorage.getItem('token_expiry'),
  };
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expiry');
};

export const isTokenExpired = () => {
  const expiry = localStorage.getItem('token_expiry');
  if (!expiry) return true;
  return Date.now() > parseInt(expiry);
};

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      return false;
    }

    // Create form data
    const formData = new URLSearchParams();
    formData.append('refresh_token', refresh_token);

    const response = await axios.post('https://dev-api.farmeasytechnologies.com/api/refresh-token', 
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        }
      }
    );

    const { data } = response;
    if (data.access_token) {
      setTokens(data);
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