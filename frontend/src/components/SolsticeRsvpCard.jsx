import { useEffect, useState } from 'react';
import { fetchCalendarEvents } from '../lib/collegeApi';
import { checkInEvent } from '../lib/sanctumAdvancedApi';
import { supabase } from '../lib/supabaseClient';

const SOLSTICE_TITLE = 'Sanctum Solstice Gathering';

export default function SolsticeRsvpCard({ user }) {
  const [event, setEvent] = useState(null);
  const [rsvpd, setRsvpd] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchCalendarEvents().then((events) => {
      const match = (events || []).find((e) => e.title === SOLSTICE_TITLE);
      setEvent(match || null);
    }).catch(() => setEvent(null));
  }, []);

  useEffect(() => {
    if (!user?.email || !event?.id) return;
    supabase.from('event_checkins').select('id').eq('event_id', event.id).eq('user_email', user.email.trim().toLowerCase()).maybeSingle()
      .then(({ data }) => setRsvpd(!!data));
  }, [user?.email, event?.id]);

  if (!event) return null;

  const rsvp = async () => {
    if (!user?.email) {
      setMsg('Sign in to RSVP.');
      return;
    }
    await checkInEvent(event.id, user.email);
    setRsvpd(true);
    setMsg('You are on the solstice list — see you in The Hearth.');
  };

  return (
    <section className="rounded-2xl border border-amber-300/40 bg-gradient-to-r from-amber-50/80 to-[#faf7f9] p-5">
      <p className="text-xs uppercase tracking-widest text-amber-900/60">Platform ritual</p>
      <h3 className="font-semibold text-[#4a1942] mt-1">{event.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{new Date(event.starts_at).toLocaleString()}</p>
      {event.description && <p className="text-xs text-gray-500 mt-2">{event.description}</p>}
      {rsvpd ? (
        <p className="text-sm text-emerald-700 mt-3">RSVP confirmed ✦</p>
      ) : (
        <button type="button" onClick={rsvp} className="mt-3 px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">
          RSVP for solstice
        </button>
      )}
      {msg && <p className="text-xs text-gray-500 mt-2">{msg}</p>}
    </section>
  );
}