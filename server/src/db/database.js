import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state with demo accounts and registry
const getInitialData = () => {
  const salt = bcrypt.genSaltSync(10);
  return {
    users: [
      {
        id: 'usr_emp1',
        username: 'employee1',
        passwordHash: bcrypt.hashSync('Emp@12345', salt),
        role: 'employee',
        name: 'Arjun Kumar',
        email: 'arjun.kumar@acme-corp.internal',
        department: 'Software Engineering',
        createdAt: '2025-01-10T08:00:00Z'
      },
      {
        id: 'usr_emp2',
        username: 'employee2',
        passwordHash: bcrypt.hashSync('Emp@12345', salt),
        role: 'employee',
        name: 'Priya Sharma',
        email: 'priya.sharma@acme-corp.internal',
        department: 'Cybersecurity Operations',
        createdAt: '2025-01-10T08:30:00Z'
      },
      {
        id: 'usr_hradmin',
        username: 'hradmin',
        passwordHash: bcrypt.hashSync('HR@12345', salt),
        role: 'hr',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@acme-corp.internal',
        department: 'Human Resources & Talent Compliance',
        createdAt: '2025-01-01T09:00:00Z'
      }
    ],
    // The controlled Demonstration Certificate Registry
    registry: [
      {
        certificateId: 'DEMO-CERT-1001',
        recipientName: 'Arjun Kumar',
        issuingInstitution: 'Example Technical Institute',
        certificateType: 'Web Development',
        issueDate: '15 August 2025',
        status: 'VALID',
        accreditationCode: 'ETI-ACCRED-2025-998',
        credentialHash: 'sha256-8a7f9e2b1c4d0a9f538e1b6a7c8d9e0f',
        issuerAuthority: 'Example Technical Institute Board of Certifications',
        issuerKeyFingerprint: '9B:4E:A2:71:08:92:DF:5C:30',
        tamperProtectionEnabled: true,
        remarks: 'Official registered certificate record. Fully verified and accredited.'
      },
      {
        certificateId: 'DEMO-CERT-2002',
        recipientName: 'Vikram Malhotra',
        issuingInstitution: 'Example Technical Institute',
        certificateType: 'Cybersecurity Fundamentals',
        issueDate: '15 August 2025',
        status: 'VALID',
        accreditationCode: 'ETI-ACCRED-2025-442',
        credentialHash: 'sha256-4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f',
        issuerAuthority: 'Example Technical Institute Board of Certifications',
        issuerKeyFingerprint: '9B:4E:A2:71:08:92:DF:5C:30',
        tamperProtectionEnabled: true,
        remarks: 'Official institutional registry record. Recipient on record: Vikram Malhotra.'
      },
      {
        certificateId: 'DEMO-CERT-3003',
        recipientName: 'Rohan Verma',
        issuingInstitution: 'National Cloud Computing Academy',
        certificateType: 'Cloud Architecture & DevOps',
        issueDate: '10 September 2025',
        status: 'VALID',
        accreditationCode: 'NCCA-2025-771',
        credentialHash: 'sha256-11223344556677889900aabbccddeeff',
        issuerAuthority: 'National Cloud Computing Academy Registrar',
        issuerKeyFingerprint: '7A:3F:B1:88:99:AA:BB:CC:DD',
        tamperProtectionEnabled: true,
        remarks: 'Official registered record for Cloud Architecture credentials.'
      }
    ],
    submissions: [],
    verifications: [],
    auditLogs: []
  };
};

class JSONDatabase {
  constructor() {
    this.filePath = DB_FILE;
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure required arrays exist
        parsed.users = parsed.users || [];
        parsed.registry = parsed.registry || [];
        parsed.submissions = parsed.submissions || [];
        parsed.verifications = parsed.verifications || [];
        parsed.auditLogs = parsed.auditLogs || [];
        return parsed;
      }
    } catch (err) {
      console.error('Error reading database file, initializing fresh:', err.message);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  save(data = this.data) {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error('Error saving database:', err.message);
    }
  }

  // User operations
  getUserByUsername(username) {
    return this.data.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim()
    );
  }

  getUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }

  getAllUsers() {
    return this.data.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  // Registry operations
  getRegistryRecord(certificateId) {
    if (!certificateId) return null;
    const cleanId = certificateId.trim().toUpperCase();
    return this.data.registry.find(
      (r) => r.certificateId.toUpperCase() === cleanId
    );
  }

  getAllRegistryRecords() {
    return this.data.registry;
  }

  // Submissions operations
  createSubmission(submissionData) {
    const submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      submissionDate: new Date().toISOString(),
      status: 'Pending Verification',
      verificationId: null,
      verificationResult: null,
      verificationSummary: null,
      ...submissionData
    };
    this.data.submissions.unshift(submission);
    this.save();
    return submission;
  }

  getSubmissions(filter = {}) {
    let result = [...this.data.submissions];
    if (filter.employeeId) {
      result = result.filter((s) => s.employeeId === filter.employeeId);
    }
    if (filter.status) {
      result = result.filter((s) => s.status === filter.status);
    }
    return result;
  }

  getSubmissionById(id) {
    return this.data.submissions.find((s) => s.id === id);
  }

  updateSubmission(id, updates) {
    const index = this.data.submissions.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.data.submissions[index] = {
      ...this.data.submissions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.submissions[index];
  }

  deleteSubmission(id) {
    const index = this.data.submissions.findIndex((s) => s.id === id);
    if (index === -1) return false;
    const deleted = this.data.submissions.splice(index, 1);
    this.save();
    return deleted[0];
  }

  // Verifications operations
  createVerification(record) {
    const verification = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      hrDecision: null,
      reviewNotes: null,
      reviewerId: null,
      reviewerName: null,
      ...record
    };
    this.data.verifications.unshift(verification);
    this.save();
    return verification;
  }

  getVerificationById(id) {
    return this.data.verifications.find((v) => v.id === id);
  }

  getVerificationBySubmissionId(submissionId) {
    return this.data.verifications.find((v) => v.submissionId === submissionId);
  }

  updateVerification(id, updates) {
    const index = this.data.verifications.findIndex((v) => v.id === id);
    if (index === -1) return null;
    this.data.verifications[index] = {
      ...this.data.verifications[index],
      ...updates,
      reviewedAt: new Date().toISOString()
    };
    this.save();
    return this.data.verifications[index];
  }

  getAllVerifications() {
    return this.data.verifications;
  }

  // Audit Logs
  logAction(userId, action, details) {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return log;
  }

  getAuditLogs() {
    return this.data.auditLogs;
  }
}

export const db = new JSONDatabase();
