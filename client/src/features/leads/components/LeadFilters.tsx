import { Search } from 'lucide-react';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { STATUS_OPTIONS, SOURCE_OPTIONS } from '../../../constants';
import type { LeadsQuery } from '../../../types';

interface LeadFiltersProps {
  filters: LeadsQuery;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof LeadsQuery, value: string) => void;
}

export const LeadFilters = ({
  filters,
  searchInput,
  onSearchChange,
  onFilterChange,
}: LeadFiltersProps) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div className="relative sm:col-span-2 lg:col-span-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder="Search name or email..."
        value={searchInput}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>
    <Select
      label="Status"
      value={filters.status ?? ''}
      onChange={(e) => onFilterChange('status', e.target.value)}
      options={[
        { value: '', label: 'All statuses' },
        ...STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
      ]}
    />
    <Select
      label="Source"
      value={filters.source ?? ''}
      onChange={(e) => onFilterChange('source', e.target.value)}
      options={[
        { value: '', label: 'All sources' },
        ...SOURCE_OPTIONS.map((s) => ({ value: s, label: s })),
      ]}
    />
    <Select
      label="Sort"
      value={filters.sort ?? 'latest'}
      onChange={(e) => onFilterChange('sort', e.target.value)}
      options={[
        { value: 'latest', label: 'Latest first' },
        { value: 'oldest', label: 'Oldest first' },
      ]}
    />
  </div>
);
