import { createClient } from '@supabase/supabase-js';
import { HAZEL_AUTH_STORAGE_KEY, sharedAuthStorage } from './sharedAuthStorage.js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseAuth = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: sharedAuthStorage,
      storageKey: HAZEL_AUTH_STORAGE_KEY,
      flowType: 'pkce',
    },
  },
);

export function isAuthConfigured() {
  return Boolean(url && key && !url.includes('placeholder'));
}
