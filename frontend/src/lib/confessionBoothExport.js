/** Format confession booth entries as a readable confessional journal (not JSON). */
export function formatConfessionalBoothArchive({ userEmail, entries = [] }) {
  const exportedAt = new Date().toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const sorted = [...entries].sort((a, b) => (b.confession_date || '').localeCompare(a.confession_date || ''));

  const lines = [
    '═══════════════════════════════════════════════════════',
    '          HAZEL ALLURE — CONFESSIONAL BOOTH',
    '              Private journal export',
    '═══════════════════════════════════════════════════════',
    '',
    `Exported: ${exportedAt}`,
    `Seeker: ${userEmail || 'unknown'}`,
    `Entries: ${sorted.length}`,
    '',
    'This archive is for personal reflection only.',
    'Not therapy, crisis support, or a legal record.',
    '',
  ];

  if (!sorted.length) {
    lines.push('(No sealed entries yet.)', '');
  } else {
    sorted.forEach((entry, index) => {
      lines.push('───────────────────────────────────────────────────────');
      lines.push(`Entry ${index + 1} · ${entry.confession_date || 'undated'}`);
      lines.push('───────────────────────────────────────────────────────');
      lines.push('');
      lines.push(String(entry.body || '').trim() || '(empty)');
      lines.push('');
    });
  }

  lines.push('═══════════════════════════════════════════════════════');
  lines.push('              End of confessional booth');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  return lines.join('\n');
}