/**
 * High-level Little Shippie service (quote → buy → label → tracking).
 */
import { shopAll, purchaseLabel } from './adapters/index.js';
import { normalizeParcel, parseAddressLine } from './engine/parcel.js';
import { buildLabelHtml } from './engine/labelHtml.js';
import { buildTrackingRecord, trackingPortalUrl } from './engine/tracking.js';
import { bumpTenantStat, tenantFromVendor } from './tenants.js';

export async function quoteShipment({
  tenant,
  weightOz,
  lengthIn,
  widthIn,
  heightIn,
  from,
  to,
}) {
  const parcel = normalizeParcel({ weightOz, lengthIn, widthIn, heightIn });
  const shipFrom = from || tenant?.shipFrom || {};
  const shipTo = typeof to === 'string' ? parseAddressLine(to) : to || {};
  const result = await shopAll(
    {
      weightOz: parcel.weightOz,
      lengthIn: parcel.lengthIn,
      widthIn: parcel.widthIn,
      heightIn: parcel.heightIn,
      from: shipFrom,
      to: shipTo,
    },
    tenant,
  );
  if (tenant?.id && !String(tenant.id).startsWith('vendor_')) {
    bumpTenantStat(tenant.id, 'quotes');
  }
  return {
    ...result,
    parcel,
    from: shipFrom,
    to: shipTo,
  };
}

export async function buyAndLabel({
  tenant,
  rate,
  weightOz,
  lengthIn,
  widthIn,
  heightIn,
  from,
  to,
  orderId,
  buyerName,
  buyerEmail,
}) {
  const parcel = normalizeParcel({ weightOz, lengthIn, widthIn, heightIn });
  const shipFrom = {
    ...(tenant?.shipFrom || {}),
    ...(from || {}),
  };
  const shipTo =
    typeof to === 'string'
      ? { ...parseAddressLine(to), name: buyerName || buyerEmail || 'Buyer' }
      : { name: buyerName || buyerEmail || 'Buyer', ...(to || {}) };

  const purchased = await purchaseLabel(
    {
      weightOz: parcel.weightOz,
      lengthIn: parcel.lengthIn,
      widthIn: parcel.widthIn,
      heightIn: parcel.heightIn,
      from: shipFrom,
      to: shipTo,
      carrier: rate?.carrier,
      service: rate?.service,
      orderId,
    },
    tenant,
    rate,
  );

  const tracking = buildTrackingRecord({
    trackingNumber: purchased.tracking_number,
    carrier: purchased.carrier || rate?.carrier,
    status: 'label_created',
    labelUrl: purchased.label_url,
  });

  const html = buildLabelHtml({
    from: shipFrom,
    to: shipTo,
    carrier: (purchased.carrier || rate?.carrier || 'usps').toUpperCase(),
    service: rate?.label || purchased.service || rate?.service || '',
    trackingNumber: purchased.tracking_number,
    orderId,
    weightOz: parcel.weightOz,
    dimensions: `${parcel.lengthIn}×${parcel.widthIn}×${parcel.heightIn} in`,
  });

  if (tenant?.id && !String(tenant.id).startsWith('vendor_')) {
    bumpTenantStat(tenant.id, 'labels');
  }

  return {
    ok: true,
    purchase: purchased,
    tracking,
    tracking_url: trackingPortalUrl(tracking.carrier, tracking.tracking_number),
    label_html: html,
    label_url: purchased.label_url,
    parcel,
    from: shipFrom,
    to: shipTo,
  };
}

export { tenantFromVendor };
