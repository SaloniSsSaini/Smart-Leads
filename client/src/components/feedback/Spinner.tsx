import { cn } from '../../lib/utils';

export const Spinner = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center justify-center py-12', className)}>
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
  </div>
);
