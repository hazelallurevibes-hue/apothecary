/** Admin portal tab keys and deep links — vertical-aware, no cross-brand mixing */

import { VERTICAL, verticalFeature } from './vertical';

const vendorLabel = VERTICAL.labels.vendor;
const vendorPlural = VERTICAL.labels.vendors;

export const ADMIN_TABS = {
  overview: { key: 'overview', label: 'Overview', icon: '📊', path: '/users?tab=overview' },
  users: { key: 'users', label: 'Users', icon: '👥', path: '/users?tab=users' },
  vendors: { key: 'vendors', label: vendorPlural, icon: verticalFeature('farmersMarketMode') ? '🌾' : '🔮', path: '/users?tab=vendors' },
  verification: { key: 'verification', label: 'ID, Permits & Licenses', icon: '🪪', path: '/users?tab=verification' },
  automation: { key: 'automation', label: 'Automation', icon: '⚡', path: '/users?tab=automation' },
  campaigns: { key: 'campaigns', label: 'Campaigns', icon: '📧', path: '/users?tab=campaigns' },
  ...(verticalFeature('adReinvestment')
    ? { advertising: { key: 'advertising', label: 'Advertising', icon: '📣', path: '/users?tab=advertising' } }
    : {}),
  compliance: { key: 'compliance', label: 'Compliance', icon: '📋', path: '/users?tab=compliance' },
  orders: { key: 'orders', label: 'Orders', icon: '📦', path: '/users?tab=orders' },
  content: { key: 'content', label: 'Content', icon: '✨', path: '/users?tab=content' },
  magic: { key: 'magic', label: 'Magic Sanctum', icon: '⑧', path: '/users?tab=magic' },
  email: { key: 'email', label: 'Site Email', icon: '📬', path: '/users?tab=email' },
  proPayments: { key: 'pro-payments', label: 'Pro Payments', icon: '💳', path: '/users?tab=pro-payments' },
  settings: { key: 'settings', label: 'Settings', icon: '⚙️', path: '/users?tab=settings' },
};

export const ADMIN_EXTERNAL_LINKS = [
  { label: 'Stripe Dashboard', href: 'https://dashboard.stripe.com', desc: 'Payments & subscriptions' },
  { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard', desc: 'Database & auth' },
  { label: 'Resend Dashboard', href: 'https://resend.com/emails', desc: 'Transactional email' },
  { label: 'Vercel Dashboard', href: 'https://vercel.com/dashboard', desc: 'Deployments & domains' },
  { label: 'Magic Sanctum', href: 'https://magic.hazelallure.com', desc: 'Magic app (admin = full Pro)' },
  { label: 'Magic Vercel project', href: 'https://vercel.com/hazel-allure/magic-sanctum', desc: 'Magic Sanctum deploys' },
];

export const ADMIN_SITE_LINKS = [
  { label: VERTICAL.labels.marketplace, to: '/services' },
  { label: VERTICAL.labels.productsMarket, to: '/products' },
  { label: 'The Hearth', to: '/gathering' },
  { label: 'Pro upgrade page', to: '/pro-upgrade' },
  { label: `${vendorLabel} verification`, to: '/vendor-verification' },
  { label: 'Onboarding flow', to: '/onboarding' },
  { label: `${vendorLabel} dashboard`, to: '/vendor-dashboard' },
  ...(verticalFeature('seoLiterature') ? [{ label: 'SEO guides', to: '/learn' }] : []),
  { label: 'FAQ', to: '/faq' },
  { label: 'Policies', to: '/policies-procedures' },
];

/** Cross-product control surface — Magic Sanctum is part of Hazel Allure admin scope */
const MAGIC_ORIGIN = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAGIC_URL
  ? String(import.meta.env.VITE_MAGIC_URL).replace(/\/$/, '')
  : 'https://magic.hazelallure.com');

const magicBridge = (path = '/') =>
  `${MAGIC_ORIGIN}/auth/bridge?next=${encodeURIComponent(path)}`;

