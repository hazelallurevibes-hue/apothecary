import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { STOREFRONT_SETTINGS_PATH } from '../lib/profileRoutes';
import { uploadProfileAvatar, persistUserAvatar } from '../lib/storageApi';
import {
  FREE_CUSTOMER_RATING_MIN_PURCHASES,
  getCustomerContext,
  getVendorContext,
  isProPlan,
  planBadgeLabel,
} from '../lib/plans';
import { fetchMySubscriptions, openBillingPortal } from '../lib/proBillingApi';
import MyLikesDislikesQuestionnaire from '../components/MyLikesDislikesQuestionnaire';
import { serializeAllergenIds } from '../lib/allergens';
import { syncAllergenToAuth0, syncAllergenToLocalUser } from '../lib/auth0MetadataSync';
import { fetchFoodPreferences, saveFoodPreferences, EMPTY_FOOD_PREFS } from '../lib/foodPreferences';
import { STORAGE_KEYS } from '../lib/storageKeys';
import LearningStyleChips from '../components/LearningStyleChips';
import ProfileCustomizer from '../components/ProfileCustomizer';
import ConfessionBoothPanel from '../components/ConfessionBoothPanel';
import { fetchUserLearningProfile, savePreferredLearningStyles } from '../lib/learningPathApi';
import { useSeoContext } from '../components/SeoContext';
import { fetchChosenFamiliar } from '../lib/familiarApi';
import { fetchLoginStreak } from '../lib/loginStreakApi';
import { getMoonPhase } from '../lib/seasonalSanctum';
import { buildProfileSavePatch, updateUserProfile } from '../lib/userProfileUpdate';
import {
  enrollTotp,
  verifyTotpEnrollment,
  unenrollTotp,
  hasVerifiedTotp,
  listTotpFactors,
} from '../lib/twoFactorApi';

function familiarTierFromStreak(streak) {
  const n = streak?.current_streak || 0;
  if (n >= 30) return 3;
  if (n >= 14) return 2;
  if (n >= 7) return 1;
  return 0;
}

