import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://keycloak.farmeasytechnologies.com/',  
  realm: 'farm-infinity-realm-dev',           
  clientId: '001',
});

// Add Keycloak type and configuration
export type KeycloakConfig = {
  isAuthenticated: boolean;
  token: string | undefined;
  refreshToken: string | undefined;
};

// Initialize Keycloak with proper configuration
export const initKeycloak = async (): Promise<KeycloakConfig> => {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256', // Enable PKCE
      enableLogging: true,
    });

    if (authenticated) {
      // Set up token refresh
      keycloak.onTokenExpired = () => {
        keycloak.updateToken(70).catch(() => {
          console.error('Failed to refresh token');
          window.location.href = '/login';
        });
      };

      return {
        isAuthenticated: true,
        token: keycloak.token,
        refreshToken: keycloak.refreshToken,
      };
    }

    return {
      isAuthenticated: false,
      token: undefined,
      refreshToken: undefined,
    };
  } catch (error) {
    console.error('Failed to initialize Keycloak:', error);
    throw error;
  }
};

export default keycloak;
