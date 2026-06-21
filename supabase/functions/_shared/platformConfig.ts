import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export const DEFAULT_SITE_URL = "https://bpicius.com";

const EMAIL_DEFAULTS: Record<string, string> = {
  site_url: DEFAULT_SITE_URL,
  email_from_name: "Bpicius",
  email_from_address: "noreply@bpicius.com",
  email_reply_to: "support@bpicius.com",
  email_contact: "hello@bpicius.com",
  email_support: "support@bpicius.com",
  email_orders: "orders@bpicius.com",
  email_admin: "admin@bpicius.com",
  email_vendors: "vendors@bpicius.com",
  email_info: "info@bpicius.com",
};

export type PlatformEmailConfig = {
  siteUrl: string;
  notifyFrom: string;
  replyTo: string;
  adminEmail: string;
  settings: Record<string, string>;
};

export async function loadPlatformEmailConfig(
  supabase: SupabaseClient,
): Promise<PlatformEmailConfig> {
  const { data } = await supabase.from("platform_settings").select("key, value");
  const settings: Record<string, string> = { ...EMAIL_DEFAULTS };
  for (const row of data || []) {
    if (row.value != null && row.value !== "") settings[row.key] = String(row.value);
  }

  const siteUrl = (
    settings.site_url
    || Deno.env.get("APP_URL")
    || DEFAULT_SITE_URL
  ).replace(/\/$/, "");

  const fromName = settings.email_from_name || EMAIL_DEFAULTS.email_from_name;
  const fromAddr = settings.email_from_address || EMAIL_DEFAULTS.email_from_address;
  const notifyFrom = Deno.env.get("NOTIFY_FROM_EMAIL") || `${fromName} <${fromAddr}>`;
  const replyTo = settings.email_reply_to || settings.email_support || fromAddr;
  const adminEmail = settings.email_admin || settings.email_contact || fromAddr;

  return { siteUrl, notifyFrom, replyTo, adminEmail, settings };
}