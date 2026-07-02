/** Client-side printable certificate — opens print dialog for PDF save */

export function openCertificatePrint({ studentName, courseTitle, vendorName, templateTitle, bodyText, sealColor = '#4a1942', issuedDate, verifyHash }) {
  const html = `
<!DOCTYPE html><html><head><title>Certificate</title>
<style>
  @page { size: landscape; margin: 0.5in; }
  body { font-family: Georgia, serif; margin: 0; padding: 48px; color: #2d1230; }
  .frame { border: 3px double ${sealColor}; padding: 48px; text-align: center; min-height: 420px; }
  h1 { font-size: 28px; letter-spacing: 2px; margin: 0 0 8px; color: ${sealColor}; }
  .sub { font-size: 14px; color: #666; margin-bottom: 32px; }
  .name { font-size: 32px; font-style: italic; margin: 24px 0; }
  .course { font-size: 18px; margin: 16px 0; }
  .body { font-size: 13px; line-height: 1.6; max-width: 520px; margin: 24px auto; color: #444; }
  .seal { width: 72px; height: 72px; border-radius: 50%; border: 2px solid ${sealColor}; margin: 32px auto 16px; line-height: 72px; font-size: 28px; }
  .footer { font-size: 11px; color: #888; margin-top: 32px; }
  .disclaimer { font-size: 9px; color: #aaa; margin-top: 16px; max-width: 480px; margin-left: auto; margin-right: auto; }
</style></head><body>
<div class="frame">
  <h1>${escapeHtml(templateTitle || 'Certificate of Completion')}</h1>
  <p class="sub">Teaching Sanctum · Hazel Allure</p>
  <p class="body">This certifies that</p>
  <p class="name">${escapeHtml(studentName)}</p>
  <p class="course">has completed <strong>${escapeHtml(courseTitle)}</strong></p>
  ${bodyText ? `<p class="body">${escapeHtml(bodyText)}</p>` : ''}
  <div class="seal">✦</div>
  <p class="footer">${escapeHtml(vendorName)} · ${escapeHtml(issuedDate || new Date().toLocaleDateString())}</p>
  ${verifyHash ? `<p class="footer" style="margin-top:8px">Verify: ${escapeHtml(verifyHash)}</p>` : ''}
  <p class="disclaimer">Issued by an independent practitioner via Hazel Allure. Not an accredited degree, medical license, or state professional credential.</p>
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}