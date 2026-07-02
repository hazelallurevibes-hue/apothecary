export default function ModAuthorBadge({ mod }) {
  if (!mod) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200/60 ml-1">
      <span aria-hidden>🕯️</span> {mod.badge_title || 'Hearth Keeper'}
    </span>
  );
}