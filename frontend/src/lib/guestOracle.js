const STORAGE_KEY = 'hazel_guest_oracle_count';
export const GUEST_ORACLE_LIMIT = 2;

export function getGuestOracleCount() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function incrementGuestOracle() {
  const next = getGuestOracleCount() + 1;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function guestOracleRemaining(user) {
  if (user?.email) return null;
  return Math.max(0, GUEST_ORACLE_LIMIT - getGuestOracleCount());
}

export function canGuestAskOracle(user) {
  if (user?.email) return true;
  return getGuestOracleCount() < GUEST_ORACLE_LIMIT;
}