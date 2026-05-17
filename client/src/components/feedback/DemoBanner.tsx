import { Info, RotateCcw } from 'lucide-react';
import { isDemoMode } from '../../lib/demo';
import { resetStore } from '../../mocks/store';

export const DemoBanner = () => {
  if (!isDemoMode) return null;

  const handleReset = () => {
    resetStore();
    window.location.reload();
  };

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-100 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">Live demo mode</p>
          <p className="text-indigo-700 dark:text-indigo-300">
            No backend required. Data saves in your browser. Login:{' '}
            <span className="font-mono">admin@smartleads.com</span> /{' '}
            <span className="font-mono">password123</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-100 dark:hover:bg-indigo-800"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset demo data
      </button>
    </div>
  );
};
