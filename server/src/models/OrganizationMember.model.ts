import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types/express';

export interface IOrganizationMember extends Document {
  userId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  role: UserRole;
  permissions: string[];
  createdAt: Date;
}

const memberSchema = new Schema<IOrganizationMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    role: { type: String, enum: ['admin', 'sales'], default: 'sales' },
    permissions: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

memberSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

export const OrganizationMember = mongoose.model<IOrganizationMember>(
  'OrganizationMember',
  memberSchema
);
