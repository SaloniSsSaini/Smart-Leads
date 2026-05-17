import { FilterQuery, SortOrder } from 'mongoose';
import { parse } from 'csv-parse/sync';
import { Lead, ILead, LeadStatus, LeadSource } from '../models/Lead.model';
import { Activity } from '../models/Activity.model';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../types/express';
import { calculateLeadScore } from '../utils/leadScore';
import * as notificationService from './notification.service';
import * as auditService from './audit.service';
import * as webhookService from './webhook.service';

export interface ListLeadsQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: 'latest' | 'oldest';
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const buildLeadFilter = (
  orgId: string,
  query: ListLeadsQuery,
  userId?: string,
  role?: UserRole
): FilterQuery<ILead> => {
  const filter: FilterQuery<ILead> = { organizationId: orgId };

  if (!query.includeDeleted) filter.deletedAt = null;
  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.search) {
    const regex = { $regex: query.search, $options: 'i' };
    filter.$or = [{ name: regex }, { email: regex }];
  }

  if (role === 'sales' && userId) {
    const salesScope = { $or: [{ assignedTo: userId }, { createdBy: userId }] };
    const { $or: searchOr, ...rest } = filter;
    if (searchOr) {
      return { $and: [{ ...rest, deletedAt: filter.deletedAt }, salesScope, { $or: searchOr }] };
    }
    return { ...filter, ...salesScope };
  }

  return filter;
};

const getSort = (sort?: 'latest' | 'oldest'): Record<string, SortOrder> => ({
  createdAt: sort === 'oldest' ? 1 : -1,
});

const logActivity = async (
  leadId: string,
  userId: string,
  action: 'created' | 'updated' | 'deleted',
  details: string
): Promise<void> => {
  await Activity.create({ leadId, userId, action, details });
};

const notifyLeadEvent = async (
  userId: string,
  orgId: string,
  title: string,
  message: string,
  link: string
) => {
  await notificationService.createNotification({
    userId,
    organizationId: orgId,
    title,
    message,
    type: 'lead',
    link,
    broadcastToOrg: true,
  });
};

export const createLead = async (
  data: {
    name: string;
    email: string;
    status?: LeadStatus;
    source: LeadSource;
    assignedTo?: string;
  },
  userId: string,
  orgId: string
): Promise<ILead> => {
  const status = data.status ?? 'New';
  const score = calculateLeadScore(status, data.source, data.email);

  const lead = await Lead.create({
    ...data,
    status,
    organizationId: orgId,
    createdBy: userId,
    assignedTo: data.assignedTo || userId,
    leadScore: score,
    deletedAt: null,
  });

  await logActivity(lead._id.toString(), userId, 'created', `Lead "${lead.name}" was created`);
  await auditService.log(orgId, userId, 'create', 'lead', `Created lead ${lead.name}`, lead._id.toString());
  await webhookService.dispatch(orgId, 'lead.created', { id: lead._id, name: lead.name });
  await notifyLeadEvent(userId, orgId, 'New lead', `${lead.name} added`, `/leads/${lead._id}`);
  return lead;
};

export const getLeadById = async (id: string, orgId: string, role: UserRole, userId: string): Promise<ILead> => {
  const filter: FilterQuery<ILead> = { _id: id, organizationId: orgId, deletedAt: null };
  if (role === 'sales') {
    filter.$or = [{ assignedTo: userId }, { createdBy: userId }];
  }
  const lead = await Lead.findOne(filter)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');
  if (!lead) throw new ApiError(404, 'Lead not found');
  return lead;
};

export const getLeads = async (
  orgId: string,
  query: ListLeadsQuery,
  userId: string,
  role: UserRole
): Promise<{ data: ILead[]; meta: PaginationMeta }> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const filter = buildLeadFilter(orgId, query, userId, role);
  const sort = getSort(query.sort);

  const [leads, total] = await Promise.all([
    Lead.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Lead.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data: leads as unknown as ILead[],
    meta: { page, limit, total, totalPages, hasNext: page * limit < total, hasPrev: page > 1 },
  };
};

export const getKanban = async (orgId: string, userId: string, role: UserRole) => {
  const filter = buildLeadFilter(orgId, {}, userId, role);
  const leads = await Lead.find(filter).sort({ updatedAt: -1 }).lean();
  const columns: Record<LeadStatus, typeof leads> = {
    New: [],
    Contacted: [],
    Qualified: [],
    Lost: [],
  };
  for (const lead of leads) {
    columns[lead.status as LeadStatus].push(lead);
  }
  return columns;
};

