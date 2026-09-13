import { useState } from 'react';

export default function Favorites() {
  const [favorites] = useState([]);

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight mb-6">My Favorites ❤️</h1>
      {favorites.length === 0 && <p className="text-gray-500">No favorites yet. Heart items in the Marketplace!</p>}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {favorites.map(item => (
          <div key={item.id} className="bg-white border rounded-3xl overflow-hidden">
            <img src={item.photo} className="h-36 w-full object-cover" />
            <div className="p-4">
              <div className="font-semibold">{item.name}</div>
              <div>${item.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}