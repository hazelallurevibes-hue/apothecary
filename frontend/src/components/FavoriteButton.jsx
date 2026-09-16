import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isFavorited, toggleFavorite } from '../lib/favoritesApi';

export default function FavoriteButton({ user, itemType = 'vendor', itemId = null, vendorId = null, className = '' }) {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      setOn(false);
      return;
    }
    let cancelled = false;
    isFavorited(user, { itemType, itemId, vendorId })
      .then((v) => {
        if (!cancelled) setOn(v);
      })
      .catch(() => {
        if (!cancelled) setOn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email, itemType, itemId, vendorId]);

  if (!user?.email) {
    return (
      <Link
        to="/login"
        className={`inline-flex items-center gap-1 text-sm font-medium text-[#4a1942] ${className}`}
      >
        ♡ Save
      </Link>
    );
  }

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const next = await toggleFavorite(user, { itemType, itemId, vendorId });
      setOn(next);
    } catch {
      /* keep prior */
    }
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={on}
      className={`inline-flex items-center gap-1 text-sm font-semibold disabled:opacity-60 ${on ? 'text-rose-700' : 'text-[#4a1942]'} ${className}`}
    >
      {on ? '♥ Saved' : '♡ Save'}
    </button>
  );
}
