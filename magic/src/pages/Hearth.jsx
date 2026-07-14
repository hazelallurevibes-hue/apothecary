import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  deleteJournalEntry,
  loadHearthPosts,
  loadJournal,
  postToHearth,
  saveJournalEntry,
} from '../lib/storage';
import { randomVentPrompt } from '../lib/engines';
import { HAZEL_LINKS } from '../lib/hazel';

export default function Hearth() {
  const { can } = useAuth();
  const [tab, setTab] = useState('private');
  const [text, setText] = useState('');
  const [mood, setMood] = useState('vent');
  const [journal, setJournal] = useState(() => loadJournal());
  const [hearth, setHearth] = useState(() => loadHearthPosts());
  const [prompt, setPrompt] = useState(() => randomVentPrompt());
  const [msg, setMsg] = useState('');

  const savePrivate = () => {
    if (!text.trim()) return;
    setJournal(saveJournalEntry({ text: text.trim(), mood, private: true }));
    setText('');
    setMsg('Sealed in your private journal (this device).');
  };

  const postAnon = () => {
    if (!can('hearth_anonymous')) return;
    if (!text.trim()) return;
    setHearth(postToHearth({ text: text.trim(), mood }));
    setJournal(saveJournalEntry({ text: text.trim(), mood, private: true, alsoHearth: true }));
    setText('');
    setMsg('Posted anonymously to the local Hearth feed + saved privately.');
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-2xl text-[#4a1942]">Frustration box</h1>
      <p className="text-sm text-[#4a1942]/65">
        Vent, gossip, drama — privately first. Pro members may also toss an anonymous note into the
        Hearth (local feed for now; cloud hearth can expand later).
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            tab === 'private' ? 'bg-[#4a1942] text-white' : 'bg-white border border-[#4a1942]/20'
          }`}
          onClick={() => setTab('private')}
        >
          Private journal
        </button>
        <button
          type="button"
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            tab === 'hearth' ? 'bg-[#4a1942] text-white' : 'bg-white border border-[#4a1942]/20'
          }`}
          onClick={() => setTab('hearth')}
        >
          The Hearth
        </button>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xs italic text-[#4a1942]/60">{prompt}</p>
          <button
            type="button"
            className="text-[10px] underline shrink-0"
            onClick={() => setPrompt(randomVentPrompt())}
          >
            New prompt
          </button>
        </div>
        <select className="input" value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="vent">Vent</option>
          <option value="gossip">Gossip (kind-ish)</option>
          <option value="drama">Drama</option>
          <option value="gratitude">Gratitude sneak</option>
        </select>
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pour it out…"
          maxLength={500}
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <button type="button" className="btn-primary flex-1" onClick={savePrivate}>
            Save private
          </button>
          {can('hearth_anonymous') ? (
            <button type="button" className="btn-secondary flex-1" onClick={postAnon}>
              Anonymous to Hearth
            </button>
          ) : (
            <p className="text-[11px] text-center text-[#4a1942]/55 flex-1 self-center">
              Anonymous Hearth posts unlock with Hazel Pro.
            </p>
          )}
        </div>
        {msg && <p className="text-xs text-emerald-700">{msg}</p>}
      </div>

      {tab === 'private' && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-[#4a1942]/40">Your journal</p>
          {journal.length === 0 && (
            <p className="text-sm text-[#4a1942]/50">Empty — the box waits without judgment.</p>
          )}
          {journal.map((e) => (
            <div key={e.id} className="card p-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[10px] uppercase text-[#4a1942]/40">
                  {e.mood} · {new Date(e.createdAt).toLocaleString()}
                </span>
                <button
                  type="button"
                  className="text-[10px] text-red-600"
                  onClick={() => setJournal(deleteJournalEntry(e.id))}
                >
                  Delete
                </button>
              </div>
              <p className="mt-1 text-[#4a1942]/85 whitespace-pre-wrap">{e.text}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'hearth' && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-[#4a1942]/40">Anonymous hearth</p>
          <p className="text-[11px] text-[#4a1942]/50">
            Local device feed for beta. Community moderation + shared Supabase hearth can follow.
          </p>
          {!can('hearth_anonymous') && (
            <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary text-xs inline-flex">
              Unlock Hearth posts with Pro
            </a>
          )}
          {hearth.length === 0 && (
            <p className="text-sm text-[#4a1942]/50">The hearth is quiet.</p>
          )}
          {hearth.map((e) => (
            <div key={e.id} className="card p-3 text-sm bg-[#1a0a18]/[0.03]">
              <p className="text-[10px] uppercase text-[#4a1942]/40">
                anonymous · {e.mood} · {new Date(e.createdAt).toLocaleString()}
              </p>
              <p className="mt-1">{e.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
