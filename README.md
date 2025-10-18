# Job Search Automation Hub

A Vite + React + Tailwind project that turns curated job feeds into a minimalist, AI-assisted control center. The app can operate entirely on the seeded demo data, or connect to a live Supabase backend with OpenAI-powered insights.

## Getting Started

```bash
npm install

# start the client (Vite)
npm run dev

# optional: run the AI/API helper server in another terminal
npm run dev:server
```

The client listens on [http://localhost:5173](http://localhost:5173); the helper server defaults to [http://localhost:8787](http://localhost:8787).

Create a `.env` (or `.env.local`) with Supabase/OpenAI credentials:

```bash
# Supabase project
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_URL="https://your-project.supabase.co"              # used by scripts
SUPABASE_SERVICE_ROLE_KEY="service-role-key"                 # keep private
SUPABASE_DEMO_USER_ID="00000000-0000-0000-0000-000000000000" # used by seed script
SUPABASE_AUTOMATION_USER_ID="00000000-0000-0000-0000-000000000000" # used by ingest worker

# OpenAI + Express helper server
OPENAI_API_KEY="sk-..."
VITE_API_BASE_URL="http://localhost:8787"

# Ingest worker (optional)
WORKER_PORT=8989
WORKER_SHARED_SECRET="generate-a-long-random-secret"
```

Seed Supabase with the sample dataset (requires the service role key):

```bash
npm run seed:supabase
```

Ingest real postings from a public Greenhouse board:

```bash
npm run ingest:greenhouse -- <board-token>
# example: npm run ingest:greenhouse -- stripe
```

## Available Scripts

- `npm run dev` – start the Vite development server
- `npm run dev:server` – run the Express + OpenAI helper server
- `npm run seed:supabase` – seed Supabase with sample matches/tasks
- `npm run ingest:greenhouse` – import jobs from a Greenhouse board
- `npm run build` – type check and build the production bundle
- `npm run preview` – preview the production build locally

## Tech Stack

- React 18 with TypeScript + TanStack Query for data fetching/caching
- Supabase (Postgres + pgvector ready) for job postings, matches, and tasks
- Express helper server (`server/index.ts`) exposing `/api/fit-score` and `/api/outreach` via OpenAI GPT models
- Vite + Tailwind CSS + Framer Motion for build and UI polish

## Notes

- When Supabase env variables are present, the UI loads live matches; otherwise it falls back to local fixtures.
- Sign in uses Supabase Auth magic links. Create a user in the Supabase dashboard (or via `auth.admin`) and reuse its UUID for the `SUPABASE_DEMO_USER_ID`/`SUPABASE_AUTOMATION_USER_ID` variables.
- `scripts/seedJobs.ts` plants example postings/matches/tasks into Supabase for quick demos (writes as the demo user).
- `scripts/ingestGreenhouse.ts` upserts jobs from any public Greenhouse board and links them to matches (writes as the automation user).
- `server/ingestWorker.ts` exposes a cron-friendly webhook; include an `x-worker-secret` header matching `WORKER_SHARED_SECRET` when triggering it.
- Row Level Security now scopes every table to `auth.uid()`. Re-run `psql -f supabase/schema.sql` after pulling changes to apply the new policies and constraints.
- Components follow a domain-first structure (`src/components/jobs`, `src/components/automation`, `src/components/dashboard`, `src/components/common`).
- `server/index.ts` can be deployed separately (Render/Fly/etc.) or converted to Vercel serverless functions; set `VITE_API_BASE_URL` accordingly.
