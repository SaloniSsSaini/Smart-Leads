import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</p>
    {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    {actionLabel && onAction && (
      <Button className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
