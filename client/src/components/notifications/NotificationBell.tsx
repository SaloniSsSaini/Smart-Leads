import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../features/notifications/services/notificationApi';
import { getSocket } from '../../lib/socket';
import type { AppNotification } from '../../types';
import { toast } from 'sonner';

export const NotificationBell = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: count = 0 } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationApi.unreadCount().then((r) => r.data.data.count),
    refetchInterval: 30000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list().then((r) => r.data.data),
    enabled: open,
  });

  const markAll = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (n: AppNotification) => {
      toast(n.title, { description: n.message });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, [queryClient]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg border border-gray-300 p-2 dark:border-gray-600"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700">
              <span className="font-semibold">{t('notifications.title')}</span>
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-xs text-indigo-600 hover:underline"
              >
                {t('notifications.markAllRead')}
              </button>
            </div>
            <ul className="max-h-72 overflow-y-auto">
              {notifications.length === 0 && (
                <li className="p-4 text-center text-sm text-gray-500">{t('notifications.empty')}</li>
              )}
              {notifications.map((n) => (
                <li key={n.id ?? (n as { _id?: string })._id}>
                  <button
                    type="button"
                    className="w-full border-b border-gray-100 p-3 text-left hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                    onClick={() => {
                      setOpen(false);
                      if (n.link) navigate(n.link);
                    }}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
