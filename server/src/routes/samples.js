import express from 'express';
import fs from 'fs';
import { SAMPLE_A_PATH, SAMPLE_B_PATH } from '../services/sampleGenerator.js';

const router = express.Router();

/**
 * GET /api/samples/list
 * Returns list and metadata of the controlled demonstration certificates.
 */
router.get('/list', (req, res) => {
  return res.json({
    success: true,
    samples: [
      {
        id: 'sample-a',
        name: 'Sample Certificate A (Original / Authentic)',
        filename: 'Sample_Certificate_A_Original.pdf',
        recipient: 'Arjun Kumar',
        certificateId: 'DEMO-CERT-1001',
        issuingInstitution: 'Example Technical Institute',
        certificateType: 'Web Development',
        issueDate: '15 August 2025',
        expectedResult: 'VERIFIED AS AUTHENTIC',
        description: 'Authentic certificate with matching recipient and institutional registry record.',
        downloadUrl: '/api/samples/download/sample-a'
      },
      {
        id: 'sample-b',
        name: 'Sample Certificate B (Fake / Altered Identity)',
        filename: 'Sample_Certificate_B_Altered.pdf',
        recipient: 'Priya Sharma',
        certificateId: 'DEMO-CERT-2002',
        issuingInstitution: 'Example Technical Institute',
        certificateType: 'Cybersecurity Fundamentals',
        issueDate: '15 August 2025',
        expectedResult: 'FLAGGED AS POTENTIALLY FAKE',
        description: 'Deliberately altered certificate where the recipient name was changed to Priya Sharma, while DEMO-CERT-2002 is registered to Vikram Malhotra.',
        downloadUrl: '/api/samples/download/sample-b'
      }
    ]
  });
});

/**
 * GET /api/samples/download/:type
 * Downloads the requested demonstration certificate PDF.
 */
router.get('/download/:type', (req, res) => {
  const { type } = req.params;
  let targetPath = null;
  let downloadFilename = null;

  if (type === 'sample-a') {
    targetPath = SAMPLE_A_PATH;
    downloadFilename = 'Sample_Certificate_A_Original_DEMO.pdf';
  } else if (type === 'sample-b') {
    targetPath = SAMPLE_B_PATH;
    downloadFilename = 'Sample_Certificate_B_Altered_DEMO.pdf';
  } else {
    return res.status(404).json({ success: false, message: 'Sample certificate not found.' });
  }

  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({ success: false, message: 'Sample file not yet generated.' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
  const fileStream = fs.createReadStream(targetPath);
  fileStream.pipe(res);
});

export default router;
