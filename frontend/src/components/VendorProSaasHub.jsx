import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorContext, isVendorPro } from '../lib/plans';
import { VERTICAL } from '../lib/vertical';
import { buildAbandonedCartTemplates } from '../lib/abandonedCartTemplates';
import {
  downloadTaxPack,
  fetchVendorProFields,
  makeShiftNote,
  parseShiftNotes,
  saveVendorProFields,
} from '../lib/vendorProSaasApi';
import { supabase } from '../lib/supabaseClient';

/**
 * Pro SaaS toolkit: tax pack, abandoned-cart templates, market day, review QR,
 * branded email footer, shift notes, shop story video.
 */
export default function VendorProSaasHub({ user, embedded = false }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const isPro = isVendorPro(user);
  const [vendor, setVendor] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState('');
  const [shiftBody, setShiftBody] = useState('');
  const [copied, setCopied] = useState('');

  const shopUrl = useMemo(() => {
    const base = VERTICAL.appUrl || window.location.origin;
    return vendorId ? `${base.replace(/\/$/, '')}/vendor/${vendorId}` : base;
  }, [vendorId]);

  const reviewUrl = `${shopUrl}?review=1`;

  const templates = useMemo(
    () =>
      buildAbandonedCartTemplates({
        vendorName: vendor?.name,
        shopUrl,
        productHint: 'your apothecary picks',
      }),
    [vendor?.name, shopUrl],
  );

  const notes = parseShiftNotes(vendor?.shift_notes);

  const load = async () => {
    if (!vendorId) return;
    const data = await fetchVendorProFields(vendorId);
    setVendor(data);
  };

  useEffect(() => {
    load();
  }, [vendorId]);

  const patch = async (fields, label = 'Saved') => {
    if (!vendorId) return;
    setBusy(label);
    setMsg('');
    try {
      await saveVendorProFields(vendorId, fields);
      setVendor((v) => ({ ...v, ...fields }));
      setMsg(label);
    } catch (e) {
      setMsg(e.message || 'Save failed — run latest SQL migration for new columns.');
    }
    setBusy('');
  };

  const copyText = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(''), 2000);
    } catch {
      setCopied('');
    }
  };

  const addShiftNote = async () => {
    if (!shiftBody.trim()) return;
    const next = [
      makeShiftNote({
        author: user?.name || user?.email || 'Staff',
        body: shiftBody,
        role: ctx?.isEmployee ? 'employee' : 'owner',
      }),
      ...notes,
    ].slice(0, 40);
    await patch({ shift_notes: next }, 'Shift note posted');
    setShiftBody('');
  };

  const runTaxPack = async () => {
    setBusy('tax');
    setMsg('');
    try {
      const r = await downloadTaxPack(vendorId, { year: new Date().getFullYear() });
      setMsg(`Tax pack downloaded (${r.orderCount} orders). Check your downloads folder.`);
    } catch (e) {
      setMsg(e.message || 'Tax pack failed');
    }
    setBusy('');
  };

  if (!vendorId) {
    return <p className="text-sm text-gray-500">Vendor profile required.</p>;
  }

  const proGate = !isPro && (
    <div className="mb-4 rounded-2xl border border-[#c9a227]/40 bg-[#faf7f0] p-4 text-sm">
      <p className="font-semibold text-[#4a1942]">Pro Practitioner tools</p>
      <p className="text-xs text-gray-600 mt-1">
        Free sellers can preview. Full tax pack, market-day mode, branded footer, and staff notes unlock with Pro.
      </p>
      <Link to="/pro-upgrade?type=vendor&from=saas-hub" className="inline-block mt-2 text-xs font-semibold underline text-[#4a1942]">
        Compare Free vs Pro →
      </Link>
    </div>
  );

  return (
    <div className={embedded ? '' : 'max-w-4xl mx-auto'}>
      {!embedded && (
        <header className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Pro SaaS toolkit</p>
          <h1 className="text-3xl font-bold text-[#4a1942] heading-font">Grow like a software business</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Tax packs, recovery messages, market-day mode, review QR, branded footers, shift notes, and shop story video —
            practical tools unique makers actually use.
          </p>
        </header>
      )}

      {proGate}
      {msg && (
        <p className="mb-4 text-sm rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 px-3 py-2">{msg}</p>
      )}

      <div className="grid gap-4">
        {/* 1 Tax pack */}
        <section className="rounded-2xl border border-[#4a1942]/12 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-[#4a1942]">1. Tax pack (CSV for your CPA)</h2>
          <p className="text-xs text-gray-500 mt-1">
            Downloads order ledger, Q1–Q4 estimates, annual payment summary, and a README. Not tax advice.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!busy || !isPro}
              onClick={runTaxPack}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white disabled:opacity-50"
            >
              {busy === 'tax' ? 'Preparing…' : 'Download tax pack'}
            </button>
            <Link to="/vendor-taxes" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4a1942]/20">
              Open Tax Center →
            </Link>
          </div>
        </section>

        {/* 2 Abandoned cart templates */}
        <section className="rounded-2xl border border-[#4a1942]/12 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-[#4a1942]">2. Abandoned-cart & recovery templates</h2>
          <p className="text-xs text-gray-500 mt-1">Copy SMS/email scripts — paste into campaigns or your phone. Respect opt-out laws.</p>
          <ul className="mt-3 space-y-3">
            {templates.map((t) => (
              <li key={t.id} className="rounded-xl border border-gray-100 bg-[#faf7f9]/50 p-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#4a1942]">{t.title}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t.channel}</p>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                    onClick={() =>
                      copyText(
                        t.id,
                        [t.subject && `Subject: ${t.subject}`, t.body].filter(Boolean).join('\n\n'),
                      )
                    }
                  >
                    {copied === t.id ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                {t.subject && <p className="text-xs font-medium mt-2 text-gray-700">Subject: {t.subject}</p>}
                <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">{t.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 3 Market day */}
        <section className="rounded-2xl border border-[#4a1942]/12 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-[#4a1942]">3. Market-day mode (pickup only)</h2>
          <p className="text-xs text-gray-500 mt-1">
            Pause shipping messaging and highlight local pickup — perfect for booth days and pop-ups.
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={!isPro}
              checked={!!vendor?.market_day_mode}
              onChange={(e) =>
                patch(
                  {
                    market_day_mode: e.target.checked,
                    fulfillment_default: e.target.checked ? 'pickup_only' : null,
                    ships_domestically: e.target.checked ? false : true,
                  },
                  e.target.checked ? 'Market-day mode ON' : 'Market-day mode OFF',
                )
              }
            />
            Market day active — storefront shows pickup-only
          </label>
          <textarea
            className="mt-2 w-full border rounded-xl p-2 text-sm min-h-[64px]"
            disabled={!isPro}
            placeholder="Optional note: e.g. Saturday 9–1 at Downtown Market, booth 12"
            value={vendor?.market_day_note || ''}
            onChange={(e) => setVendor((v) => ({ ...v, market_day_note: e.target.value }))}
            onBlur={() =>
              isPro &&
              patch({ market_day_note: vendor?.market_day_note || null }, 'Market-day note saved')
            }
          />
        </section>

        {/* 4 Review QR */}
        <section className="rounded-2xl border border-[#4a1942]/12 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-[#4a1942]">4. Review-request QR (after pickup)</h2>
          <p className="text-xs text-gray-500 mt-1">
            Print or show this QR at handoff. Customers land on your storefront with the review prompt open.
          </p>
          <div className="mt-3 flex flex-wrap items-start gap-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(reviewUrl)}`}
              alt="Review request QR"
              className="border rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-mono break-all text-gray-500">{reviewUrl}</p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full border"
                onClick={() => copyText('review', reviewUrl)}
              >
                {copied === 'review' ? 'Link copied ✓' : 'Copy review link'}
              </button>
              <p className="text-[11px] text-gray-500 mt-2">
                After you confirm pickup in Orders, a review QR also appears for that handoff.
              </p>
            </div>
          </div>
        </section>

        {/* 5 Branded email footer */}
        <section className="rounded-2xl border border-[#4a1942]/12 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-[#4a1942]">5. Branded email footer</h2>
          <p className="text-xs text-gray-500 mt-1">
            Appended to campaign drafts and recovery emails so every message sounds like your shop.
          </p>
          <textarea
            className="mt-2 w-full border rounded-xl p-3 text-sm min-h-[88px]"
            disabled={!isPro}
            placeholder={`With care,\n${vendor?.name || 'Your shop'}\n${shopUrl}\nWoman-owned · natural goods`}
            value={vendor?.branded_email_footer || ''}
            onChange={(e) => setVendor((v) => ({ ...v, branded_email_footer: e.target.value }))}
            onBlur={() =>
              isPro &&
              patch({ branded_email_footer: vendor?.branded_email_footer || null }, 'Email footer saved')
            }
          />
          <Link to="/vendor-campaigns" className="inline-block mt-2 text-xs font-semibold underline text-[#4a1942]">
            Open campaigns →
          </Link>
        </section>

        {/* 6 Shift notes */}
        <section className="rounded-2xl border border-[#4a1942]/12 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-[#4a1942]">6. Multi-staff shift notes</h2>
          <p className="text-xs text-gray-500 mt-1">
            Handoff log for employees — “restock lavender”, “buyer waiting on custom blend”, etc.
          </p>
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 border rounded-xl px-3 py-2 text-sm"
              disabled={!isPro}
              placeholder="Shift note…"
              value={shiftBody}
              onChange={(e) => setShiftBody(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isPro && addShiftNote()}
            />
            <button
              type="button"
              disabled={!isPro || !shiftBody.trim() || !!busy}
              onClick={addShiftNote}
              className="text-xs font-semibold px-3 py-2 rounded-full bg-[#4a1942] text-white disabled:opacity-50"
            >
              Post note
            </button>
          </div>
          <ul className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {notes.length === 0 && <li className="text-xs text-gray-400">No shift notes yet.</li>}
            {notes.map((n) => (
              <li key={n.id} className="text-xs rounded-xl border border-gray-100 px-3 py-2 bg-[#faf7f9]/60">
                <span className="font-semibold text-[#4a1942]">{n.author}</span>
                <span className="text-gray-400"> · {n.role} · {new Date(n.created_at).toLocaleString()}</span>
                <p className="text-gray-700 mt-0.5">{n.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 7 Shop story video */}
        <section className="rounded-2xl border border-[#4a1942]/12 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-[#4a1942]">7. Shop story video pin</h2>
          <p className="text-xs text-gray-500 mt-1">
            YouTube or Vimeo URL featured on your public storefront — your maker story, not a hard sell.
          </p>
          <input
            className="mt-2 w-full border rounded-xl px-3 py-2 text-sm"
            disabled={!isPro}
            placeholder="https://www.youtube.com/watch?v=… or Vimeo link"
            value={vendor?.story_video_url || ''}
            onChange={(e) => setVendor((v) => ({ ...v, story_video_url: e.target.value }))}
            onBlur={() =>
              isPro &&
              patch({ story_video_url: vendor?.story_video_url || null }, 'Story video saved')
            }
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Link to="/storefront-settings" className="text-xs font-semibold underline text-[#4a1942]">
              Storefront editor →
            </Link>
            <Link to={`/vendor/${vendorId}`} className="text-xs font-semibold underline text-[#4a1942]">
              Preview public page →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
