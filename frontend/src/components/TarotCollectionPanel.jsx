import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLoginStreak } from '../lib/loginStreakApi';
import { TAROT_DECK, TAROT_DISCLAIMER } from '../lib/tarotDeck';
import TarotCardFace from './TarotCardFace';
import TarotCardDetailModal from './TarotCardDetailModal';

export default function TarotCollectionPanel({ user, compact, className = '' }) {
  const [streak, setStreak] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    fetchLoginStreak(user.email).then(setStreak).catch(() => setStreak(null));
  }, [user?.email]);

  if (!user?.email) return null;

  const collected = new Set(streak?.cards_collected || []);
  const count = collected.size;

  if (compact) {
    return (
      <Link to="/tarot-collection" className={`block rounded-2xl border border-indigo-200/50 bg-indigo-50/30 p-4 hover:border-[#4a1942]/30 transition ${className}`}>
        <p className="text-xs uppercase tracking-widest text-indigo-900/60">Daily tarot path</p>
        <p className="text-lg font-semibold text-[#4a1942]">{count} / 78 cards</p>
        <p className="text-xs text-gray-500">Streak: {streak?.current_streak || 0} days · miss a day, collection resets</p>
      </Link>
    );
  }

  return (
    <section className="rounded-3xl border p-6 bg-[#faf7f9]">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-widest text-[#4a1942]/60">78-day tarot path</p>
        <h2 className="text-xl font-semibold text-[#4a1942]">Your collection · {count} / 78</h2>
        <p className="text-sm text-gray-600 mt-1">
          Log in each day in a row to reveal one card. Miss a day — streak and collection reset.
          Current streak: <strong>{streak?.current_streak || 0}</strong>
          {streak?.longest_streak > 0 && <> · Best: {streak.longest_streak}</>}
        </p>
        <p className="text-[10px] text-red-600 mt-2">{TAROT_DISCLAIMER}</p>
      </header>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {TAROT_DECK.map((card) => (
          <TarotCardFace
            key={card.id}
            card={card}
            revealed={collected.has(card.id)}
            size="sm"
            className="w-full"
            onClick={collected.has(card.id) ? () => setSelectedCard(card) : undefined}
          />
        ))}
      </div>
      <TarotCardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </section>
  );
}