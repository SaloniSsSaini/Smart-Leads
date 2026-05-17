import { z } from 'zod';
import { LEAD_SOURCES, LEAD_STATUSES } from '../models/Lead.model';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  status: z.enum(LEAD_STATUSES).optional(),
  source: z.enum(LEAD_SOURCES),
  assignedTo: z.string().optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  assignedTo: z.string().optional(),
});

export const listLeadsQuerySchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  search: z.string().optional(),
  sort: z.enum(['latest', 'oldest']).optional().default('latest'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});

export const exportLeadsQuerySchema = listLeadsQuerySchema.omit({ page: true, limit: true });

export const leadIdParamSchema = z.object({
  id: z.string().min(1),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1),
  data: z.object({
    status: z.enum(LEAD_STATUSES).optional(),
    assignedTo: z.string().optional(),
  }),
});

export const importCsvSchema = z.object({
  csv: z.string().min(1),
});

export const noteBodySchema = z.object({
  body: z.string().min(1),
});
