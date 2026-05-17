import type { LeadSource, LeadStatus } from '../types';

export const STATUS_OPTIONS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
export const SOURCE_OPTIONS: LeadSource[] = ['Website', 'Instagram', 'Referral'];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  Qualified: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  Lost: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};
