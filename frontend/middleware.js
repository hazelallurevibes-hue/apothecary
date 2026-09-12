const BOT =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Googlebot|bingbot|Applebot|Pinterest|GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|PerplexityBot|Google-Extended|DuckDuckBot/i;

export const config = {
  matcher: [
    '/',
    '/about',
    '/faq',
    '/learn',
    '/learn/:path*',
    '/privacy',
    '/terms',
    '/agreements',
    '/contact',
    '/marketplace',
    '/services',
    '/products',
    '/courses',
    '/top-vendors',
    '/pro-upgrade',
    '/vendor-signup',
    '/customer-signup',
    '/remedies',
    '/remedies/:path*',
  ],
};

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT.test(ua)) return;
  const url = new URL(request.url);
  const dest = new URL('/api/crawler', url.origin);
  dest.searchParams.set('path', url.pathname);
  return fetch(dest, { headers: { 'user-agent': ua } });
}
