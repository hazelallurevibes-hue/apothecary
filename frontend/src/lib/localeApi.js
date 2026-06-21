import { supabase } from './supabaseClient';
import { localeMeta } from '../i18n';

export async function persistUserLocale(email, localeCode) {
  if (!email) return;
  const meta = localeMeta(localeCode);
  const { error } = await supabase
    .from('users')
    .update({
      locale: localeCode,
      region: meta.region,
      preferred_currency: meta.currency,
    })
    .ilike('email', email.trim());

  if (error && error.code !== '42703' && error.code !== '42P01') {
    console.warn('Could not save locale preference:', error.message);
  }
}