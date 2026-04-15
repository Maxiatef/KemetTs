# Kemet Technologies — Deployment Guide

## Deploy to Vercel (Recommended)

### Step 1 — Push to GitHub
1. Create a new GitHub repo
2. Push all files: `git init && git add . && git commit -m "initial" && git remote add origin <your-repo-url> && git push -u origin main`

### Step 2 — Import to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework Preset: **Other** (not Next.js)
4. Root Directory: leave as `/` (default)
5. Build Command: leave blank (or `echo done`)
6. Output Directory: leave blank
7. Click **Deploy**

### Step 3 — Set Environment Variable
In Vercel Dashboard → your project → Settings → Environment Variables:
- Name: `NV_API_KEY`
- Value: your NVIDIA API key from https://build.nvidia.com/
- Environment: Production + Preview + Development

### Step 4 — Redeploy
After adding the env var, go to Deployments → click the three dots on latest → **Redeploy**

---

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env and add your NV_API_KEY
node server.js
# Open http://localhost:3000
```

---

## API Endpoints (all work on Vercel)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | AI chat widget |
| `/api/health` | GET | Health check |
| `/api/contact` | POST | Contact form |
| `/api/blog` | POST/PUT/DELETE | Blog management |
| `/api/blogs` | POST | Bulk save |
| `/api/message` | DELETE | Delete message |

---

## Important Notes

- **`data.json` on Vercel**: Vercel is serverless — file writes go to `/tmp` which resets on each deployment. For persistent data, use Google Sheets integration (already set up) or a database like Supabase/PlanetScale.
- **Images**: Upload to a CDN or Cloudinary. The `blogs-cover-imgs/` folder won't persist on Vercel.
- **Admin panel**: Access at `yourdomain.com/admingeorge.html` — password is `kemet2026`
- **AI Chat**: Uses NVIDIA GLM model. Make sure `NV_API_KEY` is set in Vercel env vars.
