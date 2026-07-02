import { resolveVendorAura } from '../lib/vendorAura';

export default function PractitionerAuraGlow({ vendor, children, className = '' }) {
  const aura = resolveVendorAura(vendor);
  return (
    <div
      className={`relative ${className}`}
      style={{
        boxShadow: `0 0 48px 8px ${aura.color}33, 0 0 0 1px ${aura.color}22`,
      }}
      title={aura.label}
    >
      <div
        className="pointer-events-none absolute -inset-1 rounded-[inherit] opacity-40 blur-xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${aura.color}55, transparent 70%)` }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}