import { ILead } from '../models/Lead.model';

const escapeCsv = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const leadsToCsv = (leads: ILead[]): string => {
  const headers = ['Name', 'Email', 'Status', 'Source', 'Created At'];
  const rows = leads.map((lead) => [
    escapeCsv(lead.name),
    escapeCsv(lead.email),
    escapeCsv(lead.status),
    escapeCsv(lead.source),
    escapeCsv(new Date(lead.createdAt).toISOString()),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};
