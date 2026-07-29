import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorContext, isVendorPro, vendorCan } from '../lib/plans';
import { MAKER_STUDIO_TOOLS } from '../lib/makerStudioCatalog';
import {
  emptyStudio,
  fetchMakerStudio,
  rewriteClaimLanguage,
  saveMakerStudio,
  scoreListingPhotoNotes,
  US_STATE_HERBAL_NOTES,
  voiceTranscriptToListing,
} from '../lib/makerStudioApi';
import { downloadText } from '../lib/csvExport';
import { supabase } from '../lib/supabaseClient';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'harvest', label: 'Harvest' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'blends', label: 'Blends' },
  { id: 'labels', label: 'Labels' },
  { id: 'trust', label: 'Trust' },
  { id: 'pickup', label: 'Pickup slots' },
  { id: 'consign', label: 'Consignment' },
  { id: 'ritual', label: 'Ritual tags' },
  { id: 'gift', label: 'Gift / kits / box' },
  { id: 'claims', label: 'Claims' },
  { id: 'states', label: 'State rules' },
  { id: 'photo', label: 'Photo score' },
  { id: 'story', label: 'Maker story' },
  { id: 'voice', label: 'Voice draft' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'packing', label: 'Packing' },
  { id: 'replies', label: 'Auto-replies' },
  { id: 'sections', label: 'Sections' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'vault', label: 'Client vault' },
  { id: 'hours', label: 'Office hours' },
];

function ProLock({ isPro, children }) {
  if (isPro) return children;
  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link
          to="/pro-upgrade?type=vendor&from=maker-studio"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white shadow"
        >
          Unlock with Pro →
        </Link>
      </div>
    </div>
  );
}

