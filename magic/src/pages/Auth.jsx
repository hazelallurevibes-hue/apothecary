import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithEmail } from '../lib/auth';
import { HAZEL_LINKS } from '../lib/hazel';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const { refresh, user } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    nav(next, { replace: true });
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await signInWithEmail(email, password);
      await refresh();
      nav(next, { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="font-display font-bold text-2xl text-[#4a1942]">Sign in to Magic Sanctum</h1>
      <p className="text-sm text-[#4a1942]/65">
        Same Hazel Allure account as the apothecary. New seekers create an account there first.
      </p>

      <form onSubmit={submit} className="card p-5 space-y-3">
        <input
          className="input"
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="card p-4 text-sm space-y-2 text-center">
        <a href={HAZEL_LINKS.signup()} className="btn-secondary w-full block">
          Create account on Hazel Allure
        </a>
        <a
          href={HAZEL_LINKS.login('https://magic.hazelallure.com/settings')}
          className="text-xs underline text-[#4a1942]/70 block"
        >
          Or use full apothecary login (Google, etc.)
        </a>
        <Link to="/" className="text-xs text-[#4a1942]/50 block">
          ← Back to sphere
        </Link>
      </div>
    </div>
  );
}
