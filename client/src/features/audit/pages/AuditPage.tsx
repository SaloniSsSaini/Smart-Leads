import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { teamApi } from '../../team/services/teamApi';
import { Header } from '../../../components/layout/Header';
import { Spinner } from '../../../components/feedback/Spinner';
import { formatDate } from '../../../lib/utils';

export const AuditPage = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();

  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => teamApi.audit().then((r) => r.data.data),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <Header title="Audit log" subtitle="Organization activity history (admin)" onMenuClick={openSidebar} />
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <ul className="divide-y dark:divide-gray-800">
          {(data as { action: string; entity: string; details: string; createdAt: string; userId?: { name: string } }[])?.map((log, i) => (
            <li key={i} className="px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium capitalize">{log.action} · {log.entity}</span>
                <span className="text-gray-400">{formatDate(log.createdAt)}</span>
              </div>
              <p className="text-gray-500">{log.details}</p>
              <p className="text-xs text-gray-400">by {log.userId?.name ?? 'System'}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
