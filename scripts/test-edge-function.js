/**
 * Quick test for notify-low-rating edge function.
 * Usage: node scripts/test-edge-function.js [vendor_email]
 */
const url = 'https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-low-rating';
const vendorEmail = process.argv[2] || 'vendor@bpicius.local';

const payload = {
  review_id: 1,
  vendor_id: 1,
  vendor_email: vendorEmail,
  vendor_name: 'Bpicius Test Vendor',
  rating: 2,
  comment: 'Test low-rating alert from setup script',
  grace_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
};

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then((r) => r.json())
  .then((data) => {
    console.log('Edge function response:', data);
    if (data.emailed === false && data.reason?.includes('RESEND')) {
      console.log('\nNext step: set RESEND_API_KEY in Supabase Dashboard → Edge Functions → notify-low-rating → Secrets');
    }
  })
  .catch((e) => console.error('Request failed:', e.message));