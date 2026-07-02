/** Client-side sabbatical expiry fallback when cron has not run yet */

export function applySabbaticalExpiry(vendor) {
  if (!vendor?.sabbatical_active || !vendor?.sabbatical_returns_at) return vendor;
  const returns = new Date(vendor.sabbatical_returns_at);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (returns >= today) return vendor;
  return {
    ...vendor,
    sabbatical_active: false,
    sabbatical_note: vendor.sabbatical_note
      ? `${vendor.sabbatical_note} (Return date passed.)`
      : 'Sabbatical ended.',
  };
}