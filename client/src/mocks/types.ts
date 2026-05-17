import type {
  Activity,
  AppNotification,
  Lead,
  LeadSource,
  LeadStatus,
  Organization,
  PlanType,
  UserRole,
} from '../types';

export interface DemoUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  orgId: string;
  orgName: string;
  emailVerified: boolean;
  locale: 'en' | 'hi';
  onboardingDone: boolean;
  memberships: Organization[];
}

export interface DemoNote {
  _id: string;
  body: string;
  createdAt: string;
  userId: { name: string };
}

export interface DemoTeamMember {
  userId: { name: string; email: string };
  role: UserRole;
}

export interface DemoInvite {
  _id: string;
  email: string;
  role: UserRole;
  status: string;
  createdAt: string;
}

export interface DemoWebhook {
  _id: string;
  url: string;
  events: string[];
  createdAt: string;
}

export interface DemoAuditLog {
  action: string;
  entity: string;
  details: string;
  createdAt: string;
  userId?: { name: string };
}

export interface DemoStore {
  users: DemoUserRecord[];
  leads: Lead[];
  deletedLeads: Lead[];
  notes: Record<string, DemoNote[]>;
  activities: Record<string, Activity[]>;
  notifications: AppNotification[];
  auditLogs: DemoAuditLog[];
  invites: DemoInvite[];
  webhooks: DemoWebhook[];
  orgName: string;
  orgPlan: PlanType;
  settings: {
    name: string;
    branding: { primaryColor?: string; displayName?: string; logoUrl?: string };
  };
}

export type LeadInput = Partial<Pick<Lead, 'name' | 'email' | 'status' | 'source'>> & {
  assignedTo?: string;
};

export const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
export const SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];
