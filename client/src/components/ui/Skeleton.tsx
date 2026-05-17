import { cn } from '../../lib/utils';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800', className)} />
);

export const TableSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
);
