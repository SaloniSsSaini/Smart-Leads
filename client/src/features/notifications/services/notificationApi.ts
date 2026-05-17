import { api } from '../../../lib/api';
import type { ApiResponse, AppNotification } from '../../../types';

export const notificationApi = {
  list: () => api.get<ApiResponse<AppNotification[]>>('/notifications'),
  unreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
