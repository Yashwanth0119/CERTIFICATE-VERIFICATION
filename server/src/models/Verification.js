import mongoose from 'mongoose';

const VerificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    verificationTimestamp: { type: String, required: true },
    submissionId: { type: String, default: null },
    certificateId: { type: String, required: true },
    recipientName: { type: String, required: true },
    issuingInstitution: { type: String, required: true },
    certificateType: { type: String, required: true },
    extractedData: { type: mongoose.Schema.Types.Mixed, default: {} },
    registryMatch: { type: mongoose.Schema.Types.Mixed, default: null },
    checks: { type: mongoose.Schema.Types.Mixed, default: {} },
    analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
    confidenceScore: { type: Number, required: true },
    verdict: { type: String, required: true },
    summary: { type: String, required: true },
    findings: { type: [String], default: [] },
    hrDecision: { type: String, default: null },
    hrNotes: { type: String, default: null },
    verifiedBy: { type: String, default: null },
    verifiedAt: { type: String, default: null },
  },
  { timestamps: true }
);

export const VerificationModel = mongoose.models.Verification || mongoose.model('Verification', VerificationSchema);
