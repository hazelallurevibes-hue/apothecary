import { useEffect, useState } from 'react';
import { proposeGatheringTopic, voteProposal } from '../lib/sanctumAdvancedApi';
import { supabase } from '../lib/supabaseClient';

export default function GatheringProposals({ user }) {
  const [proposals, setProposals] = useState([]);
  const [title, setTitle] = useState('');

  const load = () => {
    supabase.from('gathering_proposals').select('*').eq('status', 'open').order('votes', { ascending: false }).limit(10)
      .then(({ data }) => setProposals(data || []));
  };

  useEffect(() => { load(); }, []);

  const propose = async () => {
    if (!user?.email || !title.trim()) return;
    await proposeGatheringTopic({ proposerEmail: user.email, title, body: '' });
    setTitle('');
    load();
  };

  return (
    <section className="rounded-2xl border p-4 bg-[#faf7f9] mb-6">
      <h3 className="font-semibold text-[#4a1942] text-sm mb-2">Student voice — topic proposals</h3>
      {user && (
        <div className="flex gap-2 mb-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 border rounded-xl px-3 py-2 text-sm" placeholder="Propose a Hearth topic…" />
          <button type="button" onClick={propose} className="px-3 py-2 rounded-full bg-[#4a1942] text-white text-xs">Propose</button>
        </div>
      )}
      {proposals.map((p) => (
        <div key={p.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0">
          <span>{p.title}</span>
          <button type="button" onClick={() => voteProposal(p.id).then(load)} className="text-xs text-[#4a1942]">{p.votes} ↑</button>
        </div>
      ))}
    </section>
  );
}