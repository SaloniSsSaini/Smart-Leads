import type { Lead } from '../types';
import type { DemoStore } from './types';

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const mkLead = (
  id: string,
  name: string,
  email: string,
  status: Lead['status'],
  source: Lead['source'],
  score: number,
  days: number
): Lead => ({
  _id: id,
  name,
  email,
  status,
  source,
  leadScore: score,
  createdBy: { _id: 'user-admin', name: 'Admin User', email: 'admin@smartleads.com' },
  assignedTo: { _id: 'user-sales', name: 'Sales User', email: 'sales@smartleads.com' },
  createdAt: daysAgo(days),
  updatedAt: daysAgo(days - 1),
});

export const createInitialStore = (): DemoStore => {
  const leads: Lead[] = [
    mkLead('lead-1', 'Rahul Sharma', 'rahul@example.com', 'New', 'Website', 72, 2),
    mkLead('lead-2', 'Priya Patel', 'priya@example.com', 'Contacted', 'Instagram', 65, 3),
    mkLead('lead-3', 'Amit Kumar', 'amit@example.com', 'Qualified', 'Referral', 88, 5),
    mkLead('lead-4', 'Sneha Reddy', 'sneha@example.com', 'Lost', 'Website', 40, 7),
    mkLead('lead-5', 'Vikram Singh', 'vikram@example.com', 'New', 'Referral', 55, 1),
    mkLead('lead-6', 'Anita Desai', 'anita@example.com', 'Contacted', 'Website', 61, 4),
    mkLead('lead-7', 'Karan Mehta', 'karan@example.com', 'Qualified', 'Instagram', 79, 6),
    mkLead('lead-8', 'Divya Nair', 'divya@example.com', 'New', 'Instagram', 58, 2),
    mkLead('lead-9', 'Rohan Gupta', 'rohan@example.com', 'Contacted', 'Referral', 70, 8),
    mkLead('lead-10', 'Meera Joshi', 'meera@example.com', 'Qualified', 'Website', 82, 9),
    mkLead('lead-11', 'Arjun Iyer', 'arjun@example.com', 'New', 'Website', 50, 3),
    mkLead('lead-12', 'Lisa Chen', 'lisa@example.com', 'Lost', 'Referral', 35, 10),
  ];

  return {
    users: [
      {
        id: 'user-admin',
        name: 'Admin User',
        email: 'admin@smartleads.com',
        password: 'password123',
        role: 'admin',
        orgId: 'org-1',
        orgName: 'Smart Leads HQ',
        emailVerified: true,
        locale: 'en',
        onboardingDone: true,
        memberships: [
          { id: 'org-1', name: 'Smart Leads HQ', plan: 'pro', role: 'admin' },
          { id: 'org-2', name: 'Sales Team', plan: 'free', role: 'admin' },
        ],
      },
      {
        id: 'user-sales',
        name: 'Sales User',
        email: 'sales@smartleads.com',
        password: 'password123',
        role: 'sales',
        orgId: 'org-1',
        orgName: 'Smart Leads HQ',
        emailVerified: true,
        locale: 'en',
        onboardingDone: true,
        memberships: [{ id: 'org-1', name: 'Smart Leads HQ', plan: 'pro', role: 'sales' }],
      },
    ],
    leads,
    deletedLeads: [],
    notes: {
      'lead-1': [
        {
          _id: 'note-1',
          body: 'Interested in Pro plan. Follow up next week.',
          createdAt: daysAgo(1),
          userId: { name: 'Admin User' },
        },
      ],
      'lead-3': [
        {
          _id: 'note-2',
          body: 'Demo scheduled for Thursday.',
          createdAt: daysAgo(2),
          userId: { name: 'Sales User' },
        },
      ],
    },
    activities: {
      'lead-1': [
        {
          _id: 'act-1',
          action: 'created',
          details: 'Lead created from Website',
          createdAt: daysAgo(2),
          userId: { name: 'Admin User', email: 'admin@smartleads.com' },
        },
        {
          _id: 'act-2',
          action: 'note',
          details: 'Note added',
          createdAt: daysAgo(1),
          userId: { name: 'Admin User', email: 'admin@smartleads.com' },
        },
      ],
    },
    notifications: [
      {
        id: 'notif-1',
        title: 'New lead',
        message: 'Rahul Sharma was added',
        type: 'lead',
        link: '/leads/lead-1',
        read: false,
        createdAt: daysAgo(1),
      },
      {
        id: 'notif-2',
        title: 'Lead qualified',
        message: 'Amit Kumar moved to Qualified',
        type: 'lead',
        link: '/leads/lead-3',
        read: false,
        createdAt: daysAgo(3),
      },
      {
        id: 'notif-3',
        title: 'Welcome',
        message: 'Your Smart Leads workspace is ready',
        type: 'system',
        read: true,
        createdAt: daysAgo(5),
      },
    ],
    auditLogs: [
      {
        action: 'create',
        entity: 'lead',
        details: 'Created lead Rahul Sharma',
        createdAt: daysAgo(2),
        userId: { name: 'Admin User' },
      },
      {
        action: 'update',
        entity: 'lead',
        details: 'Status changed to Qualified for Amit Kumar',
        createdAt: daysAgo(4),
        userId: { name: 'Sales User' },
      },
      {
        action: 'invite',
        entity: 'member',
        details: 'Invited colleague@company.com',
        createdAt: daysAgo(6),
        userId: { name: 'Admin User' },
      },
    ],
    invites: [
      {
        _id: 'invite-1',
        email: 'colleague@company.com',
        role: 'sales',
        status: 'pending',
        createdAt: daysAgo(3),
      },
    ],
    webhooks: [
      {
        _id: 'wh-1',
        url: 'https://example.com/webhooks/leads',
        events: ['lead.created', 'lead.updated'],
        createdAt: daysAgo(7),
      },
    ],
    orgName: 'Smart Leads HQ',
    orgPlan: 'pro',
    settings: {
      name: 'Smart Leads HQ',
      branding: { primaryColor: '#4F46E5', displayName: 'Smart Leads HQ' },
    },
  };
};

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    leadsLimit: 50,
    features: ['50 leads', 'Basic dashboard', 'CSV export'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    leadsLimit: 500,
    features: ['500 leads', 'Activity log', 'Priority support', 'Team members'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    leadsLimit: 10000,
    features: ['Unlimited leads', 'Custom roles', 'API access', 'Dedicated support'],
  },
} as const;
