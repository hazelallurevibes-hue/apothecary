/** Hover/focus explainer — origin, meaning, tips */
export default function InfoTip({ label, title, children, className = '' }) {
  return (
    <span className={`relative inline-flex items-center gap-1 group/tip ${className}`}>
      <span className="font-semibold text-[#4a1942]">{label}</span>
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-black border border-[#c9a227]/50 bg-amber-50 text-[#4a1942] hover:bg-[#c9a227] hover:text-white transition shrink-0"
        aria-label={title || `About ${label}`}
        title={typeof children === 'string' ? children : title}
      >
        !
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 bottom-full mb-2 z-30 w-64 max-w-[85vw] rounded-xl border border-[#c9a227]/40 bg-white p-3 text-left text-[11px] leading-relaxed text-[#4a1942]/85 shadow-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible group-focus-within/tip:opacity-100 group-focus-within/tip:visible transition"
      >
        {title && <span className="block font-bold text-[#c9a227] text-[10px] uppercase tracking-wide mb-1">{title}</span>}
        {children}
      </span>
    </span>
  );
}
