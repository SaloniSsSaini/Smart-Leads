import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Columns3, UserPlus, Settings, ScrollText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../app/authContext';
import { Logo } from '../brand/Logo';
import { cn } from '../../lib/utils';

const links = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/leads', key: 'leads', icon: Users },
  { to: '/kanban', key: 'kanban', icon: Columns3 },
  { to: '/team', key: 'team', icon: UserPlus },
  { to: '/billing', key: 'billing', icon: CreditCard },
  { to: '/settings', key: 'settings', icon: Settings },
  { to: '/audit', key: 'audit', icon: ScrollText, adminOnly: true },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 p-5 dark:border-gray-800">
        <Logo size="sm" />
        <p className="mt-3 truncate text-xs text-gray-500">{user?.orgName}</p>
        <span className="mt-1 inline-block rounded bg-indigo-100 px-2 py-0.5 text-xs capitalize text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {user?.role}
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.filter((l) => !('adminOnly' in l && l.adminOnly) || user?.role === 'admin').map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-5 w-5" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
};
