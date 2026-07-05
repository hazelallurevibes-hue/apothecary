import { familiarPortraitMarkup } from '../components/FamiliarPortrait';
import { fetchFamiliarTierForUser, getTierPresentation } from './familiarEvolution';
import { getFamiliar } from './familiars';
import { pickCheckoutFortune, pickSpellReceipt } from './whimsyMessages';

export function buildSpellReceiptData({
  total,
  items = [],
  deliveryMethod,
  userName,
  source = 'Hazel Allure',
  familiarId,
  familiarTier,
}) {
  const tier = familiarTier != null ? familiarTier : 0;
  const tierPres = getTierPresentation(tier);
  const familiar = familiarId ? getFamiliar(familiarId) : null;
  const familiarSvg = familiarId ? familiarPortraitMarkup(familiarId, tier, 'sm') : '';

  return {
    title: 'Grimoire Slip — Spell Receipt',
    source,
    date: new Date().toLocaleString(),
    seeker: userName || 'Seeker',
    total: typeof total === 'number' ? total.toFixed(2) : total,
    deliveryMethod: deliveryMethod || 'pickup',
    items: items.map((i) => ({
      name: i.name || i.title || 'Item',
      qty: i.qty || 1,
      price: i.price != null ? Number(i.price).toFixed(2) : '—',
    })),
    fortune: pickCheckoutFortune(),
    receiptLine: pickSpellReceipt(),
    familiarId: familiar?.id || familiarId || null,
    familiarName: familiar?.name || null,
    familiarTier: tier,
    familiarTierLabel: tierPres.label,
    familiarSvg,
    disclaimer: 'Entertainment only — not medical, legal, financial, or professional advice.',
  };
}

export function downloadSpellReceiptPdf(data) {
  const itemsHtml = (data.items || [])
    .map((i) => `<tr><td>${escapeHtml(i.name)}</td><td>${i.qty}</td><td>$${i.price}</td></tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(data.title)}</title>
<style>
  body { font-family: Georgia, serif; max-width: 520px; margin: 2rem auto; color: #2d1230; }
  h1 { font-size: 1.25rem; color: #4a1942; border-bottom: 2px solid #c9a227; padding-bottom: 0.5rem; }
  .meta { font-size: 0.85rem; color: #666; margin: 1rem 0; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
  th, td { border-bottom: 1px solid #e8e4d9; padding: 0.4rem; text-align: left; }
  .fortune { font-style: italic; background: #faf7f9; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
  .receipt { font-weight: 600; color: #4a1942; }
  .disclaimer { font-size: 0.7rem; color: #b91c1c; margin-top: 1.5rem; }
  .familiar-seal { display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0; padding: 0.75rem; border: 1px solid #c9a227; border-radius: 10px; background: #faf7f9; }
  .familiar-seal p { margin: 0; font-size: 0.8rem; color: #4a1942; }
  .familiar-tier { font-size: 0.7rem; color: #c9a227; text-transform: uppercase; letter-spacing: 0.05em; }
  @media print { body { margin: 1cm; } }
</style></head><body>
  <h1>📜 ${escapeHtml(data.title)}</h1>
  <p class="meta">${escapeHtml(data.source)} · ${escapeHtml(data.date)}<br>Seeker: ${escapeHtml(data.seeker)}</p>
  ${data.familiarSvg ? `<div class="familiar-seal">${data.familiarSvg}<div><p><strong>${escapeHtml(data.familiarName || 'Spirit familiar')}</strong> witnessed this order.</p><p class="familiar-tier">${escapeHtml(data.familiarTierLabel || 'Initiate')} bond · cosmetic seal only</p></div></div>` : ''}
  <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${itemsHtml}</tbody></table>
  <p><strong>Total:</strong> $${escapeHtml(String(data.total))} · <strong>Delivery:</strong> ${escapeHtml(data.deliveryMethod)}</p>
  <div class="fortune"><p>✦ ${escapeHtml(data.fortune)}</p><p class="receipt">${escapeHtml(data.receiptLine)}</p></div>
  <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
  <script>window.onload = function() { window.print(); }</script>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `grimoire-slip-${Date.now()}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function offerSpellReceiptDownload(orderMeta) {
  (async () => {
    let meta = { ...orderMeta };
    if (meta.familiarId && meta.familiarTier == null && meta.userEmail) {
      try {
        meta.familiarTier = await fetchFamiliarTierForUser(meta.userEmail);
      } catch {
        meta.familiarTier = 0;
      }
    }
    const data = buildSpellReceiptData(meta);
    const wants = window.confirm(
      `${orderMeta.successMessage || 'Order placed!'}\n\nDownload your grimoire slip (print or save as PDF)?`,
    );
    if (wants) downloadSpellReceiptPdf(data);
  })();
}