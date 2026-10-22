import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { verifyCertificate } from '../services/verificationEngine.js';
import { generateVerificationReportPDF } from '../services/reportGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCANNER_UPLOADS_DIR = path.join(__dirname, '../../uploads/scanner');

if (!fs.existsSync(SCANNER_UPLOADS_DIR)) {
  fs.mkdirSync(SCANNER_UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, SCANNER_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `scan_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and image files are supported.'));
    }
  }
});

const router = express.Router();

/**
 * POST /api/verification/scan
 * Scanner endpoint - handles submitted certificates and direct HR uploads
 */
router.post('/scan', authenticateToken, requireRole('hr'), upload.single('directFile'), async (req, res) => {
  try {
    const { submissionId, targetCertId } = req.body;
    let targetFilePath = null;
    let targetFileName = null;
    let targetFileMime = null;
    let submission = null;
    let metadata = {};

    if (submissionId) {
      // Scanning an existing employee submission
      submission = db.getSubmissionById(submissionId);
      if (!submission) {
        return res.status(404).json({ success: false, message: 'Employee submission not found.' });
      }

      targetFilePath = submission.storedFilePath;
      targetFileName = submission.originalFilename;
      targetFileMime = submission.mimeType;
      metadata = {
        certificateId: submission.certificateId,
        recipientName: submission.employeeName,
        employeeName: submission.employeeName,
        issuingInstitution: submission.issuingInstitution,
        certificateType: submission.certificateType,
        issueDate: submission.issueDate
      };

      // Set submission status to Under Review during scanning
      db.updateSubmission(submission.id, { status: 'Under Review' });
    } else if (req.file) {
      // Standalone direct file upload by HR
      targetFilePath = req.file.path;
      targetFileName = req.file.originalname;
      targetFileMime = req.file.mimetype;
      metadata = {
        certificateId: targetCertId || null
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a submissionId to scan or upload a certificate file directly.'
      });
    }

    if (!targetFilePath || !fs.existsSync(targetFilePath)) {
      return res.status(400).json({
        success: false,
        message: 'Target certificate file could not be located on disk.'
      });
    }

    // Run Forensic Verification Engine
    const verificationResult = await verifyCertificate({
      filePath: targetFilePath,
      fileName: targetFileName,
      mimeType: targetFileMime,
      providedMetadata: metadata
    });

    // Create persistent Verification Record
    const verification = db.createVerification({
      submissionId: submission ? submission.id : null,
      isDirectUpload: !submission,
      certificateId: verificationResult.extractedData.certificateId || metadata.certificateId || 'N/A',
      employeeId: submission ? submission.employeeId : null,
      employeeName: submission ? submission.employeeName : null,
      employeeUsername: submission ? submission.employeeUsername : null,
      recipientName: verificationResult.extractedData.recipientName || (submission ? submission.employeeName : 'Unknown'),
      issuingInstitution: verificationResult.extractedData.issuingInstitution || (submission ? submission.issuingInstitution : 'Unknown'),
      certificateType: verificationResult.extractedData.certificateType || (submission ? submission.certificateType : 'Unknown'),
      targetFileName,
      targetFilePath,
      confidenceScore: verificationResult.confidenceScore,
      automatedResult: verificationResult.automatedResult,
      checksPassed: verificationResult.checksPassed,
      checksFailed: verificationResult.checksFailed,
      checks: verificationResult.checks,
      discrepancies: verificationResult.discrepancies,
      discrepancySummary: verificationResult.discrepancySummary,
      extractedData: verificationResult.extractedData,
      registryMatch: verificationResult.registryMatch,
      reviewerId: req.user.id,
      reviewerName: req.user.name,
      hrDecision: null,
      reviewNotes: null
    });

    // Link verification to submission
    if (submission) {
      const mappedStatus = verificationResult.automatedResult === 'VERIFIED AS AUTHENTIC'
        ? 'Verified as Authentic'
        : verificationResult.automatedResult === 'FLAGGED AS POTENTIALLY FAKE'
        ? 'Flagged as Potentially Fake'
        : 'Verification Inconclusive';

      db.updateSubmission(submission.id, {
        status: mappedStatus,
        verificationId: verification.id,
        verificationResult: verificationResult.automatedResult,
        verificationSummary: verificationResult.discrepancySummary
      });
    }

    db.logAction(
      req.user.id,
      'SCAN_COMPLETED',
      `HR Administrator ${req.user.username} scanned certificate "${targetFileName}" -> Result: ${verificationResult.automatedResult}`
    );

    return res.json({
      success: true,
      message: 'Certificate scan and forensic analysis completed successfully.',
      verification
    });
  } catch (err) {
    console.error('Scan error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Verification scan failed.'
    });
  }
});

/**
 * POST /api/verification/:id/decision
 * HR Administrator confirms or overrides verification decision with notes
 */
router.post('/:id/decision', authenticateToken, requireRole('hr'), (req, res) => {
  const { decision, notes } = req.body;
  const verification = db.getVerificationById(req.params.id);

  if (!verification) {
    return res.status(404).json({ success: false, message: 'Verification record not found.' });
  }

  const allowedDecisions = [
    'VERIFIED AS AUTHENTIC',
    'FLAGGED AS POTENTIALLY FAKE',
    'VERIFICATION INCONCLUSIVE'
  ];

  if (!decision || !allowedDecisions.includes(decision)) {
    return res.status(400).json({
      success: false,
      message: 'Decision must be one of: VERIFIED AS AUTHENTIC, FLAGGED AS POTENTIALLY FAKE, VERIFICATION INCONCLUSIVE.'
    });
  }

  const updatedVerification = db.updateVerification(verification.id, {
    hrDecision: decision,
    reviewNotes: notes || '',
    reviewerId: req.user.id,
    reviewerName: req.user.name
  });

  // If linked to an employee submission, synchronize the status
  if (verification.submissionId) {
    const mappedStatus = decision === 'VERIFIED AS AUTHENTIC'
      ? 'Verified as Authentic'
      : decision === 'FLAGGED AS POTENTIALLY FAKE'
      ? 'Flagged as Potentially Fake'
      : 'Verification Inconclusive';

    db.updateSubmission(verification.submissionId, {
      status: mappedStatus,
      verificationResult: decision,
      verificationSummary: notes || verification.discrepancySummary
    });
  }

  db.logAction(
    req.user.id,
    'DECISION_RECORDED',
    `HR Administrator ${req.user.username} recorded decision: ${decision} for verification ${verification.id}.`
  );

  return res.json({
    success: true,
    message: 'HR review decision successfully recorded and synchronized.',
    verification: updatedVerification
  });
});

/**
 * GET /api/verification/history
 * List of all completed forensic verifications for HR
 */
router.get('/history', authenticateToken, requireRole('hr'), (req, res) => {
  const history = db.getAllVerifications();
  return res.json({
    success: true,
    total: history.length,
    verifications: history
  });
});

/**
 * GET /api/verification/:id/report
 * Generates and downloads official PDF Verification Audit Report
 */
router.get('/:id/report', authenticateToken, (req, res) => {
  const verification = db.getVerificationById(req.params.id);
  if (!verification) {
    return res.status(404).json({ success: false, message: 'Verification record not found.' });
  }

  // Employees can only download report if it belongs to their own submission
  if (req.user.role === 'employee' && verification.employeeId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied to this verification report.' });
  }

  const filename = `Verification_Report_${verification.certificateId || 'CERT'}_${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  generateVerificationReportPDF(verification, res);
});

export default router;
