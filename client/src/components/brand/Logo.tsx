import { cn } from '../../lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = { sm: 28, md: 36, lg: 48 };

export const Logo = ({ size = 'md', showText = true, className }: LogoProps) => {
  const px = sizes[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg width={px} height={px} viewBox="0 0 64 64" fill="none" aria-hidden>
        <rect width="64" height="64" rx="14" className="fill-indigo-600 dark:fill-indigo-500" />
        <path
          d="M20 44V20l12 8 12-8v24"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="44" cy="20" r="6" fill="#A5B4FC" />
        <path d="M42 20h4M44 18v4" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight text-gray-900 dark:text-white',
            size === 'sm' && 'text-base',
            size === 'md' && 'text-lg',
            size === 'lg' && 'text-2xl'
          )}
        >
          Smart <span className="text-indigo-600 dark:text-indigo-400">Leads</span>
        </span>
      )}
    </div>
  );
};