export default function AccountSettings({ user, onProfileUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [doordash, setDoordash] = useState(!!user?.doordash_linked);
  const [ubereats, setUbereats] = useState(!!user?.ubereats_linked);
  const [twoFA, setTwoFA] = useState({
    enabled: false,
    factorId: '',
    qrCode: '',
    secret: '',
    uri: '',
    token: '',
  });
  const [stylesStatus, setStylesStatus] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [foodPrefs, setFoodPrefs] = useState({ ...EMPTY_FOOD_PREFS });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [learningStyles, setLearningStyles] = useState([]);
  const [stylesSaving, setStylesSaving] = useState(false);
  const { setPageSeo } = useSeoContext();

  useEffect(() => {
    if (!user?.email) return undefined;
    let cancelled = false;
    (async () => {
      const [familiarId, streak] = await Promise.all([
        fetchChosenFamiliar(user.email).catch(() => user?.chosen_familiar || null),
        fetchLoginStreak(user.email).catch(() => null),
      ]);
      if (cancelled) return;
      const moon = getMoonPhase();
      setPageSeo({
        familiarId: familiarId || undefined,
        familiarTier: familiarTierFromStreak(streak),
        familiarMood: moon.name,
      });
    })();
    return () => {
      cancelled = true;
      setPageSeo({});
    };
  }, [user?.email, user?.chosen_familiar, setPageSeo]);

  useEffect(() => {
    if (!user?.email) return;
    fetchFoodPreferences(user.email).then(setFoodPrefs).catch(() => setFoodPrefs({ ...EMPTY_FOOD_PREFS }));
    fetchUserLearningProfile(user.email)
      .then((p) => setLearningStyles(p.styles || []))
      .catch(() => setLearningStyles([]));
  }, [user?.email]);

  useEffect(() => {
    if (window.location.hash === '#profile') {
      document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (window.location.hash === '#billing') {
      document.getElementById('billing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    fetchMySubscriptions(user.email).then(setSubscriptions).catch(() => setSubscriptions([]));
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      try {
        const verified = await hasVerifiedTotp();
        const factors = verified ? await listTotpFactors() : [];
        setTwoFA((prev) => ({
          ...prev,
          enabled: verified,
          factorId: factors[0]?.id || '',
          qrCode: verified ? '' : prev.qrCode,
          secret: verified ? '' : prev.secret,
          uri: verified ? '' : prev.uri,
        }));
      } catch {
        setTwoFA((prev) => ({ ...prev, enabled: false }));
      }
    })();
  }, [user?.email]);

  const customerCtx = getCustomerContext(user);
  const vendorCtx = getVendorContext(user);
  const role = (user?.role || '').toLowerCase();

  const setup2FA = async () => {
    if (!user?.email) return;
    setStatus('');
    try {
      const data = await enrollTotp('Hazel Allure authenticator');
      setTwoFA({
        enabled: false,
        factorId: data.id,
        qrCode: data.totp?.qr_code || '',
        secret: data.totp?.secret || '',
        uri: data.totp?.uri || '',
        token: '',
      });
      setStatus('Scan the QR code or copy the secret into your authenticator app, then enter the 6-digit code.');
    } catch (e) {
      setStatus(e.message || '2FA setup failed. Sign out and back in, then try again.');
    }
  };

  const verify2FA = async () => {
    if (!twoFA.factorId || !twoFA.token || twoFA.token.length < 6) return;
    setStatus('');
    try {
      await verifyTotpEnrollment(twoFA.factorId, twoFA.token);
      setTwoFA({
        enabled: true,
        factorId: twoFA.factorId,
        qrCode: '',
        secret: '',
        uri: '',
        token: '',
      });
      setStatus('2FA enabled — you will need your authenticator app at next sign-in.');
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || '{}');
      saved.two_factor_enabled = 1;
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(saved));
    } catch (e) {
      setStatus(e.message || 'Invalid code. Try again.');
    }
  };

  const disable2FA = async () => {
    if (!twoFA.factorId) return;
    setStatus('');
    try {
      await unenrollTotp(twoFA.factorId);
      setTwoFA({ enabled: false, factorId: '', qrCode: '', secret: '', uri: '', token: '' });
      setStatus('2FA disabled.');
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || '{}');
      saved.two_factor_enabled = 0;
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(saved));
    } catch (e) {
      setStatus(e.message || 'Could not disable 2FA.');
    }
  };

  const handleLearningStylesChange = async (nextStyles) => {
    setLearningStyles(nextStyles);
    if (!user?.email) return;
    setStylesSaving(true);
    setStylesStatus('');
    try {
      await savePreferredLearningStyles(user.email, nextStyles);
      setStylesStatus(
        nextStyles.length
          ? 'Learning styles saved — course recommendations will match your path.'
          : 'Learning styles cleared.',
      );
    } catch (e) {
      setStylesStatus(e.message || 'Could not save learning styles.');
    } finally {
      setStylesSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.email) return;
    setSaving(true);
    setStatus('');
    const { error } = await updateUserProfile(
      user.email,
      buildProfileSavePatch({
        name,
        avatar,
        doordash_linked: doordash,
        ubereats_linked: ubereats,
        allergen_avoid: serializeAllergenIds(foodPrefs.allergen_avoid),
      }),
    );

    setSaving(false);
    if (error) {
      setStatus(error.message);
      return;
    }

    const allergenStr = serializeAllergenIds(foodPrefs.allergen_avoid);
    syncAllergenToLocalUser(foodPrefs.allergen_avoid);
    const auth0Sync = await syncAllergenToAuth0({ email: user.email, allergenIds: foodPrefs.allergen_avoid });

    const updated = {
      ...user,
      name,
      avatar,
      doordash_linked: doordash,
      ubereats_linked: ubereats,
      allergen_avoid: allergenStr,
    };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
    onProfileUpdate?.(updated);
    setStatus(auth0Sync.synced ? 'Profile saved (allergens synced to Auth0).' : 'Profile saved.');
  };

  const saveFoodPrefs = async () => {
    if (!user?.email) return;
    setPrefsSaving(true);
    setStatus('');
    try {
      await saveFoodPreferences(user.email, foodPrefs);
      syncAllergenToLocalUser(foodPrefs.allergen_avoid);
      await syncAllergenToAuth0({ email: user.email, allergenIds: foodPrefs.allergen_avoid });
      const updated = {
        ...user,
        food_prefs_completed_at: new Date().toISOString(),
        diet_type: foodPrefs.diet_type,
        customer_region: foodPrefs.customer_region,
        allergen_avoid: serializeAllergenIds(foodPrefs.allergen_avoid),
      };
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
      onProfileUpdate?.(updated);
      setStatus('Wellness preferences saved.');
    } catch (e) {
      setStatus(e.message);
    }
    setPrefsSaving(false);
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setStatus('');
    try {
      const url = await uploadProfileAvatar(file, user);
      setAvatar(url);
      await persistUserAvatar(user, url, onProfileUpdate);
      setStatus('Profile picture saved.');
    } catch (e) {
      setStatus(e.message || 'Upload failed. Try a smaller JPEG or PNG.');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Account Settings</h1>
      <p className="text-gray-600 mb-8">Manage your profile, plan, and security.</p>

      {(role === 'customer' || role === 'guest' || customerCtx) && (
        <div className="mb-6" id="wellness-prefs">
          <MyLikesDislikesQuestionnaire
            value={foodPrefs}
            onChange={setFoodPrefs}
            onSave={saveFoodPrefs}
            saving={prefsSaving}
          />
        </div>
      )}

      {(role === 'customer' || role === 'guest' || customerCtx) && (
        <div className="mb-6" id="profile-studio">
          <ProfileCustomizer user={user} onUpdate={onProfileUpdate} />
        </div>
      )}

      {(role === 'customer' || role === 'guest' || customerCtx) && (
        <ConfessionBoothPanel user={user} />
      )}

      {(role === 'customer' || role === 'guest' || customerCtx) && (
        <div className="mb-6 p-6 sm:p-8 bg-white border rounded-3xl" id="learning-styles">
          <h2 className="font-semibold text-xl mb-1">Learning path</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tell us how you learn best — we rank courses in the Sanctum to fit visual, auditory, hands-on, social, or solitary styles.
          </p>
          <LearningStyleChips
            value={learningStyles}
            onChange={handleLearningStylesChange}
            label="Your learning styles (VARK+)"
          />
          {(stylesSaving || stylesStatus) && (
            <p className={`mt-3 text-sm ${stylesStatus?.includes('Could not') ? 'text-red-600' : 'text-[#4a1942]'}`}>
              {stylesSaving ? 'Saving…' : stylesStatus}
            </p>
          )}
        </div>
      )}

      {(role === 'customer' || role === 'guest') && customerCtx && (
        <div className="mb-6 p-4 border rounded-3xl bg-white flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="font-semibold">{planBadgeLabel(customerCtx.plan, 'customer')}</div>
            <div className="text-sm text-gray-600 mt-1">
              {isProPlan(customerCtx.plan)
                ? 'Full access including ratings, favorites, and loyalty.'
                : `Buy, track orders, and link delivery apps. Ratings unlock after ${FREE_CUSTOMER_RATING_MIN_PURCHASES} purchases (${customerCtx.purchaseCount}/${FREE_CUSTOMER_RATING_MIN_PURCHASES}).`}
            </div>
          </div>
          {isProPlan(customerCtx.plan) ? (
            <button
              type="button"
              disabled={billingLoading}
              onClick={async () => {
                setBillingLoading(true);
                try {
                  await openBillingPortal({ planType: 'customer', email: user.email });
                } catch (e) {
                  setStatus(e.message);
                }
                setBillingLoading(false);
              }}
              className="text-sm px-4 py-2 border rounded-2xl hover:bg-gray-50 disabled:opacity-50"
            >
              Manage billing
            </button>
          ) : (
            <Link to="/pro-upgrade?type=customer" className="text-sm px-4 py-2 bg-[#4a1942] text-white rounded-2xl font-medium">
              Be a Pro Member
            </Link>
          )}
          {!isProPlan(customerCtx.plan) && !customerCtx.canRate && (
            <div className="text-xs bg-amber-50 text-amber-800 px-3 py-2 rounded-2xl w-full sm:w-auto">
              {customerCtx.purchasesUntilRating} purchases to rate
            </div>
          )}
        </div>
      )}

      {vendorCtx && !vendorCtx.isEmployee && (
        <div className="mb-6 p-4 border rounded-3xl bg-white">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <div className="font-semibold">{planBadgeLabel(vendorCtx.plan, 'vendor')}</div>
              <div className="text-sm text-gray-600 mt-1">
                {isProPlan(vendorCtx.plan)
                  ? 'Full storefront customization, analytics, and unlimited employees.'
                  : 'Selling, bio, profile editor, ratings, and 1 employee seat.'}
              </div>
            </div>
            {isProPlan(vendorCtx.plan) ? (
              <button
                type="button"
                disabled={billingLoading}
                onClick={async () => {
                  setBillingLoading(true);
                  try {
                    await openBillingPortal({ planType: 'vendor', email: user.email });
                  } catch (e) {
                    setStatus(e.message);
                  }
                  setBillingLoading(false);
                }}
                className="text-sm px-4 py-2 border rounded-2xl hover:bg-gray-50 disabled:opacity-50"
              >
                Manage billing
              </button>
            ) : (
              <Link to="/pro-upgrade?type=vendor" className="text-sm px-4 py-2 bg-[#4a1942] text-white rounded-2xl font-medium whitespace-nowrap">
                Be a Pro Practitioner
              </Link>
            )}
          </div>
          <Link to={STOREFRONT_SETTINGS_PATH} className="inline-block mt-3 text-sm text-[#4a1942] font-medium hover:underline">
            Edit storefront logo &amp; photos →
          </Link>
        </div>
      )}

      {vendorCtx?.isEmployee && (
        <div className="mb-6 p-4 border rounded-3xl bg-white">
          <div className="font-semibold">{planBadgeLabel(vendorCtx.plan, 'vendor')}</div>
          <div className="text-sm text-gray-600 mt-1">
            Employee access for practitioner #{vendorCtx.vendorId} — {vendorCtx.permissions.length} permissions
          </div>
        </div>
      )}

      {subscriptions.length > 0 && (
        <div id="billing" className="mb-6 p-4 border rounded-3xl bg-white scroll-mt-24">
          <h3 className="font-semibold mb-3">Pro subscription</h3>
          <div className="space-y-2 text-sm">
            {subscriptions.map((s) => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="capitalize">{s.plan_type} Pro — {s.status}</span>
                <span className="text-xs text-gray-500">
                  {s.current_period_end ? `Renews ${new Date(s.current_period_end).toLocaleDateString()}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div id="profile" className="bg-white border rounded-3xl p-6 sm:p-8 mb-6 scroll-mt-24">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer group shrink-0" title="Click to change photo">
              <img
                src={avatar || user?.avatar}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover border group-hover:ring-2 group-hover:ring-[#4a1942] transition"
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                disabled={uploading}
              />
            </label>
            <div>
              <div className="text-sm font-medium">Profile picture</div>
              <p className="text-[10px] text-gray-400">JPEG, PNG, or WebP up to 15 MB (auto-resized)</p>
              <label className="text-xs text-[#4a1942] cursor-pointer hover:underline">
                {uploading ? 'Uploading…' : 'Click photo or upload new'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border p-3 rounded-2xl"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              defaultValue={user?.email || 'you@example.com'}
              readOnly
              className="mt-1 w-full border p-3 rounded-2xl bg-gray-50"
            />
          </div>

          {(role === 'customer' || customerCtx) && customerCtx?.permissions.includes('delivery_connect') && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-3">Delivery app connections</div>
              <label className="flex items-center gap-2 text-sm mb-2">
                <input type="checkbox" checked={doordash} onChange={(e) => setDoordash(e.target.checked)} />
                DoorDash linked
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={ubereats} onChange={(e) => setUbereats(e.target.checked)} />
                Uber Eats linked
              </label>
              <p className="text-xs text-gray-500 mt-2">Used at checkout for live tracking (OAuth integration coming).</p>
            </div>
          )}

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="px-8 py-3 bg-[#4a1942] text-white rounded-3xl font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          {status && <p className="text-sm text-[#4a1942]">{status}</p>}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-xl">Two-Factor Authentication (2FA)</div>
            <div className="text-sm text-gray-600">Protect every account. Required on login when enabled.</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${twoFA.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {twoFA.enabled ? 'ENABLED' : 'OFF'}
          </div>
        </div>

        {!twoFA.enabled && !twoFA.factorId && (
          <button type="button" onClick={setup2FA} className="px-8 py-3 bg-black text-white rounded-3xl font-semibold">
            Set Up 2FA
          </button>
        )}

        {!twoFA.enabled && twoFA.factorId && (
          <div className="mt-4 p-4 bg-gray-50 border rounded-2xl text-sm">
            <div className="font-medium">1. Scan this QR code in your authenticator app:</div>
            {twoFA.qrCode && (
              <img src={twoFA.qrCode} alt="2FA QR code" className="mt-2 w-40 h-40 rounded-xl border bg-white" />
            )}
            {twoFA.secret && (
              <p className="mt-2 text-xs text-gray-600">
                Or enter secret manually: <code className="bg-white px-1 py-0.5 rounded border">{twoFA.secret}</code>
              </p>
            )}
            <div className="mt-3">2. Enter the 6-digit code:</div>
            <input
              value={twoFA.token}
              onChange={(e) => setTwoFA({ ...twoFA, token: e.target.value.replace(/\D/g, '') })}
              maxLength={6}
              inputMode="numeric"
              className="mt-1 w-40 border p-3 font-mono rounded-2xl tracking-[6px]"
              placeholder="123456"
            />
            <button type="button" onClick={verify2FA} className="ml-3 px-6 py-3 bg-emerald-700 text-white rounded-3xl text-sm">
              Verify &amp; Enable
            </button>
          </div>
        )}

        {twoFA.enabled && (
          <div>
            <div className="text-emerald-700 text-sm mb-3">2FA is active on this account.</div>
            <button type="button" onClick={disable2FA} className="text-xs px-4 py-2 border rounded-2xl">
              Disable 2FA (not recommended)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}