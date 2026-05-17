import { Button } from '../../../components/ui/Button';
import type { PaginationMeta } from '../../../types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ meta, onPageChange }: PaginationProps) => (
  <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
    <p className="text-sm text-gray-500">
      Page {meta.page} of {meta.totalPages} ({meta.total} leads)
    </p>
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={!meta.hasPrev}
        onClick={() => onPageChange(meta.page - 1)}
      >
        Previous
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={!meta.hasNext}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Next
      </Button>
    </div>
  </div>
);
