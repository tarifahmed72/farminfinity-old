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

    const response = await fetch('https://dev-api.farmeasytechnologies.com/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data: TokenResponse = await response.json();
    setTokens(data);
    return true;
  } catch (error) {
    clearTokens();
    return false;
  }
};

export const exchangeCodeForToken = async (code: string): Promise<boolean> => {
  try {
    const response = await fetch('https://dev-api.farmeasytechnologies.com/api/exchange-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      return false;
    }

    const data: TokenResponse = await response.json();
    setTokens(data);
    return true;
  } catch (error) {
    return false;
  }
}; 