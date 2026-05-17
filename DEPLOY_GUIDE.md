# Deploy Guide — Frontend only (Demo Mode)

**Recommended for portfolio / interview:** deploy only the frontend. The app runs fully in the browser with sample data — no Render/Railway backend.

---

## Vercel (5 minutes)

1. Push code to GitHub
2. [vercel.com/new](https://vercel.com/new) → import repo
3. **Root Directory:** `client`
4. **Environment variable:**

| Name | Value |
|------|--------|
| `VITE_DEMO_MODE` | `true` |

5. Deploy → open your URL
6. Login: `admin@smartleads.com` / `password123`

You do **not** need `VITE_API_URL` when demo mode is on.

---

## Local development

**Demo only (no server):**

```bash
cd client
# .env: VITE_DEMO_MODE=true
npm run dev
```

**Full stack (real API):**

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2 — client/.env:
# VITE_DEMO_MODE=false
# VITE_API_URL=http://localhost:5000/api
cd client && npm run dev
```

---

## What reviewers see

| URL | Works |
|-----|--------|
| Your Vercel app | Login, dashboard, leads, kanban, team, settings, billing (mock) |
| `server/` in GitHub | Full Express + MongoDB codebase (portfolio proof) |

Demo data is stored in **localStorage** (persists on refresh, per browser).

---

## Optional: real backend later

See `render.yaml` and server README if you want production API + MongoDB Atlas later.
