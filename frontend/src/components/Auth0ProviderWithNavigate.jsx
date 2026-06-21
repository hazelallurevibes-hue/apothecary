import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { getAuth0ProviderProps } from '../lib/auth0Config';

export default function Auth0ProviderWithNavigate({ children }) {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      {...getAuth0ProviderProps()}
      onRedirectCallback={(appState) => {
        const target = appState?.returnTo || '/';
        navigate(target, { replace: true });
      }}
    >
      {children}
    </Auth0Provider>
  );
}