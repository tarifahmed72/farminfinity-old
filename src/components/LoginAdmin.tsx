import keycloak from "../keycloak"; // your Keycloak config file

const LoginAdmin = () => {
  keycloak.login(); // Will redirect to Keycloak
  return null;
};

export default LoginAdmin;
