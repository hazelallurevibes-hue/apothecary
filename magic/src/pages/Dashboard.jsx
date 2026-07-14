import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import { drawDailyFortune, fortuneStats } from '../lib/fortune';
import { loadLocalProfile, setDobAndBuild, syncProfileToSupabase, uploadAvatar } from '../lib/profileStore';
import { loadXp, levelFromXp, unlockedList, unlockAchievement, noteFortuneStreak } from '../lib/achievements';
import { HAZEL_LINKS } from '../lib/hazel';
import { profileBlurb } from '../lib/celestial';
import { restoreSession } from '../lib/auth';
import { supabaseAuth } from '../lib/supabaseAuth';

export default function Dashboard() {
  const { user, isPremium, refresh, setUser } = useAuth();
  const [celestial, setCelestial] = useState(() => loadLocalProfile());
  const [dob, setDob] = useState(() => loadLocalProfile()?.dob || '');
  const [name, setName] = useState(() => loadLocalProfile()?.birthName || user?.name || '');
  const [fortune, setFortune] = useState(null);
  const [xp, setXp] = useState(() => loadXp());
  const [achievements, setAchievements] = useState(() => unlockedList());
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const fStats = fortuneStats();

  useEffect(() => {
    if (!user) return;
    const daily = drawDailyFortune({
      userId: user.id,
      email: user.email,
      celestial,
    });
    setFortune(daily);
    noteFortuneStreak();
    unlockAchievement('first_fortune');
    setXp(loadXp());
    setAchievements(unlockedList());
  }, [user?.id, celestial?.dob]);

  const saveDob = async () => {
    setErr('');
    setMsg('');
    try {
      const profile = setDobAndBuild({ dob, name });
      setCelestial(profile);
      unlockAchievement('dob_set');
      setAchievements(unlockedList());
      setXp(loadXp());
      if (user?.email) {
        const res = await syncProfileToSupabase(user.email, profile, user.avatar);
        setMsg(
          res.ok
            ? 'Chart sealed + synced to your Hazel profile.'
            : 'Chart sealed on this device. Run SQL migration to sync signs to apothecary users table.',
        );
      } else {
        setMsg('Chart sealed locally — sign in to sync across Magic & apothecary.');
      }
    } catch (e) {
      setErr(e.message || 'Could not save');
    }
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBusy(true);
    setErr('');
    try {
      const url = await uploadAvatar(file, user.authId || user.id);
      // local update + users.avatar attempt
      if (typeof url === 'string' && url.startsWith('http')) {
        await supabaseAuth.from('users').update({ avatar: url }).ilike('email', user.email);
      }
      const u = await restoreSession();
      if (u) {
        // attach data url avatar if needed
        if (url && !u.avatar) u.avatar = url;
        else if (url?.startsWith('data:')) u.avatar = url;
        else if (url) u.avatar = url;
        setUser?.(u);
      }
      setMsg('Profile picture updated.');
      await refresh();
    } catch (ex) {
      setErr(ex.message || 'Avatar upload failed');
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="card p-6 text-center space-y-3">
        <SeoHead title="Sanctum Dashboard — Sign in" path="/dashboard" />
        <p className="text-3xl">✨</p>
        <h1 className="font-display font-bold text-2xl text-[#4a1942]">Your sanctum dashboard</h1>
        <p className="text-sm text-[#4a1942]/65">
          Sign in to unlock daily fortune, celestial chart from your birthday, achievements, and profile
          tools — same account as the apothecary.
        </p>
        <a href="/auth" className="btn-primary inline-flex">
          Sign in
        </a>
        <a href={HAZEL_LINKS.signup()} className="btn-secondary inline-flex">
          Create account with birthday later
        </a>
      </div>
    );
  }

  const level = levelFromXp(xp.xp);

  return (
    <div className="space-y-5">
      <SeoHead
        title="Sanctum Dashboard — Fortune, Chart & Profile | Magic Sanctum"
        description="Daily fortune cookie, western + Chinese zodiac, lucky numbers, achievements, and profile settings."
        path="/dashboard"
      />

      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-[#c9a227]/50" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4a1942] to-[#1a0a18] text-white flex items-center justify-center text-2xl font-bold">
              {(user.name || '?')[0]}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 bg-[#c9a227] text-[#1a0a18] text-[9px] font-black px-1.5 py-0.5 rounded-full cursor-pointer">
            {busy ? '…' : 'Edit'}
            <input type="file" accept="image/*" className="hidden" onChange={onAvatar} disabled={busy} />
          </label>
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-2xl text-[#4a1942] truncate">{user.name}</h1>
          <p className="text-xs text-[#4a1942]/55">{user.email}</p>
          <p className="text-xs mt-1">
            Level {level} · {xp.xp || 0} XP · streak {xp.streak || 0}d
            {isPremium ? ' · Pro' : ' · Free'}
          </p>
          {celestial && (
            <p className="text-sm text-[#4a1942]/80 mt-1">{profileBlurb(celestial)}</p>
          )}
        </div>
      </div>

      {(msg || err) && (
        <p className={`text-xs font-semibold ${err ? 'text-red-600' : 'text-emerald-700'}`}>{err || msg}</p>
      )}

      {/* Daily fortune */}
      <section className="card p-5 space-y-3 border-[#c9a227]/40">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">
          Daily fortune · logged-in
        </p>
        {fortune ? (
          <>
            <p className="font-display text-xl text-[#4a1942] leading-snug">“{fortune.fortune}”</p>
            {fortune.word && (
              <p className="text-sm">
                <span className="font-bold">Word of the day ({fortune.word.lang}):</span>{' '}
                <span className="text-2xl align-middle">{fortune.word.word}</span>{' '}
                <span className="text-[#4a1942]/60">
                  ({fortune.word.roman}) — {fortune.word.meaning}
                </span>
              </p>
            )}
            <p className="text-sm">
              <span className="font-bold">Lucky numbers:</span>{' '}
              {fortune.luckyNumbers?.join(' · ')}
            </p>
            {fortune.personal && (
              <div className="text-xs text-[#4a1942]/65 space-y-0.5 bg-[#4a1942]/5 rounded-xl p-3">
                <p>{fortune.personal.western}</p>
                <p>{fortune.personal.chinese}</p>
                <p>
                  Celtic tree: {fortune.personal.celtic} · {fortune.personal.mayan} · Life path{' '}
                  {fortune.personal.lifePath}
                </p>
              </div>
            )}
            <ShareBar
              title="My daily fortune"
              text={fortune.fortune}
              meta={`Lucky ${fortune.luckyNumbers?.join(', ')} · ${fortune.word?.word || ''}`}
            />
            <p className="text-[10px] text-[#4a1942]/40">
              Cookie library: {fortune.librarySize || fStats.fortunes} · Words: {fortune.wordLibrary || fStats.words}
            </p>
          </>
        ) : (
          <p className="text-sm animate-pulse">Consulting the cookie jar…</p>
        )}
        {!celestial && (
          <p className="text-xs text-amber-800 bg-amber-50 rounded-xl p-2">
            Add your birthday below for celestial + Chinese year personalization.
          </p>
        )}
      </section>

      {/* DOB / chart */}
      <section className="card p-5 space-y-3">
        <h2 className="font-display font-bold text-lg text-[#4a1942]">Celestial chart (DOB)</h2>
        <p className="text-xs text-[#4a1942]/60">
          Western sun sign, Chinese animal year + element, Celtic tree, simplified Mayan kin, life path.
          Entertainment & culture — not predictive science.
        </p>
        <input
          className="input"
          type="text"
          placeholder="Name on chart"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
        <button type="button" className="btn-primary w-full" onClick={saveDob}>
          Seal chart
        </button>
        {celestial && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-[#4a1942]/5 p-3">
              <p className="font-bold text-[#4a1942]">Western</p>
              <p className="text-2xl">{celestial.western.symbol}</p>
              <p>
                {celestial.western.sign} · {celestial.western.element}
              </p>
            </div>
            <div className="rounded-xl bg-[#4a1942]/5 p-3">
              <p className="font-bold text-[#4a1942]">Chinese</p>
              <p className="text-2xl">{celestial.chinese.emoji}</p>
              <p>
                {celestial.chinese.animal} · {celestial.chinese.element}
              </p>
              <p className="text-[10px] opacity-70">{celestial.chinese.trait}</p>
            </div>
            <div className="rounded-xl bg-[#4a1942]/5 p-3">
              <p className="font-bold">Celtic</p>
              <p>{celestial.celticTree}</p>
            </div>
            <div className="rounded-xl bg-[#4a1942]/5 p-3">
              <p className="font-bold">Life path</p>
              <p className="text-2xl font-black">{celestial.lifePath}</p>
            </div>
          </div>
        )}
      </section>

      {/* Quick settings */}
      <section className="card p-4 space-y-2">
        <h2 className="font-display font-bold text-lg text-[#4a1942]">Quick settings</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link to="/settings" className="btn-secondary text-center text-xs">
            Full settings
          </Link>
          <Link to="/hearth-court" className="btn-secondary text-center text-xs">
            Hearth Court
          </Link>
          <Link to="/widget" className="btn-secondary text-center text-xs">
            Desk Orb
          </Link>
          <a href={HAZEL_LINKS.account()} className="btn-secondary text-center text-xs">
            Apothecary profile
          </a>
        </div>
      </section>

      {/* Achievements */}
      <section className="card p-4">
        <h2 className="font-display font-bold text-lg text-[#4a1942]">Achievements</h2>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {achievements.length === 0 && (
            <p className="text-xs text-[#4a1942]/50 col-span-2">Play tools to unlock badges.</p>
          )}
          {achievements.map((a) => (
            <div key={a.id} className="rounded-xl border border-[#c9a227]/30 p-2 text-xs">
              <span className="text-lg">{a.emoji}</span>
              <p className="font-bold text-[#4a1942]">{a.name}</p>
              <p className="text-[#4a1942]/55">{a.desc}</p>
              <ShareBar
                compact
                title={a.name}
                text={`I unlocked “${a.name}” on Magic Sanctum — ${a.desc}`}
                meta={`${a.emoji} +${a.xp} XP`}
              />
            </div>
          ))}
        </div>
      </section>

      <ApothecaryFunnel />
    </div>
  );
}
