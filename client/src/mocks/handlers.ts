import type { InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import type {
  ApiResponse,
  AuthData,
  Lead,
  LeadStats,
  LeadStatus,
  Organization,
  User,
} from '../types';
import { makeDemoToken, parseDemoUserId } from '../lib/demo';
import { PLANS } from './seedData';
import { getStore, nextId, resetStore, saveStore } from './store';
import type { DemoStore, DemoUserRecord } from './types';
import { SOURCES, STATUSES } from './types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

const ok = <T>(data: T, message = 'OK', meta?: ApiResponse<T>['meta']): ApiResponse<T> => ({
  success: true,
  message,
  data,
  meta,
});

const fail = (config: InternalAxiosRequestConfig, status: number, message: string): never => {
  throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, undefined, {
    status,
    statusText: status === 401 ? 'Unauthorized' : 'Bad Request',
    data: { success: false, message },
    headers: {},
    config,
  });
};

const pathOf = (config: InternalAxiosRequestConfig): string => {
  const url = (config.url || '').split('?')[0];
  return url.replace(/^\//, '');
};

const getToken = (config: InternalAxiosRequestConfig): string | null => {
  const auth = config.headers?.Authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);
  if (typeof localStorage !== 'undefined') return localStorage.getItem('token');
  return null;
};

const getUser = (config: InternalAxiosRequestConfig): DemoUserRecord => {
  const userId = parseDemoUserId(getToken(config));
  if (!userId) return fail(config, 401, 'Unauthorized');
  const store = getStore();
  const found = store.users.find((u) => u.id === userId);
  if (!found) return fail(config, 401, 'Unauthorized');
  return found;
};

const toAuthUser = (u: DemoUserRecord): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  orgId: u.orgId,
  orgName: u.orgName,
  emailVerified: u.emailVerified,
  locale: u.locale,
  onboardingDone: u.onboardingDone,
});

const authPayload = (u: DemoUserRecord): AuthData => ({
  token: makeDemoToken(u.id),
  user: toAuthUser(u),
  organizations: u.memberships,
});

const scoreLead = (status: LeadStatus, source: Lead['source']): number => {
  const base = { New: 50, Contacted: 65, Qualified: 85, Lost: 30 }[status];
  const src = { Website: 5, Instagram: 8, Referral: 12 }[source];
  return Math.min(99, base + src);
};

const filterLeads = (
  leads: Lead[],
  params: Record<string, unknown>
): { items: Lead[]; page: number; limit: number } => {
  let items = [...leads];
  const status = params.status as LeadStatus | undefined;
  const source = params.source as Lead['source'] | undefined;
  const search = (params.search as string | undefined)?.toLowerCase();
  const sort = (params.sort as string) || 'latest';
  const page = Number(params.page) || 1;
  const limit = 10;

  if (status) items = items.filter((l) => l.status === status);
  if (source) items = items.filter((l) => l.source === source);
  if (search) {
    items = items.filter(
      (l) => l.name.toLowerCase().includes(search) || l.email.toLowerCase().includes(search)
    );
  }
  items.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return sort === 'oldest' ? ta - tb : tb - ta;
  });

  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), page, limit };
};

const computeStats = (leads: Lead[]): LeadStats => {
  const byStatus = STATUSES.map((status) => ({
    status,
    count: leads.filter((l) => l.status === status).length,
  }));
  const bySource = SOURCES.map((source) => ({
    source,
    count: leads.filter((l) => l.source === source).length,
  }));
  return {
    total: leads.length,
    byStatus,
    bySource,
    weekComparison: { thisWeek: 8, lastWeek: 5, change: 60 },
    funnel: byStatus.map((s) => ({ stage: s.status, count: s.count })),
  };
};

const addActivity = (
  store: DemoStore,
  leadId: string,
  action: string,
  details: string,
  user: DemoUserRecord
) => {
  const entry = {
    _id: nextId('act'),
    action,
    details,
    createdAt: new Date().toISOString(),
    userId: { name: user.name, email: user.email },
  };
  store.activities[leadId] = [entry, ...(store.activities[leadId] || [])];
  store.auditLogs.unshift({
    action,
    entity: 'lead',
    details,
    createdAt: entry.createdAt,
    userId: { name: user.name },
  });
};

