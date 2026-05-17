import mongoose, { Document, Schema } from 'mongoose';

export type TokenType = 'email_verify' | 'password_reset';

export interface IToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  type: TokenType;
  expiresAt: Date;
  createdAt: Date;
}

const tokenSchema = new Schema<IToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  type: { type: String, enum: ['email_verify', 'password_reset'], required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = mongoose.model<IToken>('Token', tokenSchema);
