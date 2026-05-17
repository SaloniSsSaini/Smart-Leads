import mongoose, { Document, Schema, Types } from 'mongoose';

export type ActivityAction = 'created' | 'updated' | 'deleted';

export interface IActivity extends Document {
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  action: ActivityAction;
  details: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['created', 'updated', 'deleted'], required: true },
    details: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ leadId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
