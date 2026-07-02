import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCredentialWallet } from '../lib/sanctumAdvancedApi';

export default function CredentialWalletPanel({ user }) {
  const [creds, setCreds] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    fetchCredentialWallet(user.email).then(setCreds).catch(() => setCreds([]));
  }, [user?.email]);

  if (!creds.length) return null;

  return (
    <section className="rounded-2xl border p-5 bg-white">
      <h2 className="font-semibold text-[#4a1942] mb-2">Credential wallet</h2>
      <p className="text-xs text-gray-500 mb-3">Verify codes confirm platform storage only — not licensure or accreditation.</p>
      <ul className="space-y-2">
        {creds.map((c) => (
          <li key={c.id} className="text-sm border rounded-xl px-3 py-2 flex flex-wrap justify-between gap-2">
            <span>{c.title}</span>
            <Link to={`/verify-credential/${c.verify_hash}`} className="text-xs text-[#4a1942]/70 underline">{c.verify_hash}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}