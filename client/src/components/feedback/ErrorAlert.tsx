import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert = ({ message, onRetry }: ErrorAlertProps) => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
    <AlertCircle className="h-8 w-8 text-red-500" />
    <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    {onRetry && (
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
