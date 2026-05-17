import { api } from '../../../lib/api';
import type { ApiResponse, PlanInfo, PlanType } from '../../../types';

export const billingApi = {
  plans: () => api.get<ApiResponse<Record<PlanType, PlanInfo>>>('/billing/plans'),
  subscription: () => api.get<ApiResponse<PlanInfo & { plan: PlanType }>>('/billing/subscription'),
  checkout: (plan: 'pro' | 'enterprise') =>
    api.post<ApiResponse<{ success: boolean; plan: PlanType; message: string; url?: string | null; mock?: boolean }>>(
      '/billing/checkout',
      { plan }
    ),
};
