import { api } from '../../../lib/api';
import type { ApiResponse, Lead, LeadStats, LeadsQuery, Activity, LeadStatus } from '../../../types';

export const leadsApi = {
  list: (params: LeadsQuery) => api.get<ApiResponse<Lead[]>>('/leads', { params }),
  kanban: () => api.get<ApiResponse<Record<LeadStatus, Lead[]>>>('/leads/kanban'),
  getById: (id: string) => api.get<ApiResponse<Lead>>(`/leads/${id}`),
  create: (data: Partial<Lead>) => api.post<ApiResponse<Lead>>('/leads', data),
  update: (id: string, data: Partial<Lead>) => api.patch<ApiResponse<Lead>>(`/leads/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/leads/${id}`),
  restore: (id: string) => api.patch<ApiResponse<Lead>>(`/leads/${id}/restore`),
  bulk: (ids: string[], data: { status?: string; assignedTo?: string }) =>
    api.post<ApiResponse<{ modified: number }>>('/leads/bulk', { ids, data }),
  importCsv: (csv: string) => api.post<ApiResponse<{ imported: number }>>('/leads/import', { csv }),
  stats: () => api.get<ApiResponse<LeadStats>>('/leads/stats'),
  activities: (id: string) => api.get<ApiResponse<Activity[]>>(`/leads/${id}/activities`),
  notes: {
    list: (id: string) => api.get<ApiResponse<{ _id: string; body: string; createdAt: string; userId: { name: string } }[]>>(`/leads/${id}/notes`),
    create: (id: string, body: string) => api.post(`/leads/${id}/notes`, { body }),
  },
  exportCsv: (params: LeadsQuery) => api.get('/leads/export', { params, responseType: 'blob' }),
};

export const searchApi = {
  global: (q: string) => api.get<ApiResponse<Lead[]>>('/search', { params: { q } }),
};
