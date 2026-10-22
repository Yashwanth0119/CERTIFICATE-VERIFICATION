import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `cert_${uniqueSuffix}${ext}`);
  }
});

// File validation: PDF, JPG, JPEG, PNG, max 15MB
const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, JPEG, and PNG files are supported.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter
});

const router = express.Router();

/**
 * POST /api/submissions
 * Employee uploads and submits a certificate for verification
 */
router.post('/', authenticateToken, upload.single('certificateFile'), (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Only employee accounts can submit certificates.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Certificate document file is required (PDF, JPG, JPEG, PNG).'
      });
    }

    const {
      certificateTitle,
      certificateType,
      issuingInstitution,
      issueDate,
      certificateId
    } = req.body;

    if (!certificateTitle || !certificateType || !issuingInstitution) {
      // Clean up uploaded file if validation fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Certificate Title, Certificate Type, and Issuing Institution are required fields.'
      });
    }

    // Auto-generate or format Certificate ID
    const assignedCertId = certificateId && certificateId.trim().length > 0
      ? certificateId.trim().toUpperCase()
      : `CERT-${Date.now().toString().slice(-6)}`;

    // Create persistent submission record
    const submission = db.createSubmission({
      certificateId: assignedCertId,
      certificateTitle: certificateTitle.trim(),
      certificateType: certificateType.trim(),
      issuingInstitution: issuingInstitution.trim(),
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      employeeId: req.user.id,
      employeeName: req.user.name,
      employeeUsername: req.user.username,
      employeeDepartment: req.user.department,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      storedFilePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'Pending Verification'
    });

    db.logAction(
      req.user.id,
      'CERTIFICATE_SUBMITTED',
      `Employee ${req.user.username} submitted certificate "${certificateTitle}" (ID: ${assignedCertId}).`
    );

    return res.status(201).json({
      success: true,
      message: 'Certificate submitted successfully and routed to HR for verification.',
      submission
    });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit certificate.'
    });
  }
});

/**
 * GET /api/submissions
 * Returns submissions scoped strictly by role:
 * - Employees: ONLY their own submissions.
 * - HR: ALL submissions from both employees.
 */
router.get('/', authenticateToken, (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  if (req.user.role === 'employee') {
    filter.employeeId = req.user.id;
  }

  const submissions = db.getSubmissions(filter);

  // Compute summary metrics
  const total = submissions.length;
  const pending = submissions.filter((s) => s.status === 'Pending Verification').length;
  const underReview = submissions.filter((s) => s.status === 'Under Review').length;
  const verified = submissions.filter((s) => s.status === 'Verified as Authentic').length;
  const flagged = submissions.filter((s) => s.status === 'Flagged as Potentially Fake').length;

  return res.json({
    success: true,
    stats: {
      total,
      pending,
      underReview,
      verified,
      flagged
    },
    submissions
  });
});

/**
 * GET /api/submissions/:id
 * Retrieve a specific submission
 */
router.get('/:id', authenticateToken, (req, res) => {
  const submission = db.getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found.' });
  }

  // Strict access rule: employee can only view their own
  if (req.user.role === 'employee' && submission.employeeId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to view this submission.' });
  }

  const verification = submission.verificationId
    ? db.getVerificationById(submission.verificationId)
    : null;

  return res.json({
    success: true,
    submission,
    verification
  });
});

/**
 * DELETE /api/submissions/:id
 * Delete submission (CRUD Delete operation)
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const submission = db.getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found.' });
  }

  if (req.user.role === 'employee' && submission.employeeId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this submission.' });
  }

  // Delete physical file if exists
  if (submission.storedFilePath && fs.existsSync(submission.storedFilePath)) {
    try {
      fs.unlinkSync(submission.storedFilePath);
    } catch (e) {
      console.warn('Could not unlink file:', e.message);
    }
  }

  db.deleteSubmission(req.params.id);
  db.logAction(
    req.user.id,
    'SUBMISSION_DELETED',
    `Submission ${req.params.id} (${submission.certificateTitle}) was deleted by ${req.user.username}.`
  );

  return res.json({
    success: true,
    message: 'Submission successfully deleted.'
  });
});

/**
 * GET /api/submissions/:id/file
 * Secure file stream for viewing certificate
 */
router.get('/:id/file', authenticateToken, (req, res) => {
  const submission = db.getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found.' });
  }

  if (req.user.role === 'employee' && submission.employeeId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const filePath = submission.storedFilePath;
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Certificate file missing on disk.' });
  }

  res.setHeader('Content-Type', submission.mimeType || 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${submission.originalFilename || 'certificate.pdf'}"`);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

export default router;
