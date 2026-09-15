import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../lib/auth';
import { mapAuthError } from '../lib/signupFlow';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setOk(false);
      setMessage('Enter the email on your account.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setOk(true);
      setMessage('If that email is on file, a reset link is on its way. Check your inbox.');
    } catch (err) {
      setOk(false);
      setMessage(mapAuthError(err) || err.message || 'Could not send a reset link.');
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold text-[#4a1942]">Forgot your password?</h1>
        <p className="mt-3 text-gray-600">Enter your email and we will send a reset link.</p>
        <form onSubmit={submit} className="mt-8 bg-white border rounded-3xl p-8 text-left space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full border p-3.5 rounded-2xl"
            autoComplete="email"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
          {message && (
            <p className={`text-sm text-center ${ok ? 'text-emerald-700' : 'text-red-700'}`}>{message}</p>
          )}
        </form>
        <Link to="/login" className="inline-block mt-6 text-sm text-[#4a1942] underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
