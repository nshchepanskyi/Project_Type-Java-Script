# Deploy Guide: Vercel + Neon

## Prerequisites

- GitHub repo connected to Vercel
- Neon account with a database created

## Step 1 — Deploy CMS

1. Vercel → **Add New Project** → select this repo
2. **Root Directory:** `cms`
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon connection string (non-pooled) |
| `PAYLOAD_SECRET` | 64-char random string |
| `PAYLOAD_URL` | Fill after deploy, e.g. `https://grandstay-cms.vercel.app` |
| `FRONTEND_URL` | Fill after frontend deploy |

4. Deploy → note your CMS URL

## Step 2 — Deploy Frontend

1. Vercel → **Add New Project** → same repo
2. **Root Directory:** `frontend`
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `VITE_CMS_URL` | CMS URL from Step 1 |

4. Deploy → note your frontend URL

## Step 3 — Update CMS env vars

Go back to CMS project on Vercel → Settings → Environment Variables:
- Set `PAYLOAD_URL` = CMS URL
- Set `FRONTEND_URL` = Frontend URL

Then **Redeploy** the CMS.

## Step 4 — Create first admin user

Visit `https://your-cms.vercel.app/admin` → create your admin account.
