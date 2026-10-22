import PDFDocument from 'pdfkit';

/**
 * Generates an official Certificate Verification Audit Report in PDF format.
 * Styled with #1F2329 and #B6FF2E.
 */
export function generateVerificationReportPDF(verification, res) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 45, right: 45 }
  });

  doc.pipe(res);

  const pageWidth = 595.28;
  const contentWidth = pageWidth - 90;

  // Header Bar in #1F2329
  doc.rect(0, 0, pageWidth, 80).fill('#1F2329');

  doc.font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#FFFFFF')
    .text('AUTHPROOF VERIFICATION PORTAL', 45, 25);

  doc.font('Helvetica')
    .fontSize(10)
    .fillColor('#B6FF2E')
    .text('OFFICIAL FORENSIC VERIFICATION AUDIT REPORT', 45, 48);

  doc.font('Helvetica')
    .fontSize(9)
    .fillColor('#E2E8F0')
    .text(`Report ID: AUD-${(verification.id || 'N/A').toUpperCase()}`, pageWidth - 220, 48, { width: 175, align: 'right' });

  // Status Banner
  const isAuthentic = verification.hrDecision === 'VERIFIED AS AUTHENTIC' || (!verification.hrDecision && verification.automatedResult === 'VERIFIED AS AUTHENTIC');
  const isFake = verification.hrDecision === 'FLAGGED AS POTENTIALLY FAKE' || (!verification.hrDecision && verification.automatedResult === 'FLAGGED AS POTENTIALLY FAKE');

  const bannerBg = isAuthentic ? '#F4FCE3' : isFake ? '#FEF2F2' : '#FFFBEB';
  const bannerBorder = isAuthentic ? '#B6FF2E' : isFake ? '#EF4444' : '#F59E0B';
  const bannerTextColor = isAuthentic ? '#1F2329' : isFake ? '#991B1B' : '#92400E';
  const finalStatusText = verification.hrDecision || verification.automatedResult || 'VERIFICATION INCONCLUSIVE';

  doc.rect(45, 95, contentWidth, 54).fillColor(bannerBg).fill();
  doc.lineWidth(2).strokeColor(bannerBorder).rect(45, 95, contentWidth, 54).stroke();

  doc.font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(bannerTextColor)
    .text(`VERIFICATION VERDICT: ${finalStatusText}`, 60, 107);

  doc.font('Helvetica')
    .fontSize(10)
    .fillColor(bannerTextColor)
    .text(`Integrity Confidence Score: ${verification.confidenceScore || 0}%  •  Passed: ${verification.checksPassed || 0} checks  •  Failed: ${verification.checksFailed || 0} checks`, 60, 127);

  // Section 1: Certificate & Submission Details
  let currentY = 165;
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F2329').text('1. Document & Submission Profile', 45, currentY);
  currentY += 18;

  doc.rect(45, currentY, contentWidth, 105).fillColor('#F8FAFC').fill();
  doc.lineWidth(1).strokeColor('#E2E8F0').rect(45, currentY, contentWidth, 105).stroke();

  const leftColX = 60;
  const rightColX = 310;
  let rowY = currentY + 12;

  const renderField = (label, value, x, y) => {
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748B').text(label, x, y);
    doc.font('Helvetica').fontSize(10).fillColor('#1F2329').text(value || 'Not Specified', x, y + 13, { width: 220, ellipsis: true });
  };

  renderField('Certificate ID', verification.certificateId || verification.extractedData?.certificateId || 'N/A', leftColX, rowY);
  renderField('Uploaded Filename', verification.targetFileName || 'Direct File Upload', rightColX, rowY);

  rowY += 32;
  renderField('Claimed / Detected Recipient', verification.recipientName || verification.extractedData?.recipientName || 'N/A', leftColX, rowY);
  renderField('Submitting Employee', verification.employeeName ? `${verification.employeeName} (${verification.employeeUsername || ''})` : 'Standalone Scan (HR Direct Upload)', rightColX, rowY);

  rowY += 32;
  renderField('Issuing Institution', verification.issuingInstitution || verification.extractedData?.issuingInstitution || 'N/A', leftColX, rowY);
  renderField('Verification Timestamp', new Date(verification.timestamp || Date.now()).toLocaleString(), rightColX, rowY);

  // Section 2: Forensic Verification Breakdown
  currentY += 125;
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F2329').text('2. Multi-Layered Forensic Inspection Log', 45, currentY);
  currentY += 18;

  const checks = verification.checks || [];
  checks.forEach((chk, idx) => {
    const isPass = chk.passed;
    const badgeColor = isPass ? '#4D7C0F' : '#EF4444';
    const badgeBg = isPass ? '#F4FCE3' : '#FEF2F2';
    const boxHeight = 36;

    if (currentY + boxHeight > 750) {
      doc.addPage();
      currentY = 45;
    }

    doc.rect(45, currentY, contentWidth, boxHeight).fillColor(badgeBg).fill();
    doc.lineWidth(1).strokeColor(badgeColor).rect(45, currentY, contentWidth, boxHeight).stroke();

    doc.circle(60, currentY + 18, 6).fillColor(badgeColor).fill();
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF').text(isPass ? '✓' : '✗', 57.5, currentY + 13.5);

    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1F2329').text(chk.name, 75, currentY + 6);
    doc.font('Helvetica').fontSize(8.5).fillColor('#475569').text(chk.details || '', 75, currentY + 20, { width: contentWidth - 40, ellipsis: true });

    currentY += boxHeight + 6;
  });

  // Section 3: Discrepancy Findings
  currentY += 10;
  if (currentY > 700) {
    doc.addPage();
    currentY = 45;
  }

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F2329').text('3. Discrepancy Findings & Forensic Analysis', 45, currentY);
  currentY += 18;

  const discText = verification.discrepancySummary || 'No discrepancies identified. Document matches accredited records.';
  const discBoxHeight = 55;

  doc.rect(45, currentY, contentWidth, discBoxHeight).fillColor(isFake ? '#FFF1F2' : '#F8FAFC').fill();
  doc.lineWidth(1).strokeColor(isFake ? '#FDA4AF' : '#E2E8F0').rect(45, currentY, contentWidth, discBoxHeight).stroke();

  doc.font('Helvetica-Bold').fontSize(9).fillColor(isFake ? '#BE123C' : '#1F2329').text(isFake ? 'CRITICAL DISCREPANCY DETECTED' : 'FORENSIC SUMMARY', 58, currentY + 10);
  doc.font('Helvetica').fontSize(9).fillColor('#334155').text(discText, 58, currentY + 24, { width: contentWidth - 26 });

  // Section 4: HR Review & Sign-Off
  currentY += discBoxHeight + 15;
  if (currentY > 680) {
    doc.addPage();
    currentY = 45;
  }

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F2329').text('4. HR Review & Official Sign-off', 45, currentY);
  currentY += 18;

  doc.rect(45, currentY, contentWidth, 65).fillColor('#F8FAFC').fill();
  doc.lineWidth(1).strokeColor('#E2E8F0').rect(45, currentY, contentWidth, 65).stroke();

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748B').text('HR Reviewer:', 60, currentY + 12);
  doc.font('Helvetica').fontSize(9.5).fillColor('#1F2329').text(verification.reviewerName || 'Automated Forensic Engine (HR Pending)', 140, currentY + 12);

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748B').text('Review Decision:', 60, currentY + 28);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(bannerTextColor).text(verification.hrDecision || verification.automatedResult, 140, currentY + 28);

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748B').text('Review Notes:', 60, currentY + 44);
  doc.font('Helvetica').fontSize(9).fillColor('#334155').text(verification.reviewNotes || 'Automated verification check generated by Digital Certificate Verification Portal.', 140, currentY + 44, { width: contentWidth - 110, ellipsis: true });

  // Footer
  doc.font('Helvetica').fontSize(8).fillColor('#94A3B8').text(
    'AuthProof Verification • Enterprise Compliance Document • Certified Audit Copy',
    45,
    pageWidth > 600 ? 800 : 785,
    { align: 'center', width: contentWidth }
  );

  doc.end();
}
