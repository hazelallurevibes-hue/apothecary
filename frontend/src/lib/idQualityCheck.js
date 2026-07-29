/**
 * Lightweight auto-review heuristics for vendor photo ID submissions.
 * Approves clean packages; flags incomplete ones for admin without blocking forever.
 */

export function evaluateIdentitySubmission({
  idFrontUrl,
  idBackUrl,
  selfieUrl,
  legalName,
  requireLegal = true,
  requireBack = false,
} = {}) {
  const issues = [];
  const flags = [];

  if (!idFrontUrl || !String(idFrontUrl).startsWith('http')) {
    issues.push('Missing or invalid ID front photo URL');
  }
  if (!selfieUrl || !String(selfieUrl).startsWith('http')) {
    issues.push('Missing or invalid selfie-with-ID photo URL');
  }
  if (requireBack && (!idBackUrl || !String(idBackUrl).startsWith('http'))) {
    issues.push('Missing ID back photo (required by platform settings)');
  }

  const name = (legalName || '').trim().replace(/\s+/g, ' ');
  if (requireLegal) {
    if (name.length < 3) {
      issues.push('Legal name missing or too short');
    } else if (!/\s/.test(name)) {
      flags.push('Legal name has no space — confirm first + last name on ID');
    } else if (name.length < 5) {
      flags.push('Legal name looks unusually short');
    }
    if (/[0-9]{3,}/.test(name)) {
      flags.push('Legal name contains long number sequences');
    }
    if (name === name.toUpperCase() && name.length > 8) {
      flags.push('Name is all caps — still OK if it matches ID print');
    }
  }

  // Soft flags (do not hard-fail)
  if (idFrontUrl && idFrontUrl === selfieUrl) {
    flags.push('Front ID and selfie URLs are identical — possible re-upload of same file');
  }

  const hardFail = issues.length > 0;
  const needsAdminEye = flags.length > 0;

  let recommendedStatus = 'pending';
  if (hardFail) {
    recommendedStatus = 'flagged';
  } else if (needsAdminEye) {
    recommendedStatus = 'flagged'; // admin can still approve quickly
  } else {
    recommendedStatus = 'approved';
  }

  return {
    ok: !hardFail,
    issues,
    flags,
    recommendedStatus,
    qualityScore: Math.max(0, 100 - issues.length * 35 - flags.length * 10),
    summary: hardFail
      ? `Blocked: ${issues.join('; ')}`
      : needsAdminEye
        ? `Auto-flagged for admin: ${flags.join('; ')}`
        : 'Passed automated completeness checks — auto-approved',
  };
}
