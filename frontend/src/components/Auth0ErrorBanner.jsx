import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

export default function Auth0ErrorBanner() {
  const { error } = useAuth0();
  if (!error) return null;

  const msg = error.message || String(error);

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-900">
      <div className="font-semibold mb-1">Auth0 sign-in error</div>
      <p className="text-xs break-words">{msg}</p>
      {msg.toLowerCase().includes('callback') && (
        <p className="text-xs mt-2 text-red-800">
          If this says &quot;Callback URL mismatch&quot;, add <code className="bg-red-100 px-1 rounded">{window.location.origin}</code> to Allowed Callback URLs in your Auth0 Application settings (type: Single Page Application).
        </p>
      )}
      <p className="text-xs mt-2">
        You can still <Link to="/login" className="underline font-medium">sign in with email</Link> below while Auth0 is being configured.
      </p>
    </div>
  );
}