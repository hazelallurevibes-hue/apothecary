/** Profile & settings destinations by role. */

export const ACCOUNT_PROFILE_PATH = '/account-settings#profile';
export const STOREFRONT_SETTINGS_PATH = '/storefront-settings#photos';

export function getProfileEditPath() {
  return ACCOUNT_PROFILE_PATH;
}

export function getVendorPhotoEditPath() {
  return STOREFRONT_SETTINGS_PATH;
}