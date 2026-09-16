import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFavorites, toggleFavorite } from '../lib/favoritesApi';

export default function Favorites({ user }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    if (!user?.email) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchFavorites(user)
      .then(setFavorites)
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [user?.email]);

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight mb-2 text-[#4a1942]">My Favorites</h1>
      <p className="text-gray-600 mb-6">Saved practitioners and listings. Heart anything on a shop or product page.</p>
      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && favorites.length === 0 && (
        <p className="text-gray-500">
          Nothing saved yet.{' '}
          <Link to="/products" className="text-[#4a1942] underline">
            Browse the apothecary
          </Link>
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {favorites.map((item) => (
          <div key={item.id} className="bg-white border rounded-3xl overflow-hidden">
            <Link to={item.href}>
              <img
                src={item.photo || '/brand/og-lockup.png'}
                alt=""
                className="h-36 w-full object-cover"
              />
              <div className="p-4">
                <div className="font-semibold text-[#2d1230]">{item.name}</div>
                {item.price != null && <div className="text-sm text-gray-500">${Number(item.price).toFixed(2)}</div>}
              </div>
            </Link>
            <button
              type="button"
              className="w-full text-xs py-2 border-t text-rose-800"
              onClick={async () => {
                await toggleFavorite(user, {
                  itemType: item.item_type,
                  itemId: item.item_id,
                  vendorId: item.vendor_id,
                });
                reload();
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
