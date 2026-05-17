import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment extends Document {
  leadId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  uploadedBy: Schema.Types.ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: String,
    size: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Attachment = mongoose.model<IAttachment>('Attachment', attachmentSchema);