export default function VendorMakerStudio({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const isPro = isVendorPro(user);
  const [tab, setTab] = useState('overview');
  const [studio, setStudio] = useState(emptyStudio());
  const [vendorName, setVendorName] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [claimIn, setClaimIn] = useState('');
  const [claimOut, setClaimOut] = useState(null);
  const [photoFlags, setPhotoFlags] = useState({
    hasPhoto: true,
    bright: true,
    labelVisible: true,
    plainBackground: false,
    multipleAngles: false,
  });
  const [voiceIn, setVoiceIn] = useState('');
  const [voiceOut, setVoiceOut] = useState(null);
  const [blends, setBlends] = useState([]);
  const [listings, setListings] = useState([]);

  const load = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const { studio: s, vendorName: n, missingColumn } = await fetchMakerStudio(vendorId);
      setStudio(s);
      setVendorName(n || '');
      if (missingColumn) setMsg('Run maker_studio SQL migration to persist tools permanently.');
      const [{ data: produce }, { data: menu }, { data: reqs }] = await Promise.all([
        supabase.from('produce_items').select('id, name, quantity_available, price').eq('vendor_id', vendorId),
        supabase.from('menu_items').select('id, name, price').eq('vendor_id', vendorId),
        supabase
          .from('vendor_blend_requests')
          .select('*')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);
      setListings([
        ...(produce || []).map((p) => ({ ...p, kind: 'product' })),
        ...(menu || []).map((m) => ({ ...m, kind: 'service' })),
      ]);
      setBlends(reqs || []);
    } catch (e) {
      setMsg(e.message);
    }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (next) => {
    setStudio(next);
    if (!vendorId) return;
    setSaving(true);
    setMsg('');
    try {
      await saveMakerStudio(vendorId, next);
      setMsg('Maker Studio saved.');
    } catch (e) {
      setMsg(e.message || 'Could not save — check SQL migration.');
    }
    setSaving(false);
  };

  const photoScore = useMemo(() => scoreListingPhotoNotes(photoFlags), [photoFlags]);

  if (!vendorId) {
    return <p className="text-gray-500">Link a vendor profile to open Maker Studio.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">For makers & practitioners</p>
        <h1 className="text-3xl font-bold text-[#4a1942] heading-font">Maker Studio</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Tools built for herbalists, oil & candle makers, crystal shops, ritual goods, and natural skincare — the same
          list we market on signup and Free vs Pro.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link to="/vendor-dashboard" className="underline text-[#4a1942] font-medium">
            ← Dashboard
          </Link>
          <Link to="/vendor-pro-tools" className="underline text-gray-600">
            Pro SaaS toolkit
          </Link>
          <Link to="/pro-upgrade?type=vendor&from=maker-studio" className="underline text-[#c9a227] font-semibold">
            Free vs Pro
          </Link>
        </div>
      </header>

      {msg && (
        <p className="mb-4 text-sm rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 px-3 py-2">{msg}</p>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-full border ${
              tab === t.id ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'border-gray-200 text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading studio…</p>
      ) : (
        <div className="rounded-3xl border border-[#4a1942]/10 bg-white p-4 sm:p-6 space-y-4">
          {tab === 'overview' && (
            <>
              <h2 className="font-semibold text-[#4a1942]">All tools (marketing map)</h2>
              <p className="text-xs text-gray-500">
                Free tools work now; Pro unlocks wholesale, blends, kits, vault, seasonal skins, and more.
              </p>
              <ul className="divide-y divide-gray-100">
                {MAKER_STUDIO_TOOLS.map((t) => (
                  <li key={t.id} className="py-2.5 flex flex-wrap gap-2 justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#4a1942]">
                        {t.name}
                        {t.proOnly && (
                          <span className="ml-2 text-[10px] uppercase text-[#c9a227] font-bold">Pro</span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500">{t.blurb}</p>
                    </div>
                    <div className="text-[10px] text-right text-gray-500">
                      <div>Free: {t.free}</div>
                      <div className="text-[#4a1942] font-medium">Pro: {t.pro}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === 'harvest' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Batch / harvest calendar</h2>
              <p className="text-xs text-gray-500 mb-3">Public “coming soon” dates for restocks.</p>
              <HarvestEditor
                items={studio.harvest || []}
                isPro={isPro}
                onChange={(harvest) => persist({ ...studio, harvest })}
              />
            </section>
          )}

          {tab === 'wholesale' && (
            <ProLock isPro={isPro}>
              <h2 className="font-semibold text-[#4a1942]">Wholesale / min-order</h2>
              <label className="flex items-center gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={!!studio.wholesale?.enabled}
                  onChange={(e) =>
                    persist({ ...studio, wholesale: { ...studio.wholesale, enabled: e.target.checked } })
                  }
                />
                Enable wholesale mode on storefront notes
              </label>
              <div className="grid sm:grid-cols-3 gap-2 mt-2">
                <label className="text-xs">
                  Min qty
                  <input
                    type="number"
                    className="w-full border rounded-xl px-2 py-1.5 mt-1"
                    value={studio.wholesale?.min_qty ?? 6}
                    onChange={(e) =>
                      persist({
                        ...studio,
                        wholesale: { ...studio.wholesale, min_qty: Number(e.target.value) || 0 },
                      })
                    }
                  />
                </label>
                <label className="text-xs">
                  Wholesale off %
                  <input
                    type="number"
                    className="w-full border rounded-xl px-2 py-1.5 mt-1"
                    value={studio.wholesale?.discount_pct ?? 15}
                    onChange={(e) =>
                      persist({
                        ...studio,
                        wholesale: { ...studio.wholesale, discount_pct: Number(e.target.value) || 0 },
                      })
                    }
                  />
                </label>
                <label className="text-xs sm:col-span-3">
                  B2B note
                  <textarea
                    className="w-full border rounded-xl px-2 py-1.5 mt-1 text-sm"
                    value={studio.wholesale?.wholesale_note || ''}
                    onChange={(e) =>
                      setStudio({ ...studio, wholesale: { ...studio.wholesale, wholesale_note: e.target.value } })
                    }
                    onBlur={() => persist(studio)}
                    placeholder="Message shops for wholesale SKU list. Tax ID required."
                  />
                </label>
              </div>
            </ProLock>
          )}

          {tab === 'blends' && (
            <ProLock isPro={isPro}>
              <h2 className="font-semibold text-[#4a1942]">Custom blend requests</h2>
              <p className="text-xs text-gray-500 mb-2">
                Share link: <code className="text-[10px]">/vendor/{vendorId}?blend=1</code>
              </p>
              <BlendInbox blends={blends} vendorId={vendorId} onRefresh={load} />
            </ProLock>
          )}

          {tab === 'labels' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Label / ingredient card</h2>
              <LabelCardBuilder
                vendorName={vendorName}
                isPro={isPro}
                onSaveText={(txt) => {
                  const labels = [...(studio.labels || []), { id: Date.now(), text: txt, at: new Date().toISOString() }];
                  persist({ ...studio, labels: labels.slice(-20) });
                }}
              />
            </section>
          )}

          {tab === 'trust' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Allergen & pet-safety badge guide</h2>
              <p className="text-xs text-gray-500 mb-2">
                Use these on listings (product editor allergen fields). Pro adds pet-caution badge pack language.
              </p>
              <ul className="text-sm space-y-2">
                {[
                  'Contains tree nuts / nut carrier oils',
                  'Essential oils — dilute; keep away from cats',
                  'Not for internal use',
                  'Fragrance-sensitive: strong botanical scent',
                  'Beeswax / honey — not vegan',
                ].map((b) => (
                  <li key={b} className="rounded-xl border px-3 py-2 text-xs bg-[#faf7f9]">
                    {b}
                  </li>
                ))}
              </ul>
              {isPro && (
                <p className="text-xs text-emerald-800 mt-3 font-medium">
                  Pro: add “Pet caution” and “Patch-test” to checkout blessings / care cards in Storefront sections.
                </p>
              )}
            </section>
          )}

          {tab === 'pickup' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Pickup capacity slots</h2>
              <PickupSlotsEditor
                slots={studio.pickup_slots || []}
                isPro={isPro}
                onChange={(pickup_slots) => persist({ ...studio, pickup_slots })}
              />
              <Link to="/storefront-settings" className="text-xs underline text-[#4a1942] mt-2 inline-block">
                Also set base pickup hours →
              </Link>
            </section>
          )}

          {tab === 'consign' && (
            <ProLock isPro={isPro}>
              <h2 className="font-semibold text-[#4a1942]">Consignment tracker</h2>
              <ConsignmentEditor
                rows={studio.consignment || []}
                onChange={(consignment) => persist({ ...studio, consignment })}
              />
            </ProLock>
          )}

          {tab === 'ritual' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Ritual / concern tags</h2>
              <TagEditor
                tags={studio.ritual_tags || []}
                maxFree={3}
                isPro={isPro}
                onChange={(ritual_tags) => persist({ ...studio, ritual_tags })}
              />
            </section>
          )}

          {tab === 'gift' && (
            <ProLock isPro={isPro}>
              <h2 className="font-semibold text-[#4a1942]">Gift wrap, kits & monthly box</h2>
              <label className="flex items-center gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={!!studio.gift_wrap?.enabled}
                  onChange={(e) =>
                    persist({ ...studio, gift_wrap: { ...studio.gift_wrap, enabled: e.target.checked } })
                  }
                />
                Offer gift wrap / note at checkout (pair with checkout blessings)
              </label>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                <label className="text-xs">
                  Wrap price $
                  <input
                    type="number"
                    className="w-full border rounded-xl px-2 py-1.5 mt-1"
                    value={studio.gift_wrap?.wrap_price ?? 4}
                    onChange={(e) =>
                      persist({
                        ...studio,
                        gift_wrap: { ...studio.gift_wrap, wrap_price: Number(e.target.value) || 0 },
                      })
                    }
                  />
                </label>
                <label className="text-xs">
                  Note price $
                  <input
                    type="number"
                    className="w-full border rounded-xl px-2 py-1.5 mt-1"
                    value={studio.gift_wrap?.note_price ?? 0}
                    onChange={(e) =>
                      persist({
                        ...studio,
                        gift_wrap: { ...studio.gift_wrap, note_price: Number(e.target.value) || 0 },
                      })
                    }
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm mt-4">
                <input
                  type="checkbox"
                  checked={!!studio.sub_box?.enabled}
                  onChange={(e) =>
                    persist({ ...studio, sub_box: { ...studio.sub_box, enabled: e.target.checked } })
                  }
                />
                Promote monthly apothecary box
              </label>
              <input
                className="w-full border rounded-xl px-2 py-1.5 mt-1 text-sm"
                placeholder="Box name"
                value={studio.sub_box?.name || ''}
                onChange={(e) => setStudio({ ...studio, sub_box: { ...studio.sub_box, name: e.target.value } })}
                onBlur={() => persist(studio)}
              />
              <KitsEditor kits={studio.kits || []} listings={listings} onChange={(kits) => persist({ ...studio, kits })} />
            </ProLock>
          )}

          {tab === 'claims' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Claim language helper</h2>
              <textarea
                className="w-full border rounded-xl p-3 text-sm min-h-[100px] mt-2"
                placeholder="Paste risky marketing copy…"
                value={claimIn}
                onChange={(e) => setClaimIn(e.target.value)}
              />
              <button
                type="button"
                className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
                onClick={() => {
                  const r = rewriteClaimLanguage(claimIn);
                  setClaimOut(r);
                  if (isPro && r.out) {
                    const claim_library = [
                      { id: Date.now(), original: claimIn, rewritten: r.out, changes: r.changes },
                      ...(studio.claim_library || []),
                    ].slice(0, 30);
                    persist({ ...studio, claim_library });
                  }
                }}
              >
                Rewrite for structure/function
              </button>
              {claimOut && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Suggested copy</p>
                  <p className="mt-1 text-gray-800 leading-relaxed">{claimOut.out}</p>
                  <p className="text-[10px] text-gray-500 mt-2">Changes: {claimOut.changes.join(', ') || 'none'}</p>
                </div>
              )}
            </section>
          )}

          {tab === 'states' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">State cottage / herbal notes</h2>
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                Educational only — not legal advice. Confirm with your attorney / local authority.
              </p>
              <ul className="space-y-2">
                {(isPro ? US_STATE_HERBAL_NOTES : US_STATE_HERBAL_NOTES.slice(0, 5)).map((s) => (
                  <li key={s.state} className="text-xs border rounded-xl px-3 py-2">
                    <strong>{s.state}</strong> — {s.note}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tab === 'photo' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Photo quality score</h2>
              <div className="grid sm:grid-cols-2 gap-2 mt-2 text-sm">
                {Object.entries({
                  hasPhoto: 'Has product photo',
                  bright: 'Bright / natural light',
                  labelVisible: 'Label readable',
                  plainBackground: 'Plain background',
                  multipleAngles: 'Multiple angles',
                }).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={!!photoFlags[k]}
                      onChange={(e) => setPhotoFlags((f) => ({ ...f, [k]: e.target.checked }))}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-2xl font-bold text-[#4a1942]">
                {photoScore.score}
                <span className="text-sm font-medium text-gray-500">/100 · {photoScore.tier}</span>
              </p>
              <ul className="text-xs text-gray-600 mt-2 list-disc pl-4">
                {photoScore.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          {tab === 'story' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Verified maker story</h2>
              {['origin', 'sourcing', 'lineage'].map((field) => (
                <label key={field} className="block text-xs mt-2 capitalize">
                  {field}
                  <textarea
                    className="w-full border rounded-xl p-2 mt-1 text-sm min-h-[64px]"
                    value={studio.maker_story?.[field] || ''}
                    onChange={(e) =>
                      setStudio({
                        ...studio,
                        maker_story: { ...studio.maker_story, [field]: e.target.value },
                      })
                    }
                    onBlur={() => persist(studio)}
                  />
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={studio.maker_story?.woman_owned !== false}
                  onChange={(e) =>
                    persist({
                      ...studio,
                      maker_story: { ...studio.maker_story, woman_owned: e.target.checked },
                    })
                  }
                />
                Highlight woman-owned story
              </label>
            </section>
          )}

          {tab === 'voice' && (
            <ProLock isPro={isPro}>
              <h2 className="font-semibold text-[#4a1942]">Voice → listing draft</h2>
              <p className="text-xs text-gray-500">Paste a phone transcript or dictation of your product talk.</p>
              <textarea
                className="w-full border rounded-xl p-3 text-sm min-h-[100px] mt-2"
                value={voiceIn}
                onChange={(e) => setVoiceIn(e.target.value)}
                placeholder="I made a lavender sleep balm with beeswax and jojoba…"
              />
              <button
                type="button"
                className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
                onClick={() => setVoiceOut(voiceTranscriptToListing(voiceIn))}
              >
                Generate draft
              </button>
              {voiceOut && (
                <div className="mt-3 rounded-xl border p-3 text-sm space-y-1">
                  <p>
                    <strong>Name:</strong> {voiceOut.name}
                  </p>
                  <p>
                    <strong>Tags:</strong> {(voiceOut.ritual_tags || []).join(', ') || '—'}
                  </p>
                  <p className="text-gray-700 leading-relaxed">{voiceOut.description}</p>
                  <p className="text-xs text-gray-500">{voiceOut.care}</p>
                  <Link to="/vendor-dashboard#listing-quick-add" className="text-xs font-semibold underline text-[#4a1942]">
                    Open listing form to paste →
                  </Link>
                </div>
              )}
            </ProLock>
          )}

          {tab === 'suppliers' && (
            <ProLock isPro={isPro}>
              <h2 className="font-semibold text-[#4a1942]">Supplier reorder alerts</h2>
              <SupplierEditor
                rows={studio.supplier_alerts || []}
                onChange={(supplier_alerts) => persist({ ...studio, supplier_alerts })}
              />
            </ProLock>
          )}

          {tab === 'packing' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Market packing list</h2>
              <PackingList listings={listings} isPro={isPro} studio={studio} onPersist={persist} />
            </section>
          )}

          {tab === 'replies' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Quiet hours / sabbatical auto-replies</h2>
              <label className="block text-xs mt-2">
                Quiet / market day reply
                <textarea
                  className="w-full border rounded-xl p-2 mt-1 text-sm"
                  value={studio.auto_replies?.quiet || ''}
                  onChange={(e) =>
                    setStudio({ ...studio, auto_replies: { ...studio.auto_replies, quiet: e.target.value } })
                  }
                  onBlur={() => persist(studio)}
                />
              </label>
              <label className="block text-xs mt-2">
                Sabbatical reply {isPro ? '' : '(Pro to customize both)'}
                <textarea
                  className="w-full border rounded-xl p-2 mt-1 text-sm"
                  disabled={!isPro}
                  value={studio.auto_replies?.sabbatical || ''}
                  onChange={(e) =>
                    setStudio({ ...studio, auto_replies: { ...studio.auto_replies, sabbatical: e.target.value } })
                  }
                  onBlur={() => isPro && persist(studio)}
                />
              </label>
            </section>
          )}

          {tab === 'sections' && (
            <ProLock isPro={isPro}>
              <h2 className="font-semibold text-[#4a1942]">Custom storefront sections</h2>
              <SectionsEditor
                sections={studio.storefront_sections || []}
                onChange={(storefront_sections) => persist({ ...studio, storefront_sections })}
              />
            </ProLock>
          )}

          {tab === 'seasonal' && (
            <ProLock isPro={isPro}>
              <h2 className="font-semibold text-[#4a1942]">Seasonal theme skins</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {['', 'samhain', 'yule', 'imbolc', 'ostara', 'beltane', 'litha', 'lughnasadh', 'mabon'].map((s) => (
                  <button
                    key={s || 'none'}
                    type="button"
                    onClick={() => persist({ ...studio, seasonal_skin: s })}
                    className={`text-xs px-3 py-1.5 rounded-full border ${
                      (studio.seasonal_skin || '') === s
                        ? 'bg-[#4a1942] text-white border-[#4a1942]'
                        : 'border-gray-200'
                    }`}
                  >
                    {s || 'Default'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Applied as a storefront mood class for Pro shops (banner + accent hints).
              </p>
            </ProLock>
          )}

          {tab === 'vault' && (
            <ProLock isPro={isPro}>
              <h2 className="font-semibold text-[#4a1942]">Private client vault</h2>
              <ClientVault
                rows={studio.client_vault || []}
                onChange={(client_vault) => persist({ ...studio, client_vault })}
              />
            </ProLock>
          )}

          {tab === 'hours' && (
            <section>
              <h2 className="font-semibold text-[#4a1942]">Office hours / consults</h2>
              <label className="flex items-center gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={!!studio.office_hours?.enabled}
                  onChange={(e) =>
                    persist({ ...studio, office_hours: { ...studio.office_hours, enabled: e.target.checked } })
                  }
                />
                Show office hours note on storefront
              </label>
              <textarea
                className="w-full border rounded-xl p-2 mt-2 text-sm"
                value={studio.office_hours?.note || ''}
                onChange={(e) =>
                  setStudio({ ...studio, office_hours: { ...studio.office_hours, note: e.target.value } })
                }
                onBlur={() => persist(studio)}
              />
              <Link to={`/vendor/${vendorId}`} className="text-xs underline text-[#4a1942] mt-2 inline-block">
                Open storefront booking tab →
              </Link>
            </section>
          )}

          <div className="pt-2 border-t flex justify-between text-xs text-gray-400">
            <span>{saving ? 'Saving…' : 'Auto-saves on change'}</span>
            <span>{isPro ? 'Pro Practitioner' : 'Free — some tools locked'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function HarvestEditor({ items, isPro, onChange }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const max = isPro ? 100 : 3;
  const add = () => {
    if (!name || !date) return;
    if (items.length >= max) {
      alert(isPro ? 'Limit reached' : 'Free plan: 3 harvest dates. Upgrade for unlimited.');
      return;
    }
    onChange([{ id: Date.now(), name, date, note: '' }, ...items]);
    setName('');
    setDate('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input className="border rounded-xl px-2 py-1.5 text-sm" placeholder="Batch name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="date" className="border rounded-xl px-2 py-1.5 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
        <button type="button" onClick={add} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white">
          Add
        </button>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {items.map((h) => (
          <li key={h.id} className="flex justify-between border rounded-xl px-3 py-1.5">
            <span>
              {h.name} · {h.date}
            </span>
            <button type="button" className="text-xs text-rose-600" onClick={() => onChange(items.filter((x) => x.id !== h.id))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlendInbox({ blends, vendorId, onRefresh }) {
  const update = async (id, status) => {
    await supabase.from('vendor_blend_requests').update({ status }).eq('id', id);
    onRefresh();
  };
  return (
    <ul className="space-y-2 mt-2">
      {blends.length === 0 && <li className="text-xs text-gray-400">No blend requests yet.</li>}
      {blends.map((b) => (
        <li key={b.id} className="border rounded-xl p-3 text-xs">
          <p className="font-semibold">
            {b.seeker_name || 'Seeker'} · {b.seeker_email}
          </p>
          <p className="text-gray-600 mt-1">{b.intent_note}</p>
          <p className="text-gray-400 mt-1">Status: {b.status}</p>
          <div className="flex gap-2 mt-2">
            <button type="button" className="px-2 py-1 border rounded-lg" onClick={() => update(b.id, 'in_progress')}>
              In progress
            </button>
            <button type="button" className="px-2 py-1 border rounded-lg" onClick={() => update(b.id, 'done')}>
              Done
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function LabelCardBuilder({ vendorName, isPro, onSaveText }) {
  const [product, setProduct] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [use, setUse] = useState('For external aromatic use only.');
  const text = useMemo(() => {
    const { out } = rewriteClaimLanguage(use);
    return [
      vendorName || 'Maker',
      product || 'Product name',
      '',
      'Ingredients:',
      ingredients || '—',
      '',
      'Suggested use:',
      out,
      '',
      'Not evaluated as a drug. Keep out of reach of children.',
    ].join('\n');
  }, [vendorName, product, ingredients, use]);

  return (
    <div className="space-y-2 mt-2">
      <input className="w-full border rounded-xl px-2 py-1.5 text-sm" placeholder="Product name" value={product} onChange={(e) => setProduct(e.target.value)} />
      <textarea className="w-full border rounded-xl px-2 py-1.5 text-sm" placeholder="Ingredients list" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
      <textarea className="w-full border rounded-xl px-2 py-1.5 text-sm" placeholder="Use statement" value={use} onChange={(e) => setUse(e.target.value)} />
      <pre className="text-[11px] bg-[#faf7f9] border rounded-xl p-3 whitespace-pre-wrap">{text}</pre>
      <button
        type="button"
        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
        onClick={() => {
          if (isPro) downloadText(text, `${(product || 'label').replace(/\s+/g, '-')}-card.txt`);
          onSaveText(text);
          if (!isPro) alert('Preview saved in studio. Upgrade to Pro to download print files.');
        }}
      >
        {isPro ? 'Download label card' : 'Save preview'}
      </button>
    </div>
  );
}

function PickupSlotsEditor({ slots, isPro, onChange }) {
  const [label, setLabel] = useState('Sat 10–12');
  const [cap, setCap] = useState(8);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input className="border rounded-xl px-2 py-1.5 text-sm" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input type="number" className="border rounded-xl px-2 py-1.5 text-sm w-20" value={cap} onChange={(e) => setCap(Number(e.target.value) || 0)} />
        <button
          type="button"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
          onClick={() => {
            if (!isPro && slots.length >= 2) {
              alert('Free: 2 slots. Pro: unlimited capacity windows.');
              return;
            }
            onChange([{ id: Date.now(), label, capacity: cap }, ...slots]);
          }}
        >
          Add slot
        </button>
      </div>
      <ul className="mt-2 text-sm space-y-1">
        {slots.map((s) => (
          <li key={s.id} className="flex justify-between border rounded-xl px-3 py-1.5">
            <span>
              {s.label} · cap {s.capacity}
            </span>
            <button type="button" className="text-xs text-rose-600" onClick={() => onChange(slots.filter((x) => x.id !== s.id))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConsignmentEditor({ rows, onChange }) {
  const [place, setPlace] = useState('');
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState(6);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input className="border rounded-xl px-2 py-1.5 text-sm" placeholder="Studio / market" value={place} onChange={(e) => setPlace(e.target.value)} />
        <input className="border rounded-xl px-2 py-1.5 text-sm" placeholder="SKU / product" value={sku} onChange={(e) => setSku(e.target.value)} />
        <input type="number" className="border rounded-xl px-2 py-1.5 text-sm w-20" value={qty} onChange={(e) => setQty(Number(e.target.value) || 0)} />
        <button
          type="button"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
          onClick={() => {
            if (!place || !sku) return;
            onChange([{ id: Date.now(), place, sku, qty, sold: 0 }, ...rows]);
            setPlace('');
            setSku('');
          }}
        >
          Add
        </button>
      </div>
      <ul className="mt-2 text-xs space-y-1">
        {rows.map((r) => (
          <li key={r.id} className="border rounded-xl px-3 py-2 flex justify-between gap-2">
            <span>
              {r.place}: {r.sku} · left {r.qty - (r.sold || 0)} / {r.qty}
            </span>
            <button
              type="button"
              className="underline"
              onClick={() =>
                onChange(rows.map((x) => (x.id === r.id ? { ...x, sold: Math.min(x.qty, (x.sold || 0) + 1) } : x)))
              }
            >
              +1 sold
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TagEditor({ tags, maxFree, isPro, onChange }) {
  const [t, setT] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="text-xs px-2 py-1 rounded-full bg-[#faf7f9] border"
            onClick={() => onChange(tags.filter((x) => x !== tag))}
          >
            {tag} ×
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="border rounded-xl px-2 py-1.5 text-sm" value={t} onChange={(e) => setT(e.target.value)} placeholder="e.g. moon" />
        <button
          type="button"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
          onClick={() => {
            const v = t.trim().toLowerCase();
            if (!v) return;
            if (!isPro && tags.length >= maxFree) {
              alert(`Free: ${maxFree} tags. Pro: unlimited.`);
              return;
            }
            if (!tags.includes(v)) onChange([...tags, v]);
            setT('');
          }}
        >
          Add tag
        </button>
      </div>
    </div>
  );
}

function KitsEditor({ kits, listings, onChange }) {
  const [title, setTitle] = useState('');
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-[#4a1942]">Cross-shop kits</p>
      <div className="flex gap-2 mt-1">
        <input className="border rounded-xl px-2 py-1.5 text-sm flex-1" placeholder="Kit title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button
          type="button"
          className="text-xs font-semibold px-3 py-1.5 rounded-full border"
          onClick={() => {
            if (!title) return;
            onChange([{ id: Date.now(), title, items: listings.slice(0, 3).map((l) => l.name) }, ...kits]);
            setTitle('');
          }}
        >
          Build from top SKUs
        </button>
      </div>
      <ul className="mt-2 text-xs space-y-1">
        {kits.map((k) => (
          <li key={k.id} className="border rounded-xl px-3 py-2">
            <strong>{k.title}</strong>: {(k.items || []).join(' · ')}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SupplierEditor({ rows, onChange }) {
  const [item, setItem] = useState('');
  const [when, setWhen] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input className="border rounded-xl px-2 py-1.5 text-sm" placeholder="Supply (jars, oil…)" value={item} onChange={(e) => setItem(e.target.value)} />
        <input type="date" className="border rounded-xl px-2 py-1.5 text-sm" value={when} onChange={(e) => setWhen(e.target.value)} />
        <button
          type="button"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
          onClick={() => {
            if (!item) return;
            onChange([{ id: Date.now(), item, reorder_by: when }, ...rows]);
            setItem('');
          }}
        >
          Add alert
        </button>
      </div>
      <ul className="mt-2 text-xs space-y-1">
        {rows.map((r) => (
          <li key={r.id} className="border rounded-xl px-3 py-1.5">
            Reorder <strong>{r.item}</strong> by {r.reorder_by || 'TBD'}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PackingList({ listings, isPro, studio, onPersist }) {
  const products = listings.filter((l) => l.kind === 'product');
  const lines = products.map((p) => `${p.quantity_available ?? 0} × ${p.name}`).join('\n');
  return (
    <div>
      <pre className="text-xs bg-[#faf7f9] border rounded-xl p-3 whitespace-pre-wrap min-h-[80px]">
        {lines || 'Add products to build a packing list.'}
      </pre>
      <button
        type="button"
        className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
        onClick={() => {
          const text = `Market packing list\n${new Date().toLocaleDateString()}\n\n${lines}\n\nBooth kit: tablecloth, card reader, bags, business cards, cash box`;
          downloadText(text, 'market-packing-list.txt');
          if (isPro) onPersist({ ...studio, packing: [{ at: new Date().toISOString(), lines }] });
        }}
      >
        Print / download list
      </button>
    </div>
  );
}

function SectionsEditor({ sections, onChange }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  return (
    <div>
      <input className="w-full border rounded-xl px-2 py-1.5 text-sm" placeholder="Section title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="w-full border rounded-xl px-2 py-1.5 text-sm mt-2" placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} />
      <button
        type="button"
        className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
        onClick={() => {
          if (!title) return;
          onChange([{ id: Date.now(), title, body }, ...sections]);
          setTitle('');
          setBody('');
        }}
      >
        Add section
      </button>
      <ul className="mt-2 space-y-2 text-xs">
        {sections.map((s) => (
          <li key={s.id} className="border rounded-xl p-2">
            <strong>{s.title}</strong>
            <p className="text-gray-600">{s.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClientVault({ rows, onChange }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input className="border rounded-xl px-2 py-1.5 text-sm" placeholder="Client name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border rounded-xl px-2 py-1.5 text-sm flex-1" placeholder="Blend / note" value={note} onChange={(e) => setNote(e.target.value)} />
        <button
          type="button"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
          onClick={() => {
            if (!name) return;
            onChange([{ id: Date.now(), name, note, at: new Date().toISOString() }, ...rows]);
            setName('');
            setNote('');
          }}
        >
          Save
        </button>
      </div>
      <ul className="mt-2 text-xs space-y-1">
        {rows.map((r) => (
          <li key={r.id} className="border rounded-xl px-3 py-2">
            <strong>{r.name}</strong> — {r.note}
          </li>
        ))}
      </ul>
    </div>
  );
}
