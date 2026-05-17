# Deploy Guide (Hindi + English)

Pehle **backend (Render)**, phir **frontend (Vercel)**. Dono ke baad app poori chalegi.

---

## Step 0 — MongoDB Atlas (ek baar)

1. [MongoDB Atlas](https://cloud.mongodb.com) → apna cluster
2. **Network Access** → **Add IP Address** → `0.0.0.0/0` (Allow from anywhere) → Confirm  
   *(demo / portfolio ke liye; production mein tight IPs use karo)*
3. **Database Access** → user password note karo
4. **Connect** → Drivers → connection string copy (`MONGO_URI`)

---

## Step 1 — Backend on Render

### Option A: Blueprint (aasaan)

1. Code GitHub par push karo
2. [render.com](https://render.com) → **New** → **Blueprint**
3. Repo select karo → `render.yaml` auto-detect hoga
4. Manual set karo:
   - `MONGO_URI` = Atlas connection string
   - `CLIENT_URL` = abhi `https://placeholder.vercel.app` rakho; Step 2 ke baad update kar lena
5. **Apply** → deploy wait (~5 min)
6. Live URL copy karo, jaise: `https://smart-leads-api.onrender.com`
7. Test browser mein: `https://YOUR-RENDER-URL.onrender.com/api/health`  
   → `{"success":true,...}` aana chahiye

### Option B: Manual Web Service

| Field | Value |
|-------|--------|
| Root Directory | `server` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

**Environment variables (Render → Environment):**

| Key | Example |
|-----|---------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | koi bhi 16+ character random string |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `SKIP_EMAIL_VERIFICATION` | `true` |

> Render apna `PORT` khud set karta hai — alag se mat likho.

Deploy fail ho to **Logs** tab kholo — `Invalid environment variables` ya `MongoDB` error sabse common hai.

---

## Step 2 — Frontend on Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → GitHub repo
2. **Root Directory** = `client`
3. **Environment Variables**:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api` |

4. **Deploy**
5. App URL copy karo, jaise: `https://smart-leads-dashboard.vercel.app`

---

## Step 3 — Dono ko link karo (zaroori)

1. **Render** → Environment → `CLIENT_URL` = apna **Vercel URL** (https, bina trailing slash)
2. **Save** → Render service **Manual Deploy** / redeploy
3. Vercel par `VITE_API_URL` sahi hai confirm karo → agar change kiya to **Redeploy**

---

## Step 4 — Access / test

| Kya | URL |
|-----|-----|
| App (users) | `https://YOUR-APP.vercel.app` |
| API health | `https://YOUR-API.onrender.com/api/health` |
| API docs | `https://YOUR-API.onrender.com/api/docs` |

1. Vercel URL kholo → Register / Login try karo  
2. Agar login fail + browser Console (F12) mein CORS error → `CLIENT_URL` Vercel URL se **exact match** nahi hai  
3. Render free tier: pehli request par **30–60 sec** cold start — dubara try karo

---

## Local dev (deploy ke baad bhi)

`client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

`server/.env` — local `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL=http://localhost:5173`

Terminal 1: `cd server && npm run dev`  
Terminal 2: `cd client && npm run dev`

---

## Security

- `.env` files Git par **kabhi commit mat** karo
- Atlas password leak ho chuka ho to **rotate** karo
- Production mein `JWT_SECRET` strong random string use karo
