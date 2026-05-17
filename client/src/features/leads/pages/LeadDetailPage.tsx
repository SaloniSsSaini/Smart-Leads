import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { leadsApi } from '../services/leadsApi';
import { teamApi } from '../../team/services/teamApi';
import { LeadForm } from '../components/LeadForm';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/feedback/Spinner';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import { useAuth } from '../../../app/authContext';
import { STATUS_COLORS } from '../../../constants';
import { formatDate, cn } from '../../../lib/utils';
import { toast } from 'sonner';

export const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [noteBody, setNoteBody] = useState('');

  const { data: lead, isLoading, error, refetch } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getById(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', id],
    queryFn: () => leadsApi.activities(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: notes } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => leadsApi.notes.list(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: team } = useQuery({
    queryKey: ['team'],
    queryFn: () => teamApi.team().then((r) => r.data.data),
    enabled: user?.role === 'admin',
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof leadsApi.update>[1]) => leadsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Lead updated');
    },
  });

  const noteMutation = useMutation({
    mutationFn: () => leadsApi.notes.create(id!, noteBody),
    onSuccess: () => {
      setNoteBody('');
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
      toast.success('Note added');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => leadsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      navigate('/leads');
    },
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message="Lead not found" onRetry={() => refetch()} />;
  if (!lead) return null;

  const assignedName = typeof lead.assignedTo === 'object' ? lead.assignedTo?.name : undefined;

  return (
    <div>
      <Link to="/leads" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-gray-500">{lead.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className={cn(STATUS_COLORS[lead.status])}>{lead.status}</Badge>
            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{lead.source}</Badge>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              Score: {lead.leadScore ?? 50}
            </Badge>
          </div>
          {assignedName && <p className="mt-2 text-sm text-gray-500">Assigned to {assignedName}</p>}
          <p className="mt-2 text-xs text-gray-400">Created {formatDate(lead.createdAt)}</p>
        </div>
        {user?.role === 'admin' && (
          <Button
            variant="danger"
            size="sm"
            loading={deleteMutation.isPending}
            onClick={() => {
              if (confirm('Archive this lead?')) deleteMutation.mutate();
            }}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      {user?.role === 'admin' && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <label className="mb-1 block text-sm font-medium">Assign to</label>
          <select
            className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm dark:bg-gray-900"
            value={typeof lead.assignedTo === 'object' ? lead.assignedTo?._id : lead.assignedTo ?? ''}
            onChange={(e) => updateMutation.mutate({ assignedTo: e.target.value || undefined })}
          >
            <option value="">Unassigned</option>
            {(team as { userId?: { _id: string; name: string } }[])?.map((m) => (
              <option key={m.userId?._id} value={m.userId?._id}>{m.userId?.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 font-semibold">Edit Lead</h2>
          <LeadForm defaultValues={lead} onSubmit={(d) => updateMutation.mutate(d)} loading={updateMutation.isPending} submitLabel="Update" />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 font-semibold">Notes</h2>
            <div className="mb-3 flex gap-2">
              <Input placeholder="Add a note…" value={noteBody} onChange={(e) => setNoteBody(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={() => noteMutation.mutate()} disabled={!noteBody.trim()} loading={noteMutation.isPending}>
                Add
              </Button>
            </div>
            <ul className="space-y-2">
              {notes?.map((n) => (
                <li key={n._id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                  <p>{n.body}</p>
                  <p className="text-xs text-gray-400">{n.userId?.name} · {formatDate(n.createdAt)}</p>
                </li>
              ))}
              {!notes?.length && <p className="text-sm text-gray-500">No notes yet</p>}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 font-semibold">Timeline</h2>
            {!activities?.length && <p className="text-sm text-gray-500">No activity yet</p>}
            <ul className="relative space-y-4 border-l-2 border-indigo-200 pl-4 dark:border-indigo-800">
              {activities?.map((a) => (
                <li key={a._id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-indigo-500" />
                  <p className="text-sm">{a.details}</p>
                  <p className="text-xs text-gray-400">{a.userId?.name} · {formatDate(a.createdAt)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