export const updateLead = async (
  id: string,
  data: Partial<{
    name: string;
    email: string;
    status: LeadStatus;
    source: LeadSource;
    assignedTo: string;
  }>,
  userId: string,
  orgId: string,
  role: UserRole
): Promise<ILead> => {
  const lead = await Lead.findOne({ _id: id, organizationId: orgId, deletedAt: null });
  if (!lead) throw new ApiError(404, 'Lead not found');

  if (role === 'sales' && lead.createdBy.toString() !== userId && lead.assignedTo?.toString() !== userId) {
    throw new ApiError(403, 'You can only edit assigned or own leads');
  }

  Object.assign(lead, data);
  if (data.status || data.source || data.email) {
    lead.leadScore = calculateLeadScore(lead.status, lead.source, lead.email);
  }
  await lead.save();

  const changes = Object.keys(data).join(', ');
  await logActivity(id, userId, 'updated', `Updated: ${changes}`);
  await auditService.log(orgId, userId, 'update', 'lead', changes, id);
  await webhookService.dispatch(orgId, 'lead.updated', { id, changes });
  await notifyLeadEvent(userId, orgId, 'Lead updated', lead.name, `/leads/${id}`);
  return lead;
};

export const softDeleteLead = async (id: string, userId: string, orgId: string): Promise<void> => {
  const lead = await Lead.findOne({ _id: id, organizationId: orgId, deletedAt: null });
  if (!lead) throw new ApiError(404, 'Lead not found');
  lead.deletedAt = new Date();
  await lead.save();
  await auditService.log(orgId, userId, 'delete', 'lead', `Archived ${lead.name}`, id);
  await webhookService.dispatch(orgId, 'lead.deleted', { id });
};

export const restoreLead = async (id: string, userId: string, orgId: string): Promise<ILead> => {
  const lead = await Lead.findOne({ _id: id, organizationId: orgId });
  if (!lead) throw new ApiError(404, 'Lead not found');
  lead.deletedAt = null;
  await lead.save();
  await auditService.log(orgId, userId, 'restore', 'lead', `Restored ${lead.name}`, id);
  return lead;
};

export const deleteLead = async (id: string, userId: string, orgId: string): Promise<void> => {
  await softDeleteLead(id, userId, orgId);
};

export const bulkUpdate = async (
  orgId: string,
  userId: string,
  ids: string[],
  data: { status?: LeadStatus; assignedTo?: string }
) => {
  const result = await Lead.updateMany(
    { _id: { $in: ids }, organizationId: orgId, deletedAt: null },
    { $set: data }
  );
  await auditService.log(orgId, userId, 'bulk_update', 'lead', `Updated ${result.modifiedCount} leads`);
  return { modified: result.modifiedCount };
};

export const importCsv = async (orgId: string, userId: string, csvContent: string) => {
  const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
  let imported = 0;
  for (const row of records) {
    const name = row.name || row.Name;
    const email = row.email || row.Email;
    const source = (row.source || row.Source || 'Website') as LeadSource;
    if (!name || !email) continue;
    if (!['Website', 'Instagram', 'Referral'].includes(source)) continue;
    await createLead({ name, email, source }, userId, orgId);
    imported++;
  }
  await auditService.log(orgId, userId, 'import', 'lead', `Imported ${imported} leads from CSV`);
  return { imported };
};

export const exportLeads = async (
  orgId: string,
  query: ListLeadsQuery,
  userId: string,
  role: UserRole
): Promise<ILead[]> => {
  const filter = buildLeadFilter(orgId, query, userId, role);
  const leads = await Lead.find(filter).sort(getSort(query.sort)).lean();
  return leads as unknown as ILead[];
};

export const getLeadStats = async (orgId: string, userId: string, role: UserRole) => {
  const match = buildLeadFilter(orgId, {}, userId, role);
  const [statusStats, sourceStats, total] = await Promise.all([
    Lead.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $match: match }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
    Lead.countDocuments(match),
  ]);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const [thisWeek, lastWeek] = await Promise.all([
    Lead.countDocuments({ ...match, createdAt: { $gte: weekAgo } }),
    Lead.countDocuments({ ...match, createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
  ]);

  return {
    total,
    byStatus: statusStats.map((s) => ({ status: s._id, count: s.count })),
    bySource: sourceStats.map((s) => ({ source: s._id, count: s.count })),
    weekComparison: { thisWeek, lastWeek, change: thisWeek - lastWeek },
    funnel: statusStats.map((s) => ({ stage: s._id, count: s.count })),
  };
};

export const globalSearch = async (orgId: string, q: string, userId: string, role: UserRole) => {
  const filter = buildLeadFilter(orgId, { search: q, limit: 10 }, userId, role);
  return Lead.find(filter).limit(10).select('name email status').lean();
};

export const getLeadActivities = async (leadId: string, orgId: string) => {
  const lead = await Lead.findOne({ _id: leadId, organizationId: orgId });
  if (!lead) throw new ApiError(404, 'Lead not found');
  return Activity.find({ leadId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();
};

export const getArchived = async (orgId: string) =>
  Lead.find({ organizationId: orgId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }).lean();
