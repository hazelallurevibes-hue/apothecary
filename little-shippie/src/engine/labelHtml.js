/**
 * Printable thermal-style label HTML (from + to populated).
 * Vendor opens print dialog; replace with carrier PDF when EasyPost returns label_url.
 */

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildLabelHtml({
  from = {},
  to = {},
  carrier = 'USPS',
  service = 'Priority',
  trackingNumber = '',
  orderId = '',
  weightOz = 16,
  dimensions = '',
  barcodeHint = '',
} = {}) {
  const fromBlock = [from.name, from.street, [from.city, from.region, from.postal].filter(Boolean).join(', '), from.country]
    .filter(Boolean)
    .join('\n');
  const toBlock = [to.name, to.street, [to.city, to.region, to.postal].filter(Boolean).join(', '), to.country]
    .filter(Boolean)
    .join('\n');
  const track = trackingNumber || barcodeHint || `HA${orderId || '0'}`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Label ${esc(track)}</title>
<style>
  @page { size: 4in 6in; margin: 0.2in; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 12px; color: #111; }
  .box { border: 2px solid #000; padding: 10px; margin-bottom: 10px; }
  .muted { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #444; }
  .addr { white-space: pre-wrap; font-size: 14px; line-height: 1.35; margin-top: 4px; }
  .to .addr { font-size: 18px; font-weight: 700; }
  .row { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; }
  .track { font-size: 20px; font-weight: 800; letter-spacing: 0.04em; text-align: center; margin: 12px 0; }
  .barcode { height: 48px; background: repeating-linear-gradient(90deg,#000 0,#000 2px,#fff 2px,#fff 4px); margin: 8px 0; }
  .foot { font-size: 10px; color: #333; text-align: center; }
  @media print { .noprint { display: none; } body { padding: 0; } }
</style></head><body>
  <div class="noprint" style="margin-bottom:12px">
    <button onclick="window.print()">Print label</button>
  </div>
  <div class="box">
    <div class="row">
      <div><span class="muted">Carrier</span><div>${esc(carrier)} · ${esc(service)}</div></div>
      <div><span class="muted">Order</span><div>#${esc(orderId)}</div></div>
    </div>
    <div class="row" style="margin-top:8px">
      <div><span class="muted">Weight</span><div>${esc(weightOz)} oz</div></div>
      <div><span class="muted">Dims</span><div>${esc(dimensions || '—')}</div></div>
    </div>
  </div>
  <div class="box">
    <div class="muted">From (shipper)</div>
    <div class="addr">${esc(fromBlock)}</div>
  </div>
  <div class="box to">
    <div class="muted">Ship to</div>
    <div class="addr">${esc(toBlock)}</div>
  </div>
  <div class="track">${esc(track)}</div>
  <div class="barcode" role="img" aria-label="barcode"></div>
  <p class="foot">Little Shippie · marketplace shipping · ${esc(carrier)} estimate label<br/>
  Live USPS/UPS/FedEx PDFs when EasyPost is connected.</p>
</body></html>`;
}

export function openLabelPrintWindow(html) {
  if (typeof window === 'undefined') return null;
  const w = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720');
  if (!w) return null;
  w.document.write(html);
  w.document.close();
  return w;
}
