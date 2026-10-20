# GrandStay

Hotel booking platform built with **Payload CMS v3** + **Vite TypeScript**.

## Stack

| Layer | Technology |
|-------|-----------|
| CMS / API | Payload CMS v3 (Next.js 15) |
| Frontend | Vite 6 + TypeScript (Vanilla SPA) |
| Database | PostgreSQL (Neon in production) |
| Hosting | Vercel |

## Project structure

```
grandstay-ts/
├── cms/          # Payload CMS — API + admin panel
└── frontend/     # Vite SPA — public website
```

## Local development

### Prerequisites
- Node.js >= 20
- PostgreSQL running locally

### Setup

```bash
# Install all dependencies from monorepo root
npm install

# Copy env files and fill in values
cp cms/.env.example cms/.env

# Start both servers in parallel
npm run dev
```

- CMS admin: http://localhost:3001/admin
- Frontend: http://localhost:5173

## Deploy

See [DEPLOY.md](./DEPLOY.md) for Vercel + Neon deployment guide.
