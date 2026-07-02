import { useEffect, useState } from 'react';
import ProfileAvatarFrame from './ProfileAvatarFrame';
import ProFeatureHint from './ProFeatureHint';
import { customerCan } from '../lib/plans';
import {
  canUseProProfileFeatures,
  fetchProfileCustomization,
  PROFILE_FRAMES,
  saveProfileCustomization,
  uploadProfileBanner,
} from '../lib/profileCustomization';
import { fetchBadgesForStudent, STUDENT_BADGE_TYPES } from '../lib/studentBadgesApi';
import { fetchUnlockedAchievements, getAchievementMeta } from '../lib/achievements';
import { trackAchievementEvent } from '../lib/achievements';

export default function ProfileCustomizer({ user, onUpdate }) {
  const [bio, setBio] = useState('');
  const [accent, setAccent] = useState('#4a1942');
  const [banner, setBanner] = useState('');
  const [frame, setFrame] = useState('none');
  const [pinnedId, setPinnedId] = useState(null);
  const [showcase, setShowcase] = useState([]);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isPro = canUseProProfileFeatures(user);
  const canPin = customerCan(user, 'profile_custom');
  const canShowcase = customerCan(user, 'showcase_achievements');

  useEffect(() => {
    if (!user?.email) return;
    fetchProfileCustomization(user.email)
      .then((p) => {
        if (!p) return;
        setBio(p.profile_bio || '');
        setAccent(p.profile_accent_color || '#4a1942');
        setBanner(p.profile_banner_url || '');
        setFrame(p.profile_frame || 'none');
        setPinnedId(p.pinned_student_badge_id);
        setShowcase(p.showcase_achievements || []);
      })
      .catch(() => {});
    fetchBadgesForStudent(user.email).then(setBadges).catch(() => setBadges([]));
    fetchUnlockedAchievements(user.email).then(setAchievements).catch(() => setAchievements([]));
  }, [user?.email]);

  const pinnedBadge = badges.find((b) => b.id === pinnedId);

  const save = async () => {
    if (!user?.email) return;
    setSaving(true);
    setMessage('');
    try {
      const patch = {
        profile_bio: bio,
        profile_accent_color: isPro ? accent : '#4a1942',
        profile_banner_url: canPin ? banner : null,
        profile_frame: canPin ? frame : 'none',
        pinned_student_badge_id: canPin ? pinnedId : null,
        showcase_achievements: canShowcase ? showcase : [],
      };
      await saveProfileCustomization(user.email, patch);
      await trackAchievementEvent(user.email, 'profile_customized');
      setMessage('Profile saved.');
      onUpdate?.({ ...user, ...patch });
    } catch (e) {
      setMessage(e.message || 'Save failed — run SQL migration 26 if columns are missing.');
    } finally {
      setSaving(false);
    }
  };

  const onBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !canPin) return;
    try {
      const url = await uploadProfileBanner(file, user);
      setBanner(url);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const toggleShowcase = (id) => {
    if (!canShowcase) return;
    setShowcase((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  };

  return (
    <section className="rounded-2xl border border-[#4a1942]/10 bg-white p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#4a1942]">Profile studio</h2>
        <p className="text-sm text-gray-500 mt-1">Shape how you appear across the gathering and Sanctum.</p>
      </div>

      {banner && (
        <div
          className="h-24 rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${banner})` }}
        />
      )}

      <div className="flex flex-wrap gap-6 items-start">
        <ProfileAvatarFrame
          avatarUrl={user?.avatar}
          name={user?.name}
          frameKey={frame}
          pinnedBadge={pinnedBadge}
          accentColor={accent}
          size="lg"
        />
        <div className="flex-1 min-w-[200px] space-y-3">
          <label className="block text-sm">
            <span className="text-gray-600">Short bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
              placeholder="A line or two about your path…"
            />
          </label>
        </div>
      </div>

      {!canPin && <ProFeatureHint hintKey="profile_frame" />}
      {!canPin && <ProFeatureHint hintKey="profile_banner" />}

      {canPin && (
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm block">
            Accent color
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="mt-1 h-10 w-full rounded-lg" />
          </label>
          <label className="text-sm block">
            Banner image
            <input type="file" accept="image/*" onChange={onBannerUpload} className="mt-1 text-xs w-full" />
          </label>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-600 mb-2">Portrait frame</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PROFILE_FRAMES).map(([key, f]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFrame(key)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${frame === key ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'border-gray-200'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {badges.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Pin a class honor beside your portrait</p>
          {!canPin && <ProFeatureHint hintKey="student_badge_pin" />}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => canPin && setPinnedId(null)}
              className={`px-3 py-1.5 rounded-full text-xs border ${!pinnedId ? 'bg-gray-100' : ''}`}
            >
              None
            </button>
            {badges.map((b) => (
              <button
                key={b.id}
                type="button"
                disabled={!canPin}
                onClick={() => setPinnedId(b.id)}
                className={`px-3 py-1.5 rounded-full text-xs border ${pinnedId === b.id ? 'bg-[#4a1942] text-white' : ''}`}
              >
                {STUDENT_BADGE_TYPES[b.badge_type]?.icon} {b.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Discovered milestones (choose up to 6 to display)</p>
          {!canShowcase && <ProFeatureHint hintKey="showcase_achievements" />}
          <div className="flex flex-wrap gap-2">
            {achievements.map((id) => {
              const meta = getAchievementMeta(id);
              if (!meta) return null;
              const on = showcase.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  disabled={!canShowcase}
                  onClick={() => toggleShowcase(id)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${on ? 'bg-amber-50 border-amber-200' : 'border-gray-200'}`}
                >
                  {meta.icon}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded-full bg-[#4a1942] text-white text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </section>
  );
}