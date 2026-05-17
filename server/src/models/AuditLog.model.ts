import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  organizationId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  createdAt: Date;
}

const auditSchema = new Schema<IAuditLog>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: String,
    details: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditSchema.index({ organizationId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditSchema);
