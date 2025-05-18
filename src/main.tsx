import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import keycloak, { initKeycloak } from './keycloak';

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
};

// Initialize the application
const init = async () => {
  try {
    const auth = await initKeycloak();
    
    if (auth.isAuthenticated && auth.token) {
      // Store tokens
      localStorage.setItem('keycloak-token', auth.token);
      if (auth.refreshToken) {
        localStorage.setItem('keycloak-refresh-token', auth.refreshToken);
      }

      // Set up periodic token refresh (every 5 minutes)
      setInterval(() => {
        keycloak.updateToken(300)
          .then((refreshed) => {
            if (refreshed) {
              localStorage.setItem('keycloak-token', keycloak.token || '');
              console.log('Token refreshed successfully');
            }
          })
          .catch((error) => {
            console.error('Token refresh failed:', error);
            // Redirect to login on token refresh failure
            window.location.href = '/login';
          });
      }, 300000); // 5 minutes

      // Render the application
      renderApp();
    } else {
      console.error('Authentication failed');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    // Handle initialization error (show error page or retry)
  }
};

// Start the application
init();

// import ReactDOM from 'react-dom/client';
// import App from './App.tsx';
// import './index.css';
// import { ReactKeycloakProvider } from '@react-keycloak/web';
// import keycloak from './keycloak';

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <ReactKeycloakProvider
//     authClient={keycloak}
//     initOptions={{
//       onLoad: 'login-required',
//       checkLoginIframe: false,
//     }}
//   >
//     <App />
//   </ReactKeycloakProvider>
// );



