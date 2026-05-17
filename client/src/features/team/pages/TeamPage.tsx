import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { teamApi } from '../services/teamApi';
import { Header } from '../../../components/layout/Header';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/feedback/Spinner';
import { useAuth } from '../../../app/authContext';
import { toast } from 'sonner';

export const TeamPage = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: team, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => teamApi.team().then((r) => r.data.data),
  });

  const inviteMutation = useMutation({
    mutationFn: () => teamApi.invite(email),
    onSuccess: () => {
      toast.success('Invite sent (check server console in dev)');
      setEmail('');
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <Header title="Team" subtitle="Invite members and manage your org" onMenuClick={openSidebar} />
      {user?.role === 'admin' && (
        <div className="mb-6 flex gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <Input placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
          <Button onClick={() => inviteMutation.mutate()} loading={inviteMutation.isPending}>Send invite</Button>
        </div>
      )}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left">Member</th>
              <th className="px-4 py-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {(team as { userId?: { name: string; email: string }; role: string }[])?.map((m, i) => (
              <tr key={i} className="border-b dark:border-gray-800">
                <td className="px-4 py-3">
                  <p className="font-medium">{m.userId?.name}</p>
                  <p className="text-xs text-gray-500">{m.userId?.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
