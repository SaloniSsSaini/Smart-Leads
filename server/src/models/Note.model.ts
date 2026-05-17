import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  leadId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  body: string;
  createdAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

noteSchema.index({ leadId: 1, createdAt: -1 });

export const Note = mongoose.model<INote>('Note', noteSchema);
