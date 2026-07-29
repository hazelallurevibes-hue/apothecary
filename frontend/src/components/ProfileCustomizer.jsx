import { useEffect, useState } from 'react';
import ProfileAvatarFrame from './ProfileAvatarFrame';
import ProFeatureHint from './ProFeatureHint';
import { customerCan } from '../lib/plans';
import { isProMemberPrefEnabled } from '../lib/proMemberPrefs';
import {
  canUseProProfileFeatures,
  fetchProfileCustomization,
  PROFILE_FRAMES,
  SCRYING_FRAME_UNLOCK_CARDS,
  saveProfileCustomization,
  uploadProfileBanner,
} from '../lib/profileCustomization';
import { fetchLoginStreak, hasScryingUnlock } from '../lib/loginStreakApi';
import FamiliarPicker from './FamiliarPicker';
import { fetchBadgesForStudent, STUDENT_BADGE_TYPES } from '../lib/studentBadgesApi';
import { fetchUnlockedAchievements, getAchievementMeta } from '../lib/achievements';
import { trackAchievementEvent } from '../lib/achievements';
import { useImageAdjust } from './ImageAdjustModal';

export default function ProfileCustomizer({ user, onUpdate }) {
  const [bio, setBio] = useState('');
  const [accent, setAccent] = useState('#4a1942');
  const [banner, setBanner] = useState('');
  const [frame, setFrame] = useState('none');
  const [pinnedId, setPinnedId] = useState(null);
  const [showcase, setShowcase] = useState([]);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [tarotCards, setTarotCards] = useState(0);
  const [scryingPermanent, setScryingPermanent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [framePrefOn, setFramePrefOn] = useState(() => isProMemberPrefEnabled('profile_frame'));
  const [bannerPrefOn, setBannerPrefOn] = useState(() => isProMemberPrefEnabled('profile_banner'));
  const { requestAdjust, modal: imageAdjustModal } = useImageAdjust();

  const isPro = canUseProProfileFeatures(user);
  const canPinFeatures = customerCan(user, 'profile_custom');
  const canPin = canPinFeatures;
  const canShowcase = customerCan(user, 'showcase_achievements');
  const canBanner = canPinFeatures && bannerPrefOn;

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
    fetchLoginStreak(user.email)
      .then((s) => {
        setTarotCards((s?.cards_collected || []).length);
        setScryingPermanent(hasScryingUnlock(s));
      })
      .catch(() => { setTarotCards(0); setScryingPermanent(false); });
  }, [user?.email]);

  useEffect(() => {
    const sync = () => {
      setFramePrefOn(isProMemberPrefEnabled('profile_frame'));
      setBannerPrefOn(isProMemberPrefEnabled('profile_banner'));
    };
    window.addEventListener('hazel-pro-prefs-changed', sync);
    return () => window.removeEventListener('hazel-pro-prefs-changed', sync);
  }, []);

  const scryingUnlocked = scryingPermanent || tarotCards >= SCRYING_FRAME_UNLOCK_CARDS;
  const displayFrame = canPinFeatures && framePrefOn ? frame : 'none';

  const pinnedBadge = badges.find((b) => b.id === pinnedId);

  const save = async () => {
    if (!user?.email) return;
    setSaving(true);
    setMessage('');
    try {
      const frameToSave = canPin && (frame !== 'scrying' || scryingUnlocked) ? frame : 'none';
      const patch = {
        profile_bio: bio,
        profile_accent_color: isPro ? accent : '#4a1942',
        profile_banner_url: canBanner ? banner : null,
        profile_frame: frameToSave,
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
    const raw = e.target.files?.[0];
    e.target.value = '';
    if (!raw || !canBanner) return;
    const file = await requestAdjust(raw, 'Adjust profile banner');
    if (!file) return;
    setBannerUploading(true);
    setMessage('');
    try {
      const url = await uploadProfileBanner(file, user);
      setBanner(url);
      setMessage('Banner uploaded — click Save profile studio to apply.');
    } catch (err) {
      setMessage(err.message || 'Banner upload failed.');
    } finally {
      setBannerUploading(false);
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
      {imageAdjustModal}
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
          frameKey={displayFrame}
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

      {!isPro && <ProFeatureHint hintKey="profile_frame" user={user} />}
      {!isPro && <ProFeatureHint hintKey="profile_banner" user={user} />}
      {isPro && !framePrefOn && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Portrait frames are off in{' '}
          <a href="#pro-member-prefs" className="underline font-medium">Pro preferences</a>
          . Turn on &ldquo;Portrait frame&rdquo; to style your avatar.
        </p>
      )}

      {canPin && (
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm block">
            Accent color
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="mt-1 h-10 w-full rounded-lg" />
          </label>
          <label className="text-sm block">
            Banner image
            <input type="file" accept="image/*" onChange={onBannerUpload} disabled={bannerUploading} className="mt-1 text-xs w-full" />
            <span className="text-[10px] text-gray-400">{bannerUploading ? 'Uploading…' : 'Up to 15 MB, auto-resized'}</span>
          </label>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-600 mb-2">Portrait frame</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PROFILE_FRAMES).map(([key, f]) => {
                const locked = key === 'scrying' && !scryingUnlocked;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={locked}
                    onClick={() => !locked && setFrame(key)}
                    className={`px-3 py-1.5 rounded-full text-xs border ${frame === key ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'border-gray-200'} ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={locked ? `Collect ${SCRYING_FRAME_UNLOCK_CARDS} tarot cards (${tarotCards}/${SCRYING_FRAME_UNLOCK_CARDS})` : f.label}
                  >
                    {f.label}{locked ? ' 🔒' : ''}
                  </button>
                );
              })}
            </div>
            {!scryingUnlocked && (
              <p className="text-[10px] text-gray-500 mt-2">
                Scrying mirror unlocks at {SCRYING_FRAME_UNLOCK_CARDS}/78 tarot cards — you have {tarotCards}.
              </p>
            )}
            {scryingPermanent && (
              <p className="text-[10px] text-indigo-600 mt-2">Scrying mirror permanently unlocked — yours even if streak resets.</p>
            )}
          </div>
        </div>
      )}

      {badges.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Pin a class honor beside your portrait</p>
          {!isPro && <ProFeatureHint hintKey="student_badge_pin" user={user} />}
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
          {!isPro && <ProFeatureHint hintKey="showcase_achievements" user={user} />}
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

      <FamiliarPicker user={user} onUpdate={onUpdate} />

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