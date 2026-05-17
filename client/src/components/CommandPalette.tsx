import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../features/leads/services/leadsApi';
import { Search } from 'lucide-react';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const { data: leads } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchApi.global(q).then((r) => r.data.data),
    enabled: open && q.length > 1,
  });

  if (!open) return null;

  const pages = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Leads', path: '/leads' },
    { label: 'Kanban Board', path: '/kanban' },
    { label: 'Team', path: '/team' },
    { label: 'Billing', path: '/billing' },
    { label: 'Settings', path: '/settings' },
    { label: 'Audit Log', path: '/audit' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 pt-[15vh] p-4" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        <Command className="w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900" shouldFilter={false}>
          <div className="flex items-center gap-2 border-b px-3 dark:border-gray-700">
            <Search className="h-4 w-4 text-gray-400" />
            <Command.Input
              value={q}
              onValueChange={setQ}
              placeholder="Search leads or pages... (Ctrl+K)"
              className="flex-1 border-0 bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-4 text-center text-sm text-gray-500">No results</Command.Empty>
            <Command.Group heading="Pages">
              {pages
                .filter((p) => !q || p.label.toLowerCase().includes(q.toLowerCase()))
                .map((p) => (
                  <Command.Item
                    key={p.path}
                    onSelect={() => {
                      navigate(p.path);
                      setOpen(false);
                    }}
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-indigo-50"
                  >
                    {p.label}
                  </Command.Item>
                ))}
            </Command.Group>
            {leads?.map((lead) => (
              <Command.Item
                key={lead._id}
                onSelect={() => {
                  navigate(`/leads/${lead._id}`);
                  setOpen(false);
                }}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm"
              >
                {lead.name} — {lead.email}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
