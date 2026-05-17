import { api } from '../../../lib/api';
import type { ApiResponse, Organization } from '../../../types';

export const orgApi = {
  list: () => api.get<ApiResponse<Organization[]>>('/organizations'),
  create: (name: string) => api.post<ApiResponse<unknown>>('/organizations', { name }),
};
