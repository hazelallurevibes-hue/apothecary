const BOT =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Googlebot|Google-InspectionTool|Storebot-Google|GoogleOther|AdsBot-Google|bingbot|Applebot|Pinterest|GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|PerplexityBot|Google-Extended|DuckDuckBot/i;

const SKIP =
  /^\/(api\/|assets\/|brand\/|tarot\/|login|account-settings|dashboard|vendor-dashboard|orders|cart|messages|invoices|tasks|favorites|support|documents)/i;

export const config = {
  matcher: ['/((?!api/|assets/|brand/|tarot/|_next/|favicon|icon-|apple-touch|manifest\\.json|robots\\.txt|version\\.json|sitemap\\.xml).*)'],
};

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT.test(ua)) return;
  const url = new URL(request.url);
  if (SKIP.test(url.pathname)) return;
  const dest = new URL('/api/crawler', url.origin);
  dest.searchParams.set('path', url.pathname);
  return fetch(dest, { headers: { 'user-agent': ua } });
}
