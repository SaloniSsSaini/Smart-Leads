import mongoose, { Document, Schema, Types } from 'mongoose';

export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'] as const;
export const LEAD_SOURCES = ['Website', 'Instagram', 'Referral'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface ILead extends Document {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  organizationId: Types.ObjectId;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  leadScore: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    status: { type: String, enum: LEAD_STATUSES, default: 'New' },
    source: { type: String, enum: LEAD_SOURCES, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    leadScore: { type: Number, default: 50, min: 0, max: 100 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

leadSchema.index({ organizationId: 1, deletedAt: 1, status: 1 });
leadSchema.index({ organizationId: 1, assignedTo: 1 });
leadSchema.index({ name: 'text', email: 'text' });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
