/** Reusable woman-owned business trust badge — branding + SEO signal */
export default function WomanOwnedBadge({ variant = 'light', className = '' }) {
  const styles =
    variant === 'dark'
      ? 'text-white/90 bg-white/10 border-white/25'
      : 'text-ha-primary bg-ha-rose/40 border-ha-rose/50';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.12em] uppercase border ${styles} ${className}`}
      title="Certified woman-owned business"
    >
      <span aria-hidden="true">✦</span>
      Woman-Owned
    </span>
  );
}