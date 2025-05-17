import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import keycloak from './keycloak';

keycloak
  .init({
    onLoad: 'login-required',
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (authenticated) {
      // Store token
      localStorage.setItem("keycloak-token", keycloak.token || "");

      // Optional: refresh token every 60s
      setInterval(() => {
        keycloak
          .updateToken(60)
          .then((refreshed) => {
            if (refreshed) {
              localStorage.setItem("keycloak-token", keycloak.token || "");
              console.log("Token refreshed");
            }
          })
          .catch(() => {
            console.warn("Token refresh failed");
          });
      }, 60000); // every 60 seconds

      ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
    } else {
      window.location.reload();
    }
  })
  .catch((error) => {
    console.error('Keycloak init failed', error);
  });

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



