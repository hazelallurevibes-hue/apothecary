import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { mapAuthError } from '../lib/signupFlow';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage(mapAuthError(error) || 'This reset link may have expired. Request a new one.');
      return;
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-[#4a1942] text-center">Reset password</h1>
        <p className="mt-3 text-gray-600 text-center">Enter a new password for your Hazel Allure account.</p>
        <form onSubmit={submit} className="mt-8 bg-white border rounded-3xl p-8 space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full border p-3.5 rounded-2xl"
            autoComplete="new-password"
          />
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full border p-3.5 rounded-2xl"
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save new password'}
          </button>
          {message && <p className="text-sm text-red-700 text-center">{message}</p>}
        </form>
        <p className="text-center mt-6">
          <Link to="/forgot-password" className="text-sm text-[#4a1942] underline">
            Request a new link
          </Link>
        </p>
      </div>
    </div>
  );
}
