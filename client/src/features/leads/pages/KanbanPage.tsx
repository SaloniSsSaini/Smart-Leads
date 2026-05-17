import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { leadsApi } from '../services/leadsApi';
import { Header } from '../../../components/layout/Header';
import { Spinner } from '../../../components/feedback/Spinner';
import { STATUS_COLORS } from '../../../constants';
import { cn } from '../../../lib/utils';
import type { Lead, LeadStatus } from '../../../types';
import { toast } from 'sonner';

const COLUMNS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];

export const KanbanPage = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const queryClient = useQueryClient();
  const [dragId, setDragId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['kanban'],
    queryFn: () => leadsApi.kanban().then((r) => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => leadsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const onDrop = (status: LeadStatus) => {
    if (!dragId) return;
    updateMutation.mutate({ id: dragId, status });
    toast.success(`Moved to ${status}`);
    setDragId(null);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <Header title="Kanban Board" subtitle="Drag leads between stages" onMenuClick={openSidebar} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((status) => (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(status)}
            className="min-h-[400px] rounded-xl border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-900/50"
          >
            <h3 className={cn('mb-3 rounded-lg px-2 py-1 text-sm font-semibold', STATUS_COLORS[status])}>
              {status} ({((data?.[status] as Lead[]) ?? []).length})
            </h3>
            <div className="space-y-2">
              {((data?.[status] as Lead[]) ?? []).map((lead) => (
                <div
                  key={lead._id}
                  draggable
                  onDragStart={() => setDragId(lead._id)}
                  className="cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <Link to={`/leads/${lead._id}`} className="font-medium text-indigo-600 hover:underline">
                    {lead.name}
                  </Link>
                  <p className="text-xs text-gray-500">{lead.email}</p>
                  <p className="mt-1 text-xs text-gray-400">Score: {lead.leadScore ?? 50}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
