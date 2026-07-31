/**
 * Vendor payout / buyer payment method helpers.
 * PayPal is email-based linkage until Partner OAuth credentials exist.
 */

export function isValidPaypalEmail(value) {
  const v = String(value || '').trim();
  if (!v) return false;
  if (/^paypal_placeholder_/i.test(v)) return false;
  // Email or merchant id (starts with letters/numbers, not spaces)
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true;
  if (/^[A-Za-z0-9._-]{6,}$/.test(v) && !v.includes(' ')) return true;
  return false;
}

export function isValidStripeAccountId(value) {
  return /^acct_[a-zA-Z0-9]+$/.test(String(value || '').trim());
}

/** Build a PayPal.me or send-money style link for the buyer. */
export function buildPaypalPayLink({ paypalId, amount, note = 'Hazel Allure order' }) {
  const id = String(paypalId || '').trim();
  if (!id) return null;
  const amt = Number(amount);
  const amountPart = Number.isFinite(amt) && amt > 0 ? `/${amt.toFixed(2)}` : '';

  // paypal.me/handle
  if (/^https?:\/\/(www\.)?paypal\.me\//i.test(id)) {
    const base = id.replace(/\/$/, '');
    return amountPart ? `${base}${amountPart}` : base;
  }
  if (/^paypal\.me\//i.test(id)) {
    const base = `https://${id.replace(/\/$/, '')}`;
    return amountPart ? `${base}${amountPart}` : base;
  }
  // plain handle without domain
  if (/^[A-Za-z0-9._-]+$/.test(id) && !id.includes('@')) {
    return `https://www.paypal.me/${id}${amountPart}`;
  }
  // email → PayPal send money (opens PayPal; buyer enters amount if not supported in query)
  if (id.includes('@')) {
    const q = new URLSearchParams({
      cmd: '_xclick',
      business: id,
      currency_code: 'USD',
      item_name: note.slice(0, 120),
    });
    if (Number.isFinite(amt) && amt > 0) q.set('amount', amt.toFixed(2));
    return `https://www.paypal.com/cgi-bin/webscr?${q.toString()}`;
  }
  return null;
}

export function describeVendorPaymentMethods(vendor) {
  const methods = [
    {
      id: 'cash',
      label: 'Cash on pickup / delivery',
      available: true,
      hint: 'Pay the maker when you receive your order.',
    },
  ];
  if (isValidStripeAccountId(vendor?.stripe_account_id)) {
    methods.unshift({
      id: 'card',
      label: 'Card (via maker Stripe)',
      available: true,
      hint: 'Recorded as card intent — maker collects via their linked Stripe.',
    });
  } else {
    methods.push({
      id: 'card',
      label: 'Card (when maker links Stripe)',
      available: false,
      hint: 'This maker has not linked Stripe yet. Choose cash or PayPal if available.',
    });
  }
  if (isValidPaypalEmail(vendor?.paypal_account_id)) {
    methods.splice(1, 0, {
      id: 'paypal',
      label: 'PayPal',
      available: true,
      hint: `Pay ${vendor.paypal_account_id} on PayPal after placing the order.`,
      paypalId: vendor.paypal_account_id,
    });
  } else {
    methods.push({
      id: 'paypal',
      label: 'PayPal (when maker links it)',
      available: false,
      hint: 'This maker has not saved a PayPal business email yet.',
    });
  }
  return methods;
}
