import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLES_DIR = path.join(__dirname, '../../public/samples');

if (!fs.existsSync(SAMPLES_DIR)) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
}

export const SAMPLE_A_PATH = path.join(SAMPLES_DIR, 'Sample_Certificate_A_Original.pdf');
export const SAMPLE_B_PATH = path.join(SAMPLES_DIR, 'Sample_Certificate_B_Altered.pdf');

/**
 * Generates an elegant landscape certificate PDF using PDFKit
 * Styled with #1F2329 (Charcoal) and #B6FF2E (Electric Lime)
 */
function createCertificateFile({ filePath, certId, recipient, institution, certType, issueDate, isAltered = false }) {
  return new Promise((resolve, reject) => {
    // Landscape A4 (841.89 x 595.28 points)
    const doc = new PDFDocument({
      size: [842, 595],
      margins: { top: 30, bottom: 30, left: 30, right: 30 }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const width = 842;
    const height = 595;

    // Outer Background in #1F2329
    doc.rect(0, 0, width, height).fill('#1F2329');

    // Inner Canvas in Crisp Eggshell
    doc.rect(20, 20, width - 40, height - 40).fill('#FAFAFA');

    // Double Border with #1F2329 and Neon Lime #B6FF2E
    doc.lineWidth(4).strokeColor('#1F2329').rect(28, 28, width - 56, height - 56).stroke();
    doc.lineWidth(2).strokeColor('#B6FF2E').rect(34, 34, width - 68, height - 68).stroke();

    // Corner Ornaments
    const drawCorner = (x, y) => {
      doc.save();
      doc.lineWidth(2).strokeColor('#B6FF2E');
      doc.rect(x, y, 20, 20).stroke();
      doc.restore();
    };
    drawCorner(38, 38);
    drawCorner(width - 58, 38);
    drawCorner(38, height - 58);
    drawCorner(width - 58, height - 58);

    // DEMO Watermark Header Banner
    doc.rect(40, 42, width - 80, 22).fill(isAltered ? '#FEE2E2' : '#F4FCE3');
    doc.font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(isAltered ? '#DC2626' : '#4D7C0F')
      .text(
        isAltered
          ? 'DEMO — NOT A REAL CERTIFICATE (DELIBERATELY ALTERED FOR TESTING FRAUD DETECTION)'
          : 'DEMO — NOT A REAL CERTIFICATE (AUTHENTIC SAMPLE FOR DEMONSTRATION VERIFICATION)',
        40,
        48,
        { align: 'center', width: width - 80 }
      );

    // Institution Name in Charcoal #1F2329
    doc.font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#1F2329')
      .text(institution.toUpperCase(), 50, 85, { align: 'center', width: width - 100 });

    doc.font('Helvetica')
      .fontSize(11)
      .fillColor('#64748B')
      .text('Accredited Centre for Advanced Computing & Technical Certifications', 50, 114, { align: 'center', width: width - 100 });

    // Certificate of Achievement Title
    doc.font('Times-BoldItalic')
      .fontSize(34)
      .fillColor('#1F2329')
      .text('Certificate of Achievement', 50, 145, { align: 'center', width: width - 100 });

    // Decorative Accent Line with #B6FF2E
    doc.moveTo(width / 2 - 130, 190).lineTo(width / 2 + 130, 190).lineWidth(3).strokeColor('#B6FF2E').stroke();

    // Presentation text
    doc.font('Helvetica')
      .fontSize(13)
      .fillColor('#475569')
      .text('This is to certify that the credential record officially recognizes', 50, 210, { align: 'center', width: width - 100 });

    // Recipient Name
    doc.font('Times-Bold')
      .fontSize(32)
      .fillColor('#1F2329')
      .text(recipient, 50, 240, { align: 'center', width: width - 100 });

    // Achievement description
    doc.font('Helvetica')
      .fontSize(13)
      .fillColor('#475569')
      .text('has successfully completed the comprehensive professional examination and demonstrated proficiency in', 50, 290, { align: 'center', width: width - 100 });

    // Certificate Type / Course
    doc.font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#1F2329')
      .text(certType, 50, 320, { align: 'center', width: width - 100 });

    // Metadata Grid Box in #1F2329
    const boxY = 375;
    doc.rect(100, boxY, width - 200, 75).fill('#F8FAFC');
    doc.lineWidth(1).strokeColor('#CBD5E1').rect(100, boxY, width - 200, 75).stroke();

    // Col 1: Certificate ID
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#64748B').text('CERTIFICATE ID', 130, boxY + 16);
    doc.font('Courier-Bold').fontSize(14).fillColor('#1F2329').text(certId, 130, boxY + 34);

    // Col 2: Issue Date
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#64748B').text('DATE OF ISSUANCE', 360, boxY + 16);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1F2329').text(issueDate, 360, boxY + 34);

    // Col 3: Accreditation
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#64748B').text('REGISTRY ACCREDITATION', 580, boxY + 16);
    doc.font('Courier-Bold').fontSize(11).fillColor('#4D7C0F').text('ETI-ACCRED-2025-V2', 580, boxY + 34);

    // Signatures & Issuer Seal
    const sigY = 480;
    // Left Signature
    doc.moveTo(130, sigY).lineTo(280, sigY).lineWidth(1).strokeColor('#94A3B8').stroke();
    doc.font('Times-Italic').fontSize(16).fillColor('#1F2329').text('Dr. A. R. Harrison', 130, sigY - 24);
    doc.font('Helvetica').fontSize(10).fillColor('#64748B').text('Dean of Examinations', 130, sigY + 6);

    // Center Official Seal with #B6FF2E and #1F2329
    doc.circle(width / 2, sigY - 5, 26).lineWidth(2).strokeColor('#1F2329').fillAndStroke('#F4FCE3', '#1F2329');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1F2329').text('OFFICIAL', width / 2 - 20, sigY - 14, { width: 40, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#4D7C0F').text('ACCREDITED', width / 2 - 24, sigY - 3, { width: 48, align: 'center' });

    // Right Signature
    doc.moveTo(width - 280, sigY).lineTo(width - 130, sigY).lineWidth(1).strokeColor('#94A3B8').stroke();
    doc.font('Times-Italic').fontSize(16).fillColor('#1F2329').text('Prof. Elena Rostova', width - 280, sigY - 24);
    doc.font('Helvetica').fontSize(10).fillColor('#64748B').text('Director General, Certification Board', width - 280, sigY + 6);

    // Footer Security Notice
    doc.font('Helvetica').fontSize(8).fillColor('#94A3B8').text(
      `Credential Verification Portal • Security Token: ${certId} • Verification Registry Match Active`,
      50,
      height - 45,
      { align: 'center', width: width - 100 }
    );

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

export async function generateDemoCertificates() {
  await createCertificateFile({
    filePath: SAMPLE_A_PATH,
    certId: 'DEMO-CERT-1001',
    recipient: 'Arjun Kumar',
    institution: 'Example Technical Institute',
    certType: 'Web Development',
    issueDate: '15 August 2025',
    isAltered: false
  });

  await createCertificateFile({
    filePath: SAMPLE_B_PATH,
    certId: 'DEMO-CERT-2002',
    recipient: 'Priya Sharma',
    institution: 'Example Technical Institute',
    certType: 'Cybersecurity Fundamentals',
    issueDate: '15 August 2025',
    isAltered: true
  });

  console.log(`Sample Certificate A (Original) generated at: ${SAMPLE_A_PATH}`);
  console.log(`Sample Certificate B (Altered) generated at: ${SAMPLE_B_PATH}`);
}
