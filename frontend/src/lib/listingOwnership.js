/**
 * Who may show Edit / Hide / Remove on a public listing page.
 * Seekers must never pass — even if users.vendor_id is stale.
 */
export function canUserManageListing(user, listingVendorId) {
  if (!user || listingVendorId == null || listingVendorId === '') return false;

  const role = String(user.role || '').toLowerCase();
  const listingVid = Number(listingVendorId);
  if (!Number.isFinite(listingVid) || listingVid <= 0) return false;

  // Pure seekers / guests — never manage
  if (role === 'customer' || role === 'guest' || role === '') {
    // Exception: team member on a practice
    if (user.employee_vendor_id != null && Number(user.employee_vendor_id) === listingVid) {
      return true;
    }
    return false;
  }

  if (role === 'admin' || user.isAdmin) {
    // Admin only sees “Your listing” tools when they own that practice — not every listing
    const adminVid = Number(user.vendor_id || user.vendor);
    return Number.isFinite(adminVid) && adminVid > 0 && adminVid === listingVid;
  }

  if (role === 'vendor') {
    const vid = Number(user.vendor_id || user.vendor);
    if (Number.isFinite(vid) && vid > 0 && vid === listingVid) return true;
    return false;
  }

  if (user.employee_vendor_id != null && Number(user.employee_vendor_id) === listingVid) {
    return true;
  }

  return false;
}
