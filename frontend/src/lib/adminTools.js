/** Admin portal tab keys and deep links — single source for nav + command center. */

export const ADMIN_TABS = {
  overview: { key: 'overview', label: 'Overview', icon: '📊', path: '/users?tab=overview' },
  users: { key: 'users', label: 'Users', icon: '👥', path: '/users?tab=users' },
  vendors: { key: 'vendors', label: 'Practitioners', icon: '🔮', path: '/users?tab=vendors' },
  verification: { key: 'verification', label: 'ID & Permits', icon: '🪪', path: '/users?tab=verification' },
  automation: { key: 'automation', label: 'Automation', icon: '⚡', path: '/users?tab=automation' },
  campaigns: { key: 'campaigns', label: 'Campaigns', icon: '📧', path: '/users?tab=campaigns' },
  compliance: { key: 'compliance', label: 'Compliance', icon: '📋', path: '/users?tab=compliance' },
  orders: { key: 'orders', label: 'Orders', icon: '📦', path: '/users?tab=orders' },
  content: { key: 'content', label: 'Content', icon: '✨', path: '/users?tab=content' },
  email: { key: 'email', label: 'Site Email', icon: '📬', path: '/users?tab=email' },
  proPayments: { key: 'pro-payments', label: 'Pro Payments', icon: '💳', path: '/users?tab=pro-payments' },
  settings: { key: 'settings', label: 'Settings', icon: '⚙️', path: '/users?tab=settings' },
};

export const ADMIN_EXTERNAL_LINKS = [
  { label: 'Stripe Dashboard', href: 'https://dashboard.stripe.com', desc: 'Payments & subscriptions' },
  { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard', desc: 'Database & auth' },
  { label: 'Resend Dashboard', href: 'https://resend.com/emails', desc: 'Transactional email' },
  { label: 'Vercel Dashboard', href: 'https://vercel.com/dashboard', desc: 'Deployments & domains' },
];

export const ADMIN_SITE_LINKS = [
  { label: 'Marketplace', to: '/services' },
  { label: 'Apothecary', to: '/products' },
  { label: 'The Hearth', to: '/gathering' },
  { label: 'Pro upgrade page', to: '/pro-upgrade' },
  { label: 'Vendor verification', to: '/vendor-verification' },
  { label: 'Onboarding flow', to: '/onboarding' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Policies', to: '/policies-procedures' },
];

export const AUTOMATION_SETTING_KEYS = [
  {
    key: 'auto_approve_vendor_signup',
    label: 'Auto-approve practitioner signups',
    desc: 'New practitioner applications go live immediately — no manual vendor approval.',
    group: 'approvals',
  },
  {
    key: 'auto_approve_id_verification',
    label: 'Auto-approve photo ID submissions',
    desc: 'Trust ID uploads without manual review. Use only in trusted environments.',
    group: 'approvals',
  },
  {
    key: 'auto_approve_permit_verification',
    label: 'Auto-approve permit uploads',
    desc: 'Business & practice permits are approved on upload.',
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
    label: 'Tie vendor approval to approved ID',
    desc: 'When a practitioner ID is approved, also approve their vendor account if still pending.',
    group: 'workflow',
  },
  {
    key: 'require_legal_name_on_id',
    label: 'Require legal name on government ID',
    desc: 'Practitioners must enter the full name exactly as printed on their ID.',
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
    label: 'Block first listing until ID is approved',
    desc: 'Practitioners cannot post until admin approves their photo ID (not just submitted).',
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