const parseBody = (config: InternalAxiosRequestConfig): Record<string, unknown> => {
  if (!config.data) return {};
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return config.data as Record<string, unknown>;
};

export const handleDemoRequest = async (
  config: InternalAxiosRequestConfig
): Promise<{ data: unknown; status: number; headers: Record<string, string> }> => {
  await delay();
  const method = (config.method || 'get').toLowerCase();
  const path = pathOf(config);
  const params = (config.params || {}) as Record<string, unknown>;
  const body = parseBody(config);
  const store = getStore();

  // —— Auth ——
  if (path === 'auth/login' && method === 'post') {
    const email = String(body.email || '').toLowerCase();
    const password = String(body.password || '');
    let user = store.users.find((u) => u.email === email && u.password === password);
    if (!user && password === 'password123') {
      user = store.users.find((u) => u.email === email);
    }
    if (!user) return fail(config, 401, 'Invalid email or password');
    return { data: ok(authPayload(user)), status: 200, headers: {} };
  }

  if (path === 'auth/register' && method === 'post') {
    const email = String(body.email || '').toLowerCase();
    if (store.users.some((u) => u.email === email)) fail(config, 400, 'Email already registered');
    const orgName = String(body.orgName || 'My Organization');
    const id = nextId('user');
    const orgId = nextId('org');
    const user: DemoUserRecord = {
      id,
      name: String(body.name || 'User'),
      email,
      password: String(body.password || 'password123'),
      role: 'admin',
      orgId,
      orgName,
      emailVerified: true,
      locale: 'en',
      onboardingDone: false,
      memberships: [{ id: orgId, name: orgName, plan: 'free', role: 'admin' }],
    };
    store.users.push(user);
    store.orgName = orgName;
    store.orgPlan = 'free';
    saveStore();
    return { data: ok({ ...authPayload(user), message: 'Registered' }), status: 201, headers: {} };
  }

  if (path === 'auth/me' && method === 'get') {
    const user = getUser(config);
    return { data: ok(authPayload(user)), status: 200, headers: {} };
  }

  if (path === 'auth/switch-org' && method === 'post') {
    const user = getUser(config);
    const orgId = String(body.orgId || '');
    const membership = user.memberships.find((o) => o.id === orgId);
    if (!membership) fail(config, 404, 'Organization not found');
    user.orgId = membership!.id;
    user.orgName = membership!.name;
    user.role = membership!.role;
    const org = getStore();
    org.orgName = membership!.name;
    org.orgPlan = membership!.plan as DemoStore['orgPlan'];
    saveStore();
    return { data: ok(authPayload(user)), status: 200, headers: {} };
  }

  if (path === 'auth/profile' && method === 'patch') {
    const user = getUser(config);
    if (body.locale) user.locale = body.locale as 'en' | 'hi';
    if (body.onboardingDone !== undefined) user.onboardingDone = Boolean(body.onboardingDone);
    saveStore();
    return { data: ok(toAuthUser(user)), status: 200, headers: {} };
  }

  if (path === 'auth/verify-email' && method === 'get') {
    return { data: ok({ message: 'Email verified' }), status: 200, headers: {} };
  }
  if (path === 'auth/resend-verification' && method === 'post') {
    return { data: ok({ message: 'Verification email sent (demo)' }), status: 200, headers: {} };
  }
  if (path === 'auth/forgot-password' && method === 'post') {
    return { data: ok({ message: 'Reset link sent (demo mode)' }), status: 200, headers: {} };
  }
  if (path === 'auth/reset-password' && method === 'post') {
    return { data: ok({ message: 'Password reset (demo)' }), status: 200, headers: {} };
  }
  if (path === 'auth/2fa/setup' && method === 'post') {
    const qr =
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect fill="#f3f4f6" width="160" height="160"/><text x="50%" y="50%" text-anchor="middle" font-size="12" fill="#4F46E5">Demo 2FA QR</text></svg>'
      );
    return { data: ok({ qrCode: qr }), status: 200, headers: {} };
  }
  if (path === 'auth/2fa/verify' && method === 'post') {
    return { data: ok({ message: '2FA enabled (demo)' }), status: 200, headers: {} };
  }

  // —— Leads (auth required) ——
  const leadMatch = path.match(/^leads(?:\/([^/]+)(?:\/(notes|restore|activities))?)?$/);

  if (path === 'leads' && method === 'get') {
    getUser(config);
    const { items, page, limit } = filterLeads(store.leads, params);
    const total = store.leads.length;
    return {
      data: ok(items, 'Leads fetched', {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }),
      status: 200,
      headers: {},
    };
  }

  if (path === 'leads/kanban' && method === 'get') {
    getUser(config);
    const board = STATUSES.reduce(
      (acc, status) => {
        acc[status] = store.leads.filter((l) => l.status === status);
        return acc;
      },
      {} as Record<LeadStatus, Lead[]>
    );
    return { data: ok(board), status: 200, headers: {} };
  }

  if (path === 'leads/stats' && method === 'get') {
    getUser(config);
    return { data: ok(computeStats(store.leads)), status: 200, headers: {} };
  }

  if (path === 'leads/export' && method === 'get') {
    getUser(config);
    const { items } = filterLeads(store.leads, { ...params, page: 1 });
    const header = 'name,email,status,source,leadScore,createdAt\n';
    const rows = items
      .map((l) =>
        [l.name, l.email, l.status, l.source, l.leadScore ?? '', l.createdAt]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    return { data: blob, status: 200, headers: { 'content-type': 'text/csv' } };
  }

  if (path === 'leads/import' && method === 'post') {
    const user = getUser(config);
    const csv = String(body.csv || '');
    const lines = csv.trim().split(/\r?\n/).slice(1);
    let imported = 0;
    for (const line of lines) {
      const [name, email, status, source] = line.split(',').map((s) => s.replace(/^"|"$/g, '').trim());
      if (!name || !email) continue;
      const st = (STATUSES.includes(status as LeadStatus) ? status : 'New') as LeadStatus;
      const src = (SOURCES.includes(source as Lead['source']) ? source : 'Website') as Lead['source'];
      const id = nextId('lead');
      store.leads.unshift({
        _id: id,
        name,
        email,
        status: st,
        source: src,
        leadScore: scoreLead(st, src),
        createdBy: { _id: user.id, name: user.name, email: user.email },
        assignedTo: { _id: user.id, name: user.name, email: user.email },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      imported++;
    }
    saveStore();
    return { data: ok({ imported }), status: 200, headers: {} };
  }

  if (path === 'leads/bulk' && method === 'post') {
    const user = getUser(config);
    const ids = (body.ids as string[]) || [];
    const patch = (body.data || body) as Record<string, unknown>;
    let modified = 0;
    for (const lead of store.leads) {
      if (!ids.includes(lead._id)) continue;
      if (patch.status) lead.status = patch.status as LeadStatus;
      if (patch.assignedTo) lead.assignedTo = patch.assignedTo as string;
      lead.updatedAt = new Date().toISOString();
      modified++;
    }
    saveStore();
    if (modified) addActivity(store, ids[0] || '', 'bulk', `Bulk updated ${modified} leads`, user);
    saveStore();
    return { data: ok({ modified }), status: 200, headers: {} };
  }

  if (leadMatch) {
    const [, id, sub] = leadMatch;
    const user = getUser(config);

    if (id && sub === 'notes') {
      if (method === 'get') {
        return { data: ok(store.notes[id] || []), status: 200, headers: {} };
      }
      if (method === 'post') {
        const note = {
          _id: nextId('note'),
          body: String(body.body || ''),
          createdAt: new Date().toISOString(),
          userId: { name: user.name },
        };
        store.notes[id] = [note, ...(store.notes[id] || [])];
        addActivity(store, id, 'note', 'Note added', user);
        saveStore();
        return { data: ok(note), status: 201, headers: {} };
      }
    }

    if (id && sub === 'activities' && method === 'get') {
      return { data: ok(store.activities[id] || []), status: 200, headers: {} };
    }

    if (id && sub === 'restore' && method === 'patch') {
      const idx = store.deletedLeads.findIndex((l) => l._id === id);
      if (idx === -1) fail(config, 404, 'Lead not found');
      const [lead] = store.deletedLeads.splice(idx, 1);
      store.leads.unshift(lead);
      saveStore();
      return { data: ok(lead), status: 200, headers: {} };
    }

    if (id && !sub) {
      if (method === 'get') {
        const lead = store.leads.find((l) => l._id === id);
        if (!lead) fail(config, 404, 'Lead not found');
        return { data: ok(lead), status: 200, headers: {} };
      }
      if (method === 'patch') {
        const leadIdx = store.leads.findIndex((l) => l._id === id);
        if (leadIdx === -1) fail(config, 404, 'Lead not found');
        const lead = store.leads[leadIdx]!;
        Object.assign(lead, body, { updatedAt: new Date().toISOString() });
        if (body.status || body.source) {
          lead.leadScore = scoreLead(lead.status, lead.source);
        }
        addActivity(store, id, 'update', `Lead updated`, user);
        saveStore();
        return { data: ok(lead), status: 200, headers: {} };
      }
      if (method === 'delete') {
        const idx = store.leads.findIndex((l) => l._id === id);
        if (idx === -1) fail(config, 404, 'Lead not found');
        const [removed] = store.leads.splice(idx, 1);
        store.deletedLeads.push(removed);
        saveStore();
        return { data: ok(null), status: 200, headers: {} };
      }
    }

  }

  if (path === 'leads' && method === 'post') {
    const user = getUser(config);
    const st = (body.status as LeadStatus) || 'New';
    const src = (body.source as Lead['source']) || 'Website';
    const id = nextId('lead');
    const lead: Lead = {
      _id: id,
      name: String(body.name || 'New Lead'),
      email: String(body.email || 'lead@example.com'),
      status: st,
      source: src,
      leadScore: scoreLead(st, src),
      createdBy: { _id: user.id, name: user.name, email: user.email },
      assignedTo: body.assignedTo
        ? { _id: String(body.assignedTo), name: 'Team', email: '' }
        : { _id: user.id, name: user.name, email: user.email },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.leads.unshift(lead);
    addActivity(store, id, 'create', 'Lead created', user);
    store.notifications.unshift({
      id: nextId('notif'),
      title: 'New lead',
      message: `${lead.name} was added`,
      type: 'lead',
      link: `/leads/${id}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    saveStore();
    return { data: ok(lead), status: 201, headers: {} };
  }

  // —— Search ——
  if (path === 'search' && method === 'get') {
    getUser(config);
    const q = String(params.q || '').toLowerCase();
    const hits = store.leads
      .filter((l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
      .slice(0, 8);
    return { data: ok(hits), status: 200, headers: {} };
  }

  // —— Notifications ——
  if (path === 'notifications' && method === 'get') {
    getUser(config);
    return { data: ok(store.notifications), status: 200, headers: {} };
  }
  if (path === 'notifications/unread-count' && method === 'get') {
    getUser(config);
    const count = store.notifications.filter((n) => !n.read).length;
    return { data: ok({ count }), status: 200, headers: {} };
  }
  if (path.match(/^notifications\/[^/]+\/read$/) && method === 'patch') {
    getUser(config);
    const id = path.split('/')[1];
    const n = store.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    saveStore();
    return { data: ok(null), status: 200, headers: {} };
  }
  if (path === 'notifications/read-all' && method === 'patch') {
    getUser(config);
    store.notifications.forEach((n) => {
      n.read = true;
    });
    saveStore();
    return { data: ok(null), status: 200, headers: {} };
  }

  // —— Team / settings / audit / invites / webhooks ——
  if (path === 'settings/team' && method === 'get') {
    getUser(config);
    const team = store.users.map((u) => ({
      userId: { name: u.name, email: u.email },
      role: u.role,
    }));
    return { data: ok(team), status: 200, headers: {} };
  }
  if (path === 'settings' && method === 'get') {
    getUser(config);
    return { data: ok({ name: store.orgName, branding: store.settings.branding }), status: 200, headers: {} };
  }
  if (path === 'settings/branding' && method === 'patch') {
    getUser(config);
    store.settings.branding = { ...store.settings.branding, ...body };
    saveStore();
    return { data: ok(store.settings), status: 200, headers: {} };
  }
  if (path === 'audit' && method === 'get') {
    getUser(config);
    return { data: ok(store.auditLogs), status: 200, headers: {} };
  }
  if (path === 'invites' && method === 'get') {
    getUser(config);
    return { data: ok(store.invites), status: 200, headers: {} };
  }
  if (path === 'invites' && method === 'post') {
    getUser(config);
    const invite = {
      _id: nextId('invite'),
      email: String(body.email || ''),
      role: (body.role as 'admin' | 'sales') || 'sales',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    store.invites.push(invite);
    saveStore();
    return { data: ok(invite), status: 201, headers: {} };
  }
  if (path === 'webhooks' && method === 'get') {
    getUser(config);
    return { data: ok(store.webhooks), status: 200, headers: {} };
  }
  if (path === 'webhooks' && method === 'post') {
    getUser(config);
    const wh = {
      _id: nextId('wh'),
      url: String(body.url || ''),
      events: (body.events as string[]) || [],
      createdAt: new Date().toISOString(),
    };
    store.webhooks.push(wh);
    saveStore();
    return { data: ok(wh), status: 201, headers: {} };
  }
  if (path.match(/^webhooks\/[^/]+$/) && method === 'delete') {
    getUser(config);
    const id = path.split('/')[1];
    store.webhooks = store.webhooks.filter((w) => w._id !== id);
    saveStore();
    return { data: ok(null), status: 200, headers: {} };
  }

  // —— Billing ——
  if (path === 'billing/plans' && method === 'get') {
    getUser(config);
    return { data: ok(PLANS), status: 200, headers: {} };
  }
  if (path === 'billing/subscription' && method === 'get') {
    getUser(config);
    const plan = store.orgPlan;
    return { data: ok({ plan, ...PLANS[plan] }), status: 200, headers: {} };
  }
  if (path === 'billing/checkout' && method === 'post') {
    getUser(config);
    const plan = body.plan as 'pro' | 'enterprise';
    if (plan === 'pro' || plan === 'enterprise') {
      store.orgPlan = plan;
      const membership = getUser(config).memberships.find((m) => m.id === getUser(config).orgId);
      if (membership) membership.plan = plan;
      saveStore();
    }
    return {
      data: ok({
        success: true,
        plan: store.orgPlan,
        message: `Upgraded to ${PLANS[store.orgPlan].name} (demo)`,
        mock: true,
        url: null,
      }),
      status: 200,
      headers: {},
    };
  }

  if (path === 'organizations' && method === 'get') {
    const user = getUser(config);
    return { data: ok(user.memberships), status: 200, headers: {} };
  }
  if (path === 'organizations' && method === 'post') {
    const user = getUser(config);
    const name = String(body.name || 'New Org');
    const orgId = nextId('org');
    const org: Organization = { id: orgId, name, plan: 'free', role: 'admin' };
    user.memberships.push(org);
    saveStore();
    return { data: ok(org), status: 201, headers: {} };
  }

  if (path === 'health' || path === 'api/health') {
    return { data: ok({ status: 'ok' }), status: 200, headers: {} };
  }

  console.warn('[demo] unhandled route', method, path);
  return { data: ok({}), status: 200, headers: {} };
};

export { resetStore };
