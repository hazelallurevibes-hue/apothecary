import { useState } from 'react';
import { reportContent } from '../lib/moderationApi';

export default function ReportContentButton({ user, threadId, postId, cohortThreadId, cohortPostId }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);

  if (!user?.email) return null;

  const submit = async () => {
    if (!reason.trim()) return;
    await reportContent({ reporterEmail: user.email, reason, threadId, postId, cohortThreadId, cohortPostId });
    setDone(true);
    setOpen(false);
  };

  if (done) return <span className="text-xs text-gray-400">Reported — thank you</span>;

  return (
    <span>
      <button type="button" onClick={() => setOpen(!open)} className="text-xs text-gray-400 hover:text-red-600 underline">
        Report
      </button>
      {open && (
        <div className="mt-2 p-3 border rounded-xl bg-white text-sm space-y-2">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full border rounded-lg px-2 py-1 text-xs" placeholder="Why is this concerning?" />
          <button type="button" onClick={submit} className="text-xs px-3 py-1 bg-gray-800 text-white rounded-full">Submit report</button>
        </div>
      )}
    </span>
  );
}