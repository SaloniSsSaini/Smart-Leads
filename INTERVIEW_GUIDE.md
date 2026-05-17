# Smart Leads Dashboard — Interview Preparation Guide

Use this document to explain your project confidently in technical interviews, HR rounds, and portfolio reviews. Read each section aloud once before your interview — it is written in interview-ready language.

---

## 1. Elevator pitch (30 seconds)

> "I built **Smart Leads Dashboard**, a full-stack **Lead Management CRM** similar to tools like HubSpot or Pipedrive, but focused on clarity and production patterns. It is a **multi-tenant SaaS** app where companies (organizations) manage leads, assign them to sales reps, track pipelines on a Kanban board, and get real-time notifications. I used the **MERN stack with TypeScript** on both frontend and backend, added **JWT authentication with RBAC**, **Socket.io** for live updates, **Stripe** for billing, and set up **Jest plus Playwright** with **GitHub Actions CI**. The project shows I can build a real product — not just a tutorial todo app."

---

## 2. Problem statement — why this project?

**Interviewer may ask:** *"Why did you build this?"*

**Your answer:**

- Sales teams lose leads when data lives in spreadsheets or WhatsApp.
- A CRM centralizes leads, tracks status (`New` → `Contacted` → `Qualified` → `Lost`), and shows who owns each lead.
- I wanted to prove I can build **SaaS-style software**: multiple organizations, roles, billing, and security — not just CRUD on one table.

---

## 3. Tech stack — explain each choice

| Technology | Why I chose it |
|------------|----------------|
| **React 19** | Component-based UI, large ecosystem, industry standard |
| **Vite** | Fast dev server and builds compared to CRA |
| **TypeScript** | Type safety on frontend and backend; fewer runtime bugs |
| **Tailwind CSS 4** | Utility-first styling, consistent design quickly |
| **TanStack Query** | Server state caching, loading/error states, refetch on focus |
| **Express + Node** | Simple, flexible REST API; easy to add middleware |
| **Mongoose + MongoDB** | Flexible schema for leads; nested documents; good for SaaS multi-tenant |
| **JWT** | Stateless auth; scales horizontally |
| **Socket.io** | Real-time notifications without polling |
| **Zod** | Request validation on API; form validation on client |
| **Jest + Supertest** | API integration tests with in-memory MongoDB |
| **Playwright** | Reliable E2E tests for critical user flows |
| **Docker** | Reproducible environment for reviewers and deployment |

---

## 4. System architecture — how to draw and explain

**Say this while drawing three boxes: Client → API → Database**

1. **Client (React + Vite)** — Single-page app. User logs in; JWT stored in `localStorage`. Axios sends `Authorization: Bearer` on every API call. TanStack Query caches lead lists and dashboard stats.

2. **Server (Express)** — Layered architecture:
   - **Routes** → define endpoints
   - **Middleware** → auth (JWT verify), RBAC (role check), validation (Zod)
   - **Controllers** → parse request, call service, send response
   - **Services** → business logic (e.g. filter leads by org + role)
   - **Models** → Mongoose schemas (User, Organization, Lead, etc.)

3. **MongoDB** — All tenant data scoped by `organizationId`. Indexes on org + status for fast queries.

4. **Socket.io** — After login, client joins rooms `user:{userId}` and `org:{orgId}`. Server emits notifications on lead events.

5. **Cron job** — `node-cron` runs daily at 9 AM to find stale leads (no update in 7 days) and create notifications.

---

## 5. Multi-tenancy — important interview topic

**Interviewer may ask:** *"How do you isolate data between companies?"*

**Your answer:**

- Each **Organization** is a tenant (e.g. "Smart Leads HQ").
- Users join orgs via **OrganizationMember** with a role (`admin` or `sales`).
- JWT payload includes `orgId` — every API request uses this to filter data.
- Example: `Lead.find({ organizationId: req.orgId, ... })` — a user in Org A never sees Org B's leads.
- Users can belong to **multiple orgs**; `POST /auth/switch-org` issues a new JWT with a different `orgId` and role.
- This is the same pattern used by Slack workspaces or Notion teams.

**Follow-up:** *"What if sales user tries to access another user's lead?"*

- **Route level:** Some routes require `admin` role (delete, audit, webhooks).
- **Query level:** For `sales` role, `lead.service` adds `{ $or: [{ assignedTo: userId }, { createdBy: userId }] }` — even if they guess an ID, API returns 404 or empty.

---

## 6. Authentication & security

### Registration & login flow

1. User registers → password hashed with **bcrypt** (10 rounds).
2. Optional email verification token stored in `Token` collection with TTL.
3. Login → compare password → issue **JWT** with `{ userId, orgId, role }`.
4. Client stores token; `GET /auth/me` refreshes user data on app load.
5. On **401**, axios interceptor clears storage and redirects to login.

