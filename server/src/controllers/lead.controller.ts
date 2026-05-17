import { Request, Response } from 'express';
import * as leadService from '../services/lead.service';
import { asyncHandler } from '../utils/asyncHandler';
import { leadsToCsv } from '../utils/csvExport';

const ctx = (req: Request) => ({
  orgId: req.user!.orgId,
  userId: req.user!.userId,
  role: req.user!.role,
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId } = ctx(req);
  const lead = await leadService.createLead(req.body, userId, orgId);
  res.status(201).json({ success: true, message: 'Lead created', data: lead });
});

export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId, role } = ctx(req);
  const result = await leadService.getLeads(orgId, req.query as leadService.ListLeadsQuery, userId, role);
  res.json({ success: true, message: 'Leads fetched', data: result.data, meta: result.meta });
});

export const getKanban = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId, role } = ctx(req);
  const data = await leadService.getKanban(orgId, userId, role);
  res.json({ success: true, data });
});

export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId, role } = ctx(req);
  const lead = await leadService.getLeadById(String(req.params.id), orgId, role, userId);
  res.json({ success: true, data: lead });
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId, role } = ctx(req);
  const lead = await leadService.updateLead(String(req.params.id), req.body, userId, orgId, role);
  res.json({ success: true, message: 'Lead updated', data: lead });
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId } = ctx(req);
  await leadService.softDeleteLead(String(req.params.id), userId, orgId);
  res.json({ success: true, message: 'Lead archived' });
});

export const restoreLead = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId } = ctx(req);
  const lead = await leadService.restoreLead(String(req.params.id), userId, orgId);
  res.json({ success: true, data: lead });
});

export const bulkUpdate = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId } = ctx(req);
  const result = await leadService.bulkUpdate(orgId, userId, req.body.ids, req.body.data);
  res.json({ success: true, data: result });
});

export const importCsv = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId } = ctx(req);
  const result = await leadService.importCsv(orgId, userId, req.body.csv);
  res.json({ success: true, data: result });
});

export const exportLeads = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId, role } = ctx(req);
  const leads = await leadService.exportLeads(orgId, req.query as leadService.ListLeadsQuery, userId, role);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
  res.send(leadsToCsv(leads));
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId, role } = ctx(req);
  const stats = await leadService.getLeadStats(orgId, userId, role);
  res.json({ success: true, data: stats });
});

export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = ctx(req);
  const activities = await leadService.getLeadActivities(String(req.params.id), orgId);
  res.json({ success: true, data: activities });
});

export const getArchived = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = ctx(req);
  const data = await leadService.getArchived(orgId);
  res.json({ success: true, data });
});
