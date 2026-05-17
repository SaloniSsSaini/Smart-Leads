export type UserRole = 'admin' | 'sales';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';
export type PlanType = 'free' | 'pro' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  plan: string;
  role: UserRole;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId: string;
  orgName: string;
  emailVerified: boolean;
  locale: 'en' | 'hi';
  onboardingDone: boolean;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  leadScore?: number;
  createdBy?: string | { _id: string; name: string; email: string };
  assignedTo?: string | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  errors?: { field: string; message: string }[];
}

export interface AuthData {
  token: string;
  user: User;
  organizations: Organization[];
}

export interface LeadStats {
  total: number;
  byStatus: { status: string; count: number }[];
  bySource: { source: string; count: number }[];
  weekComparison?: { thisWeek: number; lastWeek: number; change: number };
  funnel?: { stage: string; count: number }[];
}

export interface Activity {
  _id: string;
  action: string;
  details: string;
  createdAt: string;
  userId: { name: string; email: string };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface LeadsQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: 'latest' | 'oldest';
  page?: number;
}

export interface PlanInfo {
  name: string;
  price: number;
  leadsLimit: number;
  features: string[];
}
