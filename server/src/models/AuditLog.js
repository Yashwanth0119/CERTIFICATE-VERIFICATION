import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    timestamp: { type: String, required: true },
    action: { type: String, required: true },
    userId: { type: String, default: null },
    username: { type: String, default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  { timestamps: true }
);

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
