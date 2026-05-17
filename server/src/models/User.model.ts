import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  locale: 'en' | 'hi';
  currentOrganizationId?: Schema.Types.ObjectId;
  onboardingDone: boolean;
  twoFactorEnabled: boolean;
  totpSecret?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    emailVerified: { type: Boolean, default: false },
    locale: { type: String, enum: ['en', 'hi'], default: 'en' },
    currentOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    onboardingDone: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    totpSecret: { type: String, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model<IUser>('User', userSchema);