### 2FA (TOTP)

- Uses `otplib` library (same algorithm as Google Authenticator).
- `POST /auth/2fa/setup` generates secret + QR code.
- Login returns `requires2FA: true` until user submits 6-digit code.

### Other security measures

- **Rate limiting** — 500 requests per 15 minutes per IP
- **CORS** — only `CLIENT_URL` allowed
- **Password reset** — single-use tokens with expiry
- **Helmet-style patterns** — validation on all inputs via Zod

---

## 7. RBAC (Role-Based Access Control)

| Role | Permissions |
|------|-------------|
| **Admin** | All leads in org, delete/archive, team invites, audit log, webhooks, billing checkout, branding |
| **Sales** | Only assigned or self-created leads; cannot delete org-level resources |

**Implementation files:**

- `server/src/middleware/rbac.middleware.ts` — `requireRole('admin')`
- `server/src/services/lead.service.ts` — `buildLeadFilter()` for sales scoping
- `client/src/components/layout/Sidebar.tsx` — hides Audit link for non-admins

**Interview tip:** Emphasize **defense in depth** — hiding UI is not enough; API must enforce rules.

---

## 8. Core features — deep dive answers

### Lead management

- CRUD with statuses: `New`, `Contacted`, `Qualified`, `Lost`
- **Lead score** (0–100): rule-based in `server/src/utils/leadScore.ts` — points for status, source (e.g. Referral > Website), valid email
- **Soft delete:** `deletedAt` field; admin can view archived and restore
- **Activity log:** every status change creates an `Activity` record for timeline

### Kanban board

- `GET /api/leads/kanban` returns leads grouped by status
- Frontend uses **@dnd-kit** for drag-and-drop
- On drop → `PATCH /api/leads/:id` updates status

### CSV import/export

- **Export:** server generates CSV from filtered query
- **Import:** `multer` upload + `csv-parse` with row validation; invalid rows reported before save

### Command palette

- **cmdk** library; triggered with `Ctrl+K`
- Calls `GET /api/search?q=` — searches lead name/email within org

### Team invites

- Admin creates invite with email + role → token stored in `Invite` model
- Invite link → user accepts → added to `OrganizationMember`

### Webhooks

- Admin registers URL + secret + events (`lead.created`, `lead.updated`)
- On lead save, server POSTs JSON payload to URL (Zapier integration pattern)

### Billing

- Plans: Free, Pro, Enterprise on `Organization.plan`
- If `STRIPE_SECRET_KEY` set → real Stripe Checkout session
- If not set → mock upgrade for demo (still shows full UI flow)

### Real-time notifications

- `Notification` model persisted in DB
- Socket.io emits to `user:{id}` room on create
- Bell icon in header shows unread count; `PATCH` marks as read

### i18n

- `react-i18next` with `en.json` and `hi.json`
- User locale saved on profile; language switcher in settings

### Stale lead automation

- Cron in `server/src/jobs/cron.ts`
- Finds leads where `updatedAt` older than 7 days and status not `Lost`
- Creates notification for assignee or admin

---

## 9. Database design — collections

| Collection | Purpose |
|------------|---------|
| `users` | Account, password hash, 2FA, current org, locale |
| `organizations` | Tenant, plan, Stripe customer ID, branding |
| `organizationmembers` | userId + organizationId + role (compound unique index) |
| `leads` | Core CRM entity, scoped by organizationId |
| `activities` | Timeline events per lead |
| `notes` | Comments on leads |
| `notifications` | In-app alerts |
| `tokens` | Email verify / password reset (TTL index) |
| `invites` | Pending team invitations |
| `auditlogs` | Admin action history |
| `webhooks` | Outbound integration config |

**Indexing strategy (mention in interview):**

- `{ organizationId: 1, status: 1 }` for filtered lists
- Text index on `name` and `email` for search
- Unique index on `organizationmembers` (userId + organizationId)

---

## 10. Frontend architecture

- **Feature-based folders:** `features/leads`, `features/auth`, etc.
- **React Router 7** — public routes (landing, login) vs protected routes wrapped in `ProtectedRoute` + `AppLayout`
- **AuthContext** — provides user, orgs, login/logout, switchOrg, socket connection
- **Forms** — React Hook Form + Zod resolvers
- **API layer** — `lib/api.ts` axios instance with interceptors
- **Recharts** on dashboard for bar/line charts
- **Dark mode** — ThemeContext + Tailwind `dark:` classes

---

## 11. Testing strategy

**Interviewer may ask:** *"How did you test this?"*

| Layer | Tool | What it tests |
|-------|------|---------------|
| API | Jest + Supertest + mongodb-memory-server | Register, login, lead CRUD, pagination, billing — no real DB needed |
| E2E | Playwright | Landing page, login as admin, navigate to leads, open command palette |
| CI | GitHub Actions | Runs server tests, client build, E2E with MongoDB service on every PR |

