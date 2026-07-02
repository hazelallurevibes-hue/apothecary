export default function CommunityCodeBanner() {
  return (
    <aside className="rounded-2xl border border-rose-200/50 bg-rose-50/30 p-4 mb-6 text-sm text-gray-700">
      <p className="font-semibold text-[#4a1942] text-xs uppercase tracking-widest mb-2">Community code · The Hearth</p>
      <ul className="space-y-1 text-xs leading-relaxed list-disc list-inside marker:text-rose-400">
        <li><strong>Zero tolerance</strong> for hate speech, slurs, bullying, threats, or harassment.</li>
        <li>Be kind — disagree without attacking people.</li>
        <li>No medical diagnosis, prescription advice, or emergency triage in public threads.</li>
        <li>No spam, scams, impersonation, or off-platform payment solicitation.</li>
        <li>Automated filters may block or flag posts; moderators may remove content and issue warnings.</li>
        <li>Three strikes within 30 days may restrict posting — appeals via Support.</li>
      </ul>
    </aside>
  );
}