import { useTranslation } from 'react-i18next';
import { Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../../app/authContext';
import { useTheme } from '../../app/themeContext';
import { NotificationBell } from '../notifications/NotificationBell';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onMenuClick?: () => void;
}

export const Header = ({ title, subtitle, action, onMenuClick }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const { user, organizations, switchOrg } = useAuth();
  const { dark, toggle } = useTheme();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
      <div className="flex items-start gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {action}
        {organizations.length > 1 && (
          <div className="relative">
            <select
              value={user?.orgId}
              onChange={(e) => switchOrg(e.target.value)}
              className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm dark:border-gray-600 dark:bg-gray-800"
              title={t('common.switchOrg')}
            >
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        )}
        <button
          type="button"
          onClick={() => i18n.changeLanguage(i18n.language === 'hi' ? 'en' : 'hi')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
        >
          {i18n.language === 'hi' ? 'EN' : 'हिं'}
        </button>
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
        >
          {dark ? '☀️' : '🌙'}
        </button>
        <NotificationBell />
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs capitalize text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
