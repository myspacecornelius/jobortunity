# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Job Search Automation Hub - A React + Vite application that transforms job searches into an AI-assisted control center. The app functions as a minimalist pipeline manager for job opportunities, with optional live Supabase backend integration and OpenAI-powered automation insights.

## Key Commands

### Development
```bash
# Install dependencies
npm install

# Start the client (Vite dev server)
npm run dev

# Start the AI/API helper server (Express + OpenAI)
npm run dev:server

# Build production bundle (includes TypeScript compilation)
npm run build

# Preview production build locally
npm run preview
```

### Database & Seeding
```bash
# Seed Supabase with sample dataset (requires service role key)
npm run seed:supabase

# Ingest real job postings from public Greenhouse boards
npm run ingest:greenhouse -- <board-token>
# Example: npm run ingest:greenhouse -- stripe
```

## Architecture

### Frontend Stack
- **React 18** with TypeScript for UI components
- **Vite** for fast development and optimized builds
- **TanStack Query** for server state management and caching
- **Tailwind CSS** + Framer Motion for styling and animations
- **Lucide React** for consistent iconography

### Backend Architecture
- **Supabase** (PostgreSQL + pgvector) for job postings, matches, and task data
- **Express server** (`server/index.ts`) providing OpenAI-powered endpoints:
  - `/api/fit-score` - Job-resume compatibility analysis
  - `/api/outreach` - Personalized outreach message generation
  - `/api/resume-tailor` - Resume optimization for specific roles
  - `/api/interview-prep` - Interview preparation materials
- **Row Level Security** implemented for multi-user data isolation

### Component Structure
Components follow domain-first organization:
- `src/components/jobs/` - Job listing, details, and match cards
- `src/components/automation/` - Automation playbooks and outreach templates
- `src/components/dashboard/` - Pipeline metrics and analytics
- `src/components/pipeline/` - Sidebar navigation and filtering
- `src/components/auth/` - Authentication gates and flows
- `src/components/common/` - Reusable UI components

### Data Flow
- **Local Mode**: Uses fallback data arrays when Supabase credentials absent
- **Remote Mode**: Live Supabase integration with auth-scoped queries
- **Hybrid Operation**: Seamless fallback between modes based on environment

### Key Hooks
- `useJobMatches()` - Fetches and manages job match data with TanStack Query
- `useJobMutations()` - Handles stage updates, task status changes, and follow-up scheduling
- `useAuth()` - Manages Supabase authentication state
- `useFitScore()` - Integrates with OpenAI fit score API

## Database Schema

### Core Tables
- `job_postings` - Job listing data with company, role, location, description
- `job_matches` - User-specific job applications with status, priority, fit scores
- `tasks` - Action items linked to job matches (auto-generated and manual)
- `job_sources` - External job board integrations

### Key Relationships
- One-to-many: job_postings → job_matches
- One-to-many: job_matches → tasks
- User isolation via RLS policies on `auth.uid()`

## Scripts & Automation

### Seeding (`scripts/seedJobs.ts`)
Populates Supabase with sample job postings, matches, and tasks using the demo user ID. Creates realistic pipeline data for development.

### Greenhouse Ingestion (`scripts/ingestGreenhouse.ts`)
Fetches job postings from public Greenhouse job boards and creates matches for the automation user. Supports incremental updates.

### Worker Process (`server/ingestWorker.ts`)
Webhook endpoint for cron-triggered job ingestion. Requires `x-worker-secret` header matching `WORKER_SHARED_SECRET`.

## Environment Variables

### Required for Supabase Integration
```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"
SUPABASE_DEMO_USER_ID="demo-user-uuid"
SUPABASE_AUTOMATION_USER_ID="automation-user-uuid"
```

### Required for AI Features
```bash
OPENAI_API_KEY="sk-..."
VITE_API_BASE_URL="http://localhost:8787"
```

### Optional Worker Configuration
```bash
WORKER_PORT=8989
WORKER_SHARED_SECRET="generate-a-long-random-secret"
```

## Development Notes

- The app operates entirely on seeded data when Supabase variables are missing
- Magic link authentication requires user creation in Supabase dashboard
- TypeScript strict mode enabled with ES2020 target
- Express server can be deployed separately (Render/Fly) or converted to serverless functions
- RLS policies ensure data isolation - run `psql -f supabase/schema.sql` after schema changes
- Component props are strongly typed using interfaces from `src/types/job.ts`

## Testing & Validation

- No specific test framework configured - add as needed for your testing approach
- OpenAI API responses include Zod validation schemas
- Express endpoints validate requests using Zod schemas
- Environment variables validated on server startup