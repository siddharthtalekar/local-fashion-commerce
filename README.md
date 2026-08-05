# Local Fashion Commerce Platform

Hyperlocal fashion discovery PWA — browse, compare, and connect with local retailers.

## Monorepo structure

```
apps/
  api/                  NestJS REST API
  customer-pwa/         Next.js customer PWA
  retailer-dashboard/   Next.js retailer portal
packages/
  shared-types/         Shared TypeScript types
  ui/                   Shared UI components
prisma/                 Database schema & seed
```

## Quick start (local)

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
```

### 4. Setup database

```bash
npm run db:push
npm run db:seed
```

### 5. Run all apps

```bash
npm run dev
```

| App | URL |
|-----|-----|
| Customer PWA | http://localhost:3000 |
| Retailer Dashboard | http://localhost:3001 |
| API | http://localhost:4000/api |

### Demo credentials (after seed)

| Role | Phone | Password |
|------|-------|----------|
| Admin | 9999999999 | password123 |
| Retailer | 9876543000 | password123 |

## Deployment (lean MVP)

### API — Railway / Render

1. Connect repo, set root directory to project root
2. Use `apps/api/Dockerfile` or build command: `npm run build --workspace=@local-fashion/api`
3. Start command: `node apps/api/dist/main.js`
4. Set env vars from `.env.example` (use Neon/Supabase `DATABASE_URL` in production)

### Customer PWA — Vercel

1. Import repo, set root to `apps/customer-pwa`
2. Set `NEXT_PUBLIC_API_URL` to your deployed API URL
3. Deploy

### Retailer Dashboard — Vercel

1. Import repo, set root to `apps/retailer-dashboard`
2. Set `NEXT_PUBLIC_API_URL` to your deployed API URL
3. Deploy

### Database — Neon / Supabase

- Create PostgreSQL database
- Run migrations: `npx prisma migrate deploy`
- Seed pilot data: `npm run db:seed`

## Features implemented

- Product browse, search, filters (category, brand, size, price)
- Side-by-side product comparison (up to 4)
- Store profiles with map embed
- Call / WhatsApp / Directions CTAs with intent tracking
- PWA manifest + service worker (Serwist)
- SEO metadata + JSON-LD on product/store pages
- Retailer signup, product CRUD, stock toggle, offers
- Admin store verification
- Retailer analytics (intent counts)

## Upgrade path

- **Search**: Postgres FTS → Meilisearch
- **Cache**: Add Redis for hot queries
- **Media**: Cloudinary for image uploads
- **Geo**: PostGIS extension for production distance queries
