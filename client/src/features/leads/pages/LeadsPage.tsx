import { useState, useMemo, useRef } from 'react';
import { useSearchParams, Link, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Download, Upload } from 'lucide-react';
import { Header } from '../../../components/layout/Header';
import { leadsApi } from '../services/leadsApi';
import { teamApi } from '../../team/services/teamApi';
import { useDebounce } from '../hooks/useDebounce';
import { LeadFilters } from '../components/LeadFilters';
import { Pagination } from '../components/Pagination';
import { LeadForm } from '../components/LeadForm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/feedback/Spinner';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import { STATUS_COLORS } from '../../../constants';
import { formatDate, cn } from '../../../lib/utils';
import { useAuth } from '../../../app/authContext';
import type { LeadStatus, LeadsQuery } from '../../../types';

export const LeadsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<LeadStatus>('Contacted');
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(searchInput);

  const filters: LeadsQuery = useMemo(
    () => ({
      status: (searchParams.get('status') as LeadsQuery['status']) || undefined,
      source: (searchParams.get('source') as LeadsQuery['source']) || undefined,
      search: debouncedSearch || undefined,
      sort: (searchParams.get('sort') as 'latest' | 'oldest') || 'latest',
      page: Number(searchParams.get('page')) || 1,
    }),
    [searchParams, debouncedSearch]
  );

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    if (!updates.page) next.set('page', '1');
    setSearchParams(next);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsApi.list(filters).then((r) => r.data),
  });

  const { data: team } = useQuery({
    queryKey: ['team'],
    queryFn: () => teamApi.team().then((r) => r.data.data),
    enabled: user?.role === 'admin',
  });

  const createMutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setModalOpen(false);
      toast.success('Lead created');
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (payload: { ids: string[]; status?: string; assignedTo?: string }) =>
      leadsApi.bulk(payload.ids, { status: payload.status, assignedTo: payload.assignedTo }),
    onSuccess: (res) => {
      toast.success(`Updated ${res.data.data.modified} leads`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const importMutation = useMutation({
    mutationFn: (csv: string) => leadsApi.importCsv(csv),
    onSuccess: (res) => {
      toast.success(`Imported ${res.data.data.imported} leads`);
      setImportOpen(false);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: () => toast.error('Import failed — check CSV format'),
  });

  const toggleAll = () => {
    if (!data?.data.length) return;
    if (selected.size === data.data.length) setSelected(new Set());
    else setSelected(new Set(data.data.map((l) => l._id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleExport = async () => {
    const { status, source, search, sort } = filters;
    const res = await leadsApi.exportCsv({ status, source, search, sort });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => importMutation.mutate(String(reader.result));
    reader.readAsText(file);
  };

  const ids = [...selected];

  return (
    <div>
      <Header
        title={t('leads.title')}
        subtitle={t('leads.subtitle')}
        onMenuClick={openSidebar}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t('leads.export')}
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('leads.addLead')}
            </Button>
          </div>
        }
      />

      {ids.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-950/40">
          <span className="text-sm font-medium">{ids.length} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as LeadStatus)}
            className="rounded-lg border px-2 py-1 text-sm dark:bg-gray-900"
          >
            {(['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button size="sm" onClick={() => bulkMutation.mutate({ ids, status: bulkStatus })} loading={bulkMutation.isPending}>
            Update status
          </Button>
          {user?.role === 'admin' && (
            <select
              className="rounded-lg border px-2 py-1 text-sm dark:bg-gray-900"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) bulkMutation.mutate({ ids, assignedTo: e.target.value });
              }}
            >
              <option value="">Assign to…</option>
              {(team as { userId?: { _id: string; name: string } }[])?.map((m) => (
                <option key={m.userId?._id} value={m.userId?._id}>{m.userId?.name}</option>
              ))}
            </select>
          )}
          <Button variant="secondary" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <LeadFilters
          filters={filters}
          searchInput={searchInput}
          onSearchChange={(v) => {
            setSearchInput(v);
            updateParams({ search: v || undefined });
          }}
          onFilterChange={(key, value) => updateParams({ [key]: value || undefined })}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading && <Spinner />}
        {error && <ErrorAlert message="Failed to load leads" onRetry={() => refetch()} />}
        {!isLoading && !error && data?.data.length === 0 && (
          <EmptyState
            title="No leads found"
            description="Try adjusting filters or create a new lead"
            actionLabel="Add Lead"
            onAction={() => setModalOpen(true)}
          />
        )}
        {!isLoading && !error && data && data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3">
                      <input type="checkbox" checked={selected.size === data.data.length} onChange={toggleAll} aria-label="Select all" />
                    </th>
                    {['Name', 'Email', 'Status', 'Score', 'Source', 'Created'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((lead) => (
                    <tr key={lead._id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(lead._id)} onChange={() => toggleOne(lead._id)} />
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/leads/${lead._id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                          {lead.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.email}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn(STATUS_COLORS[lead.status])}>{lead.status}</Badge>
                      </td>
                      <td className="px-4 py-3">{lead.leadScore ?? 50}</td>
                      <td className="px-4 py-3">{lead.source}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.meta && (
              <div className="p-4">
                <Pagination meta={data.meta} onPageChange={(p) => updateParams({ page: String(p) })} />
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Lead">
        <LeadForm onSubmit={(d) => createMutation.mutate(d)} loading={createMutation.isPending} submitLabel="Create" />
      </Modal>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import CSV">
        <p className="mb-3 text-sm text-gray-500">CSV columns: name, email, source (Website | Instagram | Referral)</p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <Button className="w-full" onClick={() => fileRef.current?.click()} loading={importMutation.isPending}>
          <Upload className="mr-2 h-4 w-4" />
          Choose CSV file
        </Button>
      </Modal>
    </div>
  );
};
