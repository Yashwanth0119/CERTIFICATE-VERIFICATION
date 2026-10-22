import mongoose from 'mongoose';

const RegistrySchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    recipientName: { type: String, required: true },
    issuingInstitution: { type: String, required: true },
    certificateType: { type: String, required: true },
    issueDate: { type: String, required: true },
    status: { type: String, default: 'VALID' },
    accreditationCode: { type: String },
    credentialHash: { type: String },
    issuerAuthority: { type: String },
    issuerKeyFingerprint: { type: String },
    tamperProtectionEnabled: { type: Boolean, default: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const RegistryModel = mongoose.models.Registry || mongoose.model('Registry', RegistrySchema);
