import mongoose, { Document, Schema } from 'mongoose';

export interface IWebhook extends Document {
  organizationId: Schema.Types.ObjectId;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: Date;
}

const webhookSchema = new Schema<IWebhook>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  url: { type: String, required: true },
  secret: { type: String, required: true },
  events: [{ type: String }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const Webhook = mongoose.model<IWebhook>('Webhook', webhookSchema);
