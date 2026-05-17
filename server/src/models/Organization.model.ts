import mongoose, { Document, Schema } from 'mongoose';

export type PlanType = 'free' | 'pro' | 'enterprise';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  plan: PlanType;
  ownerId: Schema.Types.ObjectId;
  stripeCustomerId?: string;
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
    displayName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orgSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stripeCustomerId: String,
    branding: {
      primaryColor: { type: String, default: '#4F46E5' },
      logoUrl: String,
      displayName: String,
    },
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>('Organization', orgSchema);