export const ADMIN_MAGIC_LINKS = [
  {
    label: 'Magic Sanctum (live)',
    href: magicBridge('/'),
    desc: 'Sphere, Court, Pathfinder, Desk Orb — stay signed in',
  },
  {
    label: 'Magic Settings',
    href: magicBridge('/settings'),
    desc: 'Install, Desk Orb, account & Pro status',
  },
  {
    label: 'Magic Sitemap',
    href: `${MAGIC_ORIGIN}/sitemap.xml`,
    desc: 'Search index of all public Magic routes',
  },
  {
    label: 'Magic Pathfinder',
    href: magicBridge('/pathfinder'),
    desc: 'Career / personality Pro maps',
  },
  {
    label: 'Hearth Court',
    href: magicBridge('/hearth-court'),
    desc: 'Decision circle + live polls (Pro)',
  },
];

export const AUTOMATION_SETTING_KEYS = [
  {
    key: 'auto_approve_vendor_signup',
    label: `Auto-approve ${vendorLabel.toLowerCase()} signups`,
    desc: `New ${vendorLabel.toLowerCase()} applications go live immediately — no manual approval.`,
    group: 'approvals',
  },
  {
    key: 'auto_approve_id_verification',
    label: 'Legacy: always auto-approve photo IDs',
    desc: 'Force-approve every ID upload. Prefer Smart ID review below for safer automation.',
    group: 'approvals',
  },
  {
    key: 'smart_id_review',
    label: 'Smart ID review (recommended)',
    desc: 'Auto-approve complete clean submissions; flag incomplete or odd packages for admin. On by default.',
    group: 'approvals',
  },
  {
    key: 'auto_approve_permit_verification',
    label: 'Auto-approve permit uploads',
    desc: verticalFeature('foodSafety')
      ? 'Food business & kitchen permits approved on upload.'
      : 'Business & practice permits are approved on upload.',
    group: 'approvals',
  },
  {
    key: 'campaign_requires_approval',
    label: 'Require admin approval for email campaigns',
    desc: 'When off, campaigns are approved automatically on submit.',
    group: 'approvals',
    invertLabel: true,
  },
  {
    key: 'tie_vendor_approval_to_id',
    label: `Tie ${vendorLabel.toLowerCase()} approval to approved ID`,
    desc: `When a ${vendorLabel.toLowerCase()} ID is approved, also approve their vendor account if still pending.`,
    group: 'workflow',
  },
  {
    key: 'require_legal_name_on_id',
    label: 'Require legal name on government ID',
    desc: `${vendorPlural} must enter the full name exactly as printed on their ID.`,
    group: 'verification',
  },
  {
    key: 'require_id_back_with_legal_name',
    label: 'Require ID back photo with legal name',
    desc: 'Both front and back of ID required when legal name verification is on.',
    group: 'verification',
  },
  {
    key: 'require_id_before_listing',
    label: 'Require approved ID before *service* listings',
    desc: `When on, session/service listings need approved ID. Product-only shops are never blocked by photo ID.`,
    group: 'verification',
  },
  {
    key: 'auto_hide_listing_on_escalation',
    label: 'Auto-hide listings on report escalation',
    desc: 'Listings hidden when report threshold is reached (see escalation threshold in Settings).',
    group: 'moderation',
  },
  {
    key: 'hearth_auto_block_enabled',
    label: 'Auto-block banned words in The Hearth',
    desc: 'Posts with blocked phrases are rejected before publish.',
    group: 'moderation',
  },
  {
    key: 'hearth_auto_flag_enabled',
    label: 'Auto-flag suspicious Hearth posts',
    desc: 'Flagged posts go to moderation queue instead of publishing immediately.',
    group: 'moderation',
  },
  {
    key: 'stale_listing_days',
    label: 'Stale listing auto-hide (days)',
    desc: 'Listings without updates are hidden after this many days.',
    group: 'moderation',
    type: 'number',
    min: 30,
    max: 365,
  },
  {
    key: 'report_escalation_threshold',
    label: 'Report escalation threshold',
    desc: 'Number of safety reports before auto-escalation hides a listing.',
    group: 'moderation',
    type: 'number',
    min: 2,
    max: 10,
  },
];