# Dukan Desk — Starter Project

```
dukan-desk/
├── docs/            # planning docs (requirements, brain.md, architecture, flow diagrams)
├── backend/         # NestJS + PostgreSQL (Prisma) + Redis + Gemini
└── mobile/          # React Native (Expo Router) app
```

Read `docs/README.md` first for the plan; this file is about running the code.

## What's already scaffolded
- **Prisma schema** (`backend/prisma/schema.prisma`) — every table from the architecture doc: businesses, outlets, staff, menu items, stock items + transactions, orders, payments, expenses, and an `AiEmbedding` table for RAG (pgvector).
- **Backend modules** (`backend/src/modules/`): `auth`, `catalog`, `inventory` (working stock-in logic with weighted-average costing), `billing` (order → KOT → close flow), `reports` (a real Profit & Loss calculation), `ai-scan` (Gemini Vision menu extraction), `assistant` (RAG skeleton that reuses the P&L engine).
- **Mobile app** (`mobile/app/`): tab layout matching the reference screenshots (Home / Items / Reports / More), a Scan-Menu screen, and an AI Assistant chat screen.

Everything marked `// TODO` is a deliberate stub — the shape/flow is right, the specific
implementation (password hashing, S3 upload, pgvector query, date-range parsing) is next.

## 1. Backend setup

```bash
cd backend
cp .env.example .env        # then fill in DATABASE_URL, GEMINI_API_KEY, etc.
npm install
```

You need a **PostgreSQL database with the `pgvector` extension** available (needed for the
RAG assistant). Easiest local option — Docker:

```bash
docker run --name dukan-desk-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d pgvector/pgvector:pg16
```

Then create the database and enable the extension:

```bash
docker exec -it dukan-desk-pg psql -U postgres -c "CREATE DATABASE dukan_desk;"
docker exec -it dukan-desk-pg psql -U postgres -d dukan_desk -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Run migrations and start the API:

```bash
npx prisma migrate dev --name init
npm run start:dev
# API now on http://localhost:3000/api
```

You'll also want Redis running locally for the job queue (menu-scan processing, embedding indexing):

```bash
docker run --name dukan-desk-redis -p 6379:6379 -d redis:7
```

## 2. Mobile app setup

```bash
cd mobile
npm install
npx expo install   # aligns native deps with your Expo SDK version
npm start
```

Set `EXPO_PUBLIC_API_URL` (in an `.env` or `app.json` `extra` field) to your backend's
address — use your machine's LAN IP (not `localhost`) if testing on a physical device,
e.g. `http://192.168.1.5:3000/api`.

## 3. Suggested next steps (in order)
1. Implement `auth.service.ts` (bcrypt hashing + JWT issuance) — everything else needs a logged-in `businessId`/`outletId`.
2. Replace the hard-coded `REPLACE_WITH_ACTIVE_OUTLET_ID` placeholders in the mobile screens with real values from an auth/session store.
3. Wire real S3 upload for menu photos before calling `/ai-scan/menu`.
4. Add the pgvector similarity-search raw query in `assistant.service.ts` (Prisma doesn't have native vector ops — use `$queryRaw`).
5. Build out the billing screen (table selection, add items, KOT, close) — the backend endpoints already exist in `billing.controller.ts`.
