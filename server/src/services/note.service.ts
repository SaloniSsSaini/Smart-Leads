import { Note } from '../models/Note.model';
import { Lead } from '../models/Lead.model';
import { ApiError } from '../utils/ApiError';

export const addNote = async (leadId: string, orgId: string, userId: string, body: string) => {
  const lead = await Lead.findOne({ _id: leadId, organizationId: orgId, deletedAt: null });
  if (!lead) throw new ApiError(404, 'Lead not found');
  return Note.create({ leadId, userId, body });
};

export const getNotes = async (leadId: string, orgId: string) => {
  const lead = await Lead.findOne({ _id: leadId, organizationId: orgId });
  if (!lead) throw new ApiError(404, 'Lead not found');
  return Note.find({ leadId }).populate('userId', 'name email').sort({ createdAt: -1 }).lean();
};
