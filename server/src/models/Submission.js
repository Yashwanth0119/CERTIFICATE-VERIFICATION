import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeUsername: { type: String, required: true },
    employeeName: { type: String, required: true },
    certificateTitle: { type: String, required: true },
    certificateType: { type: String, required: true },
    issuingInstitution: { type: String, required: true },
    certificateId: { type: String, required: true },
    issueDate: { type: String, required: true },
    originalFilename: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileHash: { type: String, required: true },
    submissionDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending Verification', 'Under Review', 'Verified - Authentic', 'Flagged - Potential Alteration', 'Inconclusive'],
      default: 'Pending Verification',
      index: true,
    },
    verificationId: { type: String, default: null },
    verificationResult: { type: mongoose.Schema.Types.Mixed, default: null },
    verificationSummary: { type: String, default: null },
  },
  { timestamps: true }
);

export const SubmissionModel = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
