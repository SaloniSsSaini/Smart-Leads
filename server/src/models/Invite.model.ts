import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types/express';

export interface IInvite extends Document {
  email: string;
  organizationId: Schema.Types.ObjectId;
  role: UserRole;
  token: string;
  invitedBy: Schema.Types.ObjectId;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

const inviteSchema = new Schema<IInvite>({
  email: { type: String, required: true, lowercase: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  role: { type: String, enum: ['admin', 'sales'], default: 'sales' },
  token: { type: String, required: true, unique: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  acceptedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export const Invite = mongoose.model<IInvite>('Invite', inviteSchema);
