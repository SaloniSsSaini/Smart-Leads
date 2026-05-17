import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  title: string;
  message: string;
  type: 'lead' | 'billing' | 'system';
  read: boolean;
  link?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['lead', 'billing', 'system'], default: 'system' },
    read: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
