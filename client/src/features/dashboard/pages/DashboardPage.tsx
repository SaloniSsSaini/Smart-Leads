import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { leadsApi } from '../../leads/services/leadsApi';
import { Header } from '../../../components/layout/Header';
import { Spinner } from '../../../components/feedback/Spinner';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import { STATUS_COLORS } from '../../../constants';
import type { LeadStatus } from '../../../types';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: () => leadsApi.stats().then((r) => r.data.data),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message="Failed to load stats" onRetry={() => refetch()} />;
  if (!data) return null;

  return (
    <div>
      <Header title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} onMenuClick={openSidebar} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={data.total} highlight />
        {data.weekComparison && (
          <StatCard
            label="Leads this week"
            value={data.weekComparison.thisWeek}
            sub={`${data.weekComparison.change >= 0 ? '+' : ''}${data.weekComparison.change} vs last week`}
          />
        )}
        {data.byStatus.map((s) => (
          <StatCard
            key={s.status}
            label={s.status}
            value={s.count}
            badgeClass={STATUS_COLORS[s.status as LeadStatus]}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Leads by Status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byStatus}>
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Leads by Source">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.bySource}
                dataKey="count"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(props) => {
                  const e = props as { source?: string; count?: number };
                  return `${e.source ?? ''}: ${e.count ?? 0}`;
                }}
              >
                {data.bySource.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  sub,
  badgeClass,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string;
  badgeClass?: string;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-2xl border p-5 shadow-sm ${highlight ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
  >
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`mt-1 text-3xl font-bold ${badgeClass ?? ''}`}>{value}</p>
    {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 className="mb-4 font-semibold">{title}</h2>
    {children}
  </div>
);
