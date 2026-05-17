# Smart Leads Dashboard — 4-Minute Demo Video Script

**Total duration:** ~4 minutes (240 seconds)  
**Format:** Screen recording + voiceover (optional face cam in intro/outro)  
**Resolution:** 1920×1080 recommended  
**Before recording:** Run `npm run seed`, start server + client, use **admin@smartleads.com** / **password123**

---

## Pre-recording checklist

- [ ] Close unrelated browser tabs and notifications
- [ ] Use light theme OR dark theme consistently (pick one)
- [ ] Browser zoom at 100%
- [ ] Window size: full screen or clean 1920×1080 crop
- [ ] MongoDB running, seed data loaded
- [ ] Microphone test — speak clearly, moderate pace
- [ ] Optional: light background music at 10% volume (royalty-free)

---

## Script with timings

### [0:00 – 0:25] INTRO — Hook & project name

**[Screen: Landing page at http://localhost:5173]**

**VOICEOVER:**

> "Hi, I'm [Your Name]. Today I'll walk you through **Smart Leads Dashboard** — a full-stack Lead Management CRM I built with the MERN stack and TypeScript. It helps sales teams track leads from first contact to closed deal, with role-based access, a Kanban pipeline, real-time notifications, and multi-tenant organization support. Let me show you how it works."

**[Action: Slowly scroll the landing page hero section, then click **Login**]**

---

### [0:25 – 0:50] AUTH & DASHBOARD

**[Screen: Login page → enter credentials → Dashboard]**

**VOICEOVER:**

> "I'll log in as an admin. The app uses JWT authentication with bcrypt-secured passwords. Admins see the full organization — sales reps only see leads assigned to them."

**[Action: Login with admin@smartleads.com / password123]**

**VOICEOVER (continued):**

> "This is the analytics dashboard — lead counts by status, charts powered by Recharts, and week-over-week comparison so managers can spot trends quickly."

**[Action: Point cursor at stat cards and one chart; pause 2 seconds]**

---

### [0:50 – 1:35] LEADS LIST & DETAIL

**[Screen: Navigate to Leads]**

**VOICEOVER:**

> "The Leads page supports filtering by status and source, debounced search, sorting, and pagination — all handled server-side for performance."

**[Action: Apply filter — e.g. Status = New; type a name in search]**

**VOICEOVER:**

> "Each lead has a rule-based score from zero to one hundred, calculated from status, source, and contact quality — no machine learning needed, just clear business rules."

**[Action: Click one lead → Lead detail page]**

**VOICEOVER:**

> "On the detail page you get the full timeline of activities, threaded notes for team collaboration, and quick status updates."

**[Action: Add a short note, e.g. "Called — interested in demo"]; change status dropdown to Contacted]**

---

### [1:35 – 2:15] KANBAN & COMMAND PALETTE

**[Screen: Kanban board]**

**VOICEOVER:**

> "For visual pipeline management, the Kanban board lets you drag leads across columns — from New, to Contacted, to Qualified, or Lost. Under the hood, each drop sends a PATCH request to update the lead status."

**[Action: Drag one card from New to Contacted column; wait for save toast]**

**VOICEOVER:**

> "Power users can press Control-K to open the command palette — search any lead by name and jump straight to it, similar to tools like Notion or Linear."

**[Action: Press Ctrl+K, type "Rahul" or any seeded name, select result, show navigation]**

---

### [2:15 – 2:55] TEAM, SETTINGS & REAL-TIME

**[Screen: Team page]**

**VOICEOVER:**

> "Admins can invite sales team members by email. Each invite generates a secure token — when accepted, the user joins the organization with the correct role."

**[Action: Show Team page and invite form — do not need to send real email]**

**[Screen: Settings — branding section]**

**VOICEOVER:**

> "Organizations can white-label the app with a custom display name and primary color. This is stored per organization in MongoDB — true multi-tenant SaaS design."

**[Action: Show branding color/name fields briefly]**

**VOICEOVER:**

> "Notifications arrive in real time using Socket.io — when a lead is updated or a stale-lead reminder fires from our daily cron job, users see it instantly in the bell icon."

**[Action: Click notification bell if unread items exist; otherwise mention verbally]**

---

### [2:55 – 3:35] SALES ROLE & SECURITY

**[Screen: Logout → Login as sales@smartleads.com / password123]**

**VOICEOVER:**

> "Let me switch to a sales account. Notice the lead list is smaller — sales users only see leads assigned to them or that they created. The API enforces this at the database query level, not just by hiding buttons in the UI."

**[Action: Show Leads list with fewer items; optionally open Kanban]**

**[Screen: Quick flash of Settings → 2FA section OR mention while on settings]**

**VOICEOVER:**

> "Security features include email verification, password reset, optional two-factor authentication with Google Authenticator, and API rate limiting."

---

### [3:35 – 4:00] TECH STACK & OUTRO

**[Screen: Optional — Swagger at localhost:5000/api/docs OR GitHub repo README / CI badge]**

**VOICEOVER:**

> "Under the hood: React nineteen and Vite on the frontend, Express and Mongoose on the backend, MongoDB for storage, Jest and Playwright for tests, and GitHub Actions for CI. The project is Docker-ready and documented for deployment to Vercel, Railway, and MongoDB Atlas."

**[Screen: Return to Dashboard or Landing page]**

**VOICEOVER:**

> "That was Smart Leads Dashboard — a production-style CRM showcasing full-stack development, SaaS patterns, and real-world features. Thank you for watching. Links to the source code and live demo are in the description."

**[Action: Fade out or show end card with your name, GitHub link, LinkedIn]**

---

## End card (5 seconds, optional)

```
Smart Leads Dashboard
Built by [Your Name]
GitHub: [your-repo-url]
LinkedIn: [your-profile]
```

---

## Recording tips

| Tip | Why |
|-----|-----|
| Rehearse once without recording | Smooth cursor movement |
| Move mouse deliberately | Viewers follow the cursor |
| Pause 1–2 sec after each click | Time for UI to load |
| Use seeded names (Rahul, Priya) | Search demo works reliably |
| Keep browser devtools closed | Cleaner recording |
| Export at 1080p, 30fps | Good quality, smaller file |

---

## B-roll shots (optional extras if video runs short)

- CSV export button click → downloaded file
- Audit log page (admin only)
- Language switch English → Hindi
- Dark mode toggle
- Billing page with plan cards
- `docker compose up` terminal (5 sec) for DevOps impression

---

## YouTube / portfolio description template

```
Smart Leads Dashboard — Full-Stack Lead Management CRM (4 min demo)

A production-style SaaS CRM built with MERN + TypeScript:
✅ JWT auth, RBAC (Admin/Sales), multi-tenant orgs
✅ Kanban pipeline, lead scoring, CSV import/export
✅ Real-time notifications (Socket.io)
✅ 2FA, Stripe billing, webhooks, audit log
✅ Jest + Playwright + GitHub Actions CI
✅ Docker support

Tech: React 19, Vite, Tailwind, TanStack Query, Express, Mongoose, MongoDB

GitHub: [link]
Demo login: admin@smartleads.com / password123

#fullstack #react #nodejs #mongodb #saas #crm #webdevelopment
```

---

**Total spoken words:** ~650 (comfortable pace ≈ 150 words/min ≈ 4.3 min; trim pauses to hit 4 min exactly)