**Sample answer:**

> "Unit and integration tests run on every push. Jest uses an in-memory MongoDB so tests are fast and isolated. Playwright tests the happy path a recruiter would try — login and see leads. CI has three jobs: server, client build, and E2E."

---

## 12. Challenges faced & how you solved them

Use 2–3 of these as STAR stories (Situation, Task, Action, Result):

### Challenge 1: Sales users seeing all leads

- **Problem:** Initial CRUD returned every lead in the database.
- **Solution:** Added `buildLeadFilter()` that checks JWT role and adds assignee filter for sales.
- **Result:** Data isolation at query level, not just UI.

### Challenge 2: Multi-org membership

- **Problem:** User belongs to two companies with different roles.
- **Solution:** JWT carries active `orgId`; switch-org endpoint re-issues token; `currentOrganizationId` on User model.
- **Result:** One login, multiple workspaces — like real SaaS.

### Challenge 3: Real-time without over-engineering

- **Problem:** Polling for notifications is inefficient.
- **Solution:** Socket.io with JWT auth on connection; join user-specific room.
- **Result:** Instant notification bell updates.

### Challenge 4: E2E test flakiness

- **Problem:** Tests failed when servers were not ready.
- **Solution:** Playwright `webServer` config starts API and Vite automatically; seed script for consistent data.
- **Result:** Reliable CI pipeline.

---

## 13. Common interview questions & answers

### Q: What was the hardest part?

> "Scoping data correctly for multi-tenant RBAC — making sure sales users cannot access other reps' leads even with a direct API call. I solved it in the service layer, not only in React."

### Q: What would you improve with more time?

> "Add OAuth login, Redis caching for dashboard stats, Elasticsearch for search, and wire the permissions middleware to routes for granular per-member access. I already have the schema ready for custom permissions."

### Q: How is this different from a tutorial project?

> "It has org-level isolation, Stripe billing, webhooks, audit logs, 2FA, cron jobs, Socket.io, CSV import, Kanban, CI/CD, and Docker — patterns you see in production SaaS, not a single-user todo list."

### Q: How long did it take?

> (Adjust to your truth) "About X weeks, working part-time. I iterated: first auth + CRUD, then Kanban and team features, then billing and real-time."

### Q: Did you work alone or in a team?

> "Solo project — I owned architecture, frontend, backend, database design, tests, and deployment docs."

---

## 14. Demo flow for live interview (5 minutes)

If they ask you to show the app:

1. **Landing page** — explain what the product does
2. **Login as admin** — `admin@smartleads.com` / `password123`
3. **Dashboard** — charts, stats, week-over-week
4. **Leads list** — filter, search, pagination
5. **Lead detail** — notes, activity timeline, lead score
6. **Kanban** — drag one card to new status
7. **Ctrl+K** — command palette search
8. **Team** — show invite flow (explain even if not sending email)
9. **Login as sales** — show restricted lead list
10. **Swagger** — `localhost:5000/api/docs` if they care about API design

---

## 15. Keywords to use (helps in ATS / technical rounds)

`MERN`, `TypeScript`, `REST API`, `JWT`, `RBAC`, `multi-tenant SaaS`, `Mongoose`, `MongoDB`, `React`, `Vite`, `TanStack Query`, `Socket.io`, `Stripe`, `Docker`, `CI/CD`, `Jest`, `Playwright`, `Zod validation`, `bcrypt`, `2FA TOTP`, `webhooks`, `cron jobs`, `Kanban`, `CSV import/export`, `i18n`, `rate limiting`, `Swagger`

---

## 16. Files to remember (if they ask "show me the code")

| Topic | File path |
|-------|-----------|
| Auth service | `server/src/services/auth.service.ts` |
| Lead filtering (RBAC) | `server/src/services/lead.service.ts` |
| JWT middleware | `server/src/middleware/auth.middleware.ts` |
| RBAC middleware | `server/src/middleware/rbac.middleware.ts` |
| Lead score rules | `server/src/utils/leadScore.ts` |
| Cron job | `server/src/jobs/cron.ts` |
| Socket setup | `server/src/socket/index.ts` |
| React routes | `client/src/app/router.tsx` |
| Auth context | `client/src/app/authContext.tsx` |
| API tests | `server/src/__tests__/api.test.ts` |
| E2E tests | `client/e2e/smoke.spec.ts` |
| Seed data | `server/src/scripts/seed.ts` |

---

## 17. Closing statement

> "Smart Leads Dashboard represents how I approach full-stack development: start with clear domain modeling (orgs, leads, roles), enforce security at the API layer, build a polished UI with modern React patterns, and back it with tests and CI. I am confident I can extend this architecture to larger teams and features in a real company environment."

---

**Good luck with your interview.** Practice the elevator pitch and the multi-tenancy section — interviewers ask those most often.
