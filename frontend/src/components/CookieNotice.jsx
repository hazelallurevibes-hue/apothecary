import { useState } from 'react';
import { Link } from 'react-router-dom';

const KEY = 'ha_cookie_notice_ok';

export default function CookieNotice() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(KEY) !== '1';
    } catch {
      return false;
    }
  });
  if (!open) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3">
      <div className="max-w-3xl mx-auto bg-[#2d1230] text-white rounded-2xl px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-3 shadow-lg">
        <p className="flex-1">
          We use essential cookies and local storage so you can stay signed in. We do not sell your data for ads.{' '}
          <Link to="/policies-procedures#cookies" className="underline">
            Cookie policy
          </Link>
        </p>
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-white text-[#4a1942] font-semibold shrink-0"
          onClick={() => {
            try {
              localStorage.setItem(KEY, '1');
            } catch {
              /* ignore */
            }
            setOpen(false);
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
