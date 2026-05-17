import { api } from '../../../lib/api';
import type { ApiResponse, AuthData, User } from '../../../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; orgName?: string }) =>
    api.post<ApiResponse<AuthData & { message?: string }>>('/auth/register', data),

  login: (data: { email: string; password: string; totpToken?: string }) =>
    api.post<ApiResponse<AuthData>>('/auth/login', data),

  me: () => api.get<ApiResponse<AuthData>>('/auth/me'),

  verifyEmail: (token: string) =>
    api.get<ApiResponse<{ message: string }>>('/auth/verify-email', { params: { token } }),

  resendVerification: (email: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/resend-verification', { email }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post<ApiResponse<{ message: string }>>('/auth/reset-password', data),

  switchOrg: (orgId: string) =>
    api.post<ApiResponse<AuthData>>('/auth/switch-org', { orgId }),

  updateProfile: (data: { locale?: 'en' | 'hi'; onboardingDone?: boolean }) =>
    api.patch<ApiResponse<Partial<User>>>('/auth/profile', data),
};
