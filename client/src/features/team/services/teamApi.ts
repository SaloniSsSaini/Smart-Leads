import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../types';

export const teamApi = {
  invites: () => api.get<ApiResponse<unknown[]>>('/invites'),
  invite: (email: string, role: 'admin' | 'sales' = 'sales') =>
    api.post('/invites', { email, role }),
  audit: () => api.get<ApiResponse<unknown[]>>('/audit'),
  settings: () => api.get<ApiResponse<{ branding: { primaryColor?: string; displayName?: string }; name: string }>>('/settings'),
  updateBranding: (branding: { primaryColor?: string; displayName?: string; logoUrl?: string }) =>
    api.patch('/settings/branding', branding),
  team: () => api.get<ApiResponse<unknown[]>>('/settings/team'),
  webhooks: () => api.get<ApiResponse<unknown[]>>('/webhooks'),
  createWebhook: (url: string, events: string[]) => api.post('/webhooks', { url, events }),
  deleteWebhook: (id: string) => api.delete(`/webhooks/${id}`),
  setup2FA: () => api.post<ApiResponse<{ qrCode: string }>>('/auth/2fa/setup'),
  verify2FA: (token: string) => api.post('/auth/2fa/verify', { token }),
};
