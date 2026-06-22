import { VERTICAL } from './vertical';

/** Per-stack localStorage keys — keeps Hazel isolated from Bpicius and other forks. */
const PREFIX = VERTICAL.id;

export const STORAGE_KEYS = {
  user: `${PREFIX}_user`,
  cart: `${PREFIX}_cart`,
  locale: `${PREFIX}_locale`,
  textScale: `${PREFIX}_text_scale`,
};

export const CSS_VARS = {
  textScale: `--${PREFIX}-text-scale`,
};

/** Auth0 custom claim namespace (must match tenant app_metadata keys). */
export const AUTH0_NAMESPACE = `${VERTICAL.appUrl}/`;