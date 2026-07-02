import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyCredentialHash } from '../lib/sanctumAdvancedApi';

export default function VerifyCredential() {
  const { hash } = useParams();
  const [record, setRecord] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!hash) return;
    verifyCredentialHash(hash).then((r) => {
      if (!r) setErr('No matching record.');
      else setRecord(r);
    }).catch(() => setErr('Lookup failed.'));
  }, [hash]);

  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <h1 className="text-2xl font-semibold text-[#4a1942] mb-4">Credential verification</h1>
      {err && <p className="text-gray-600">{err}</p>}
      {record && (
        <>
          <p className="font-medium">{record.title}</p>
          <p className="text-sm text-gray-500 mt-2">Issued {new Date(record.issued_at).toLocaleDateString()}</p>
          <p className="text-[10px] text-red-600 mt-4 max-w-sm mx-auto">
            This confirms a platform record existed at issuance. Hazel Allure does not accredit, license, or endorse professional qualifications.
          </p>
        </>
      )}
      <Link to="/" className="inline-block mt-6 text-sm text-[#4a1942] underline">← Home</Link>
    </div>
  );
}