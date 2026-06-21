export function getExpiryInfo(goodByDate) {
  if (!goodByDate) {
    return { status: 'unknown', label: 'No expiry set', msRemaining: null, daysRemaining: null };
  }

  const end = new Date(goodByDate + 'T23:59:59');
  const now = new Date();
  const msRemaining = end.getTime() - now.getTime();

  if (msRemaining <= 0) {
    return { status: 'expired', label: 'Expired', msRemaining: 0, daysRemaining: 0 };
  }

  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.ceil(msRemaining / (1000 * 60 * 60));

  if (daysRemaining <= 1) {
    return {
      status: 'critical',
      label: hoursRemaining <= 24 ? `${hoursRemaining}h left` : '1 day left',
      msRemaining,
      daysRemaining,
    };
  }

  if (daysRemaining <= 3) {
    return {
      status: 'warning',
      label: `${daysRemaining} days left`,
      msRemaining,
      daysRemaining,
    };
  }

  return {
    status: 'fresh',
    label: `${daysRemaining} days left`,
    msRemaining,
    daysRemaining,
  };
}

export function formatCountdown(msRemaining) {
  if (msRemaining == null || msRemaining <= 0) return 'Expired';
  const totalSec = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function sortByExpiry(items) {
  return [...items].sort((a, b) => {
    if (!a.good_by_date && !b.good_by_date) return 0;
    if (!a.good_by_date) return 1;
    if (!b.good_by_date) return -1;
    return new Date(a.good_by_date) - new Date(b.good_by_date);
  });
}

export function isListingExpired(item) {
  if (!item?.good_by_date) return false;
  return getExpiryInfo(item.good_by_date).status === 'expired';
}

/** Hide produce past good-by date from public browse (client-side; DB cron also hides). */
export function filterActiveListings(items) {
  return (items || []).filter((item) => !isListingExpired(item));
}