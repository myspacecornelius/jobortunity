# Job Search Automation App – Project Plan

## Product Scope

- **Target users**: Job seekers aiming for senior IC/lead roles, prioritizing efficient pipeline management and high-touch outreach; secondary users include power networkers coordinating referrals.
- **Primary jobs-to-be-done**
  - Discover high-fit roles without manually scanning multiple boards.
  - Track application pipeline with automated nudges and preparation workflows.
  - Generate personalized outreach, follow-ups, and interview prep collateral with AI.
  - Automate routine form filling and scheduling to reduce repetitive effort.
- **MVP user journeys**
  1. Import leads from monitored boards → score/filter → add to pipeline.
  2. Track status per lead, receive automated task queue, mark progress.
  3. Launch AI playbooks (outreach, follow-up, prep) per lead and save outputs.
  4. Autofill applications via stored resume/profile data with user confirmation.
- **Key success metrics**
  - Time saved vs. manual search and tracking.
  - Increased response/interview rate from AI-assisted outreach.
  - Completion rate of recommended tasks and automations.
- **Non-goals (phase 1)**
  - End-to-end resume builder or career coaching marketplace.
  - Company-facing ATS or recruiter tooling.
  - Automated negotiation agents without human review.

## Infrastructure Proposal

- **Frontend**: Vite + React + TypeScript (existing) with Tailwind and Framer Motion for UI polish.
- **State management**: Zustand or Redux Toolkit Query for client cache; TanStack Query for server data.
- **Backend**: Node.js (NestJS or Express + tRPC) running on serverless (Vercel/Render) or containerized (Fly.io).
- **Database**: Postgres (Supabase or Neon) with Prisma/Drizzle as ORM; leverage row level security for multi-user support.
- **Background jobs**: Worker queue (BullMQ on Redis or Supabase Functions) processing scraping and application automation steps.
- **AI services**: OpenAI for text generation, embeddings, and structured responses via function calling.
- **Automation stack**: Playwright for RPA-style job portal submissions; integrations with Zapier/N8N for calendar sync while email automation is deferred.
- **Experience layer**: Framer Motion for micro-interactions, Radix UI or shadcn/ui for accessible primitives, and React Day Picker for scheduling inputs.
- **Deployment**: Dotenv locally and platform-managed secrets (e.g., Supabase/Vercel) once environments are needed.

## Frontend Refactor Roadmap

1. **Component decomposition**
   - Split current `App.tsx` into `PipelineSidebar`, `JobDetail`, `TaskList`, `AutomationPanel`, `MetricsOverview`.
   - Extract shared atoms (tag chips, status pills, cards) to `src/components/common`.
2. **Routing & layout**
   - Introduce React Router with layout route (`/jobs/:id`, `/automation`, `/settings`).
   - Add persistent nav/sidebar, support responsive mobile layout.
3. **State layer**
   - Implement Zustand store for pipeline state (jobs, tasks, templates) with selectors.
   - Integrate TanStack Query to sync with backend once APIs exist; keep optimistic updates.
4. **Forms & validation**
   - Utilize React Hook Form + Zod schemas for job creation, automation configs.
5. **Design system**
   - Configure Tailwind theme tokens (colors, spacing) and create reusable `Button`, `Card`, `Badge`, `Modal`.
6. **Testing & QA**
   - Add Vitest + Testing Library; write smoke tests for critical flows (adding job, updating stage).

## Data Integration & Automation Strategy

- **Job feed ingestion**
  - Set up fetchers per source (LinkedIn, Indeed, Wellfound). Use APIs where available; otherwise, nightly Playwright scrapes behind proxies.
  - Normalize postings into canonical schema (`JobPosting` table) with dedupe heuristics (company + role + location hash).
  - Run embeddings to tag role, seniority, keywords; rank by fit vs. user preferences.
- **Persistence model**
  - Core tables: `users`, `job_postings`, `job_leads` (user saved), `tasks`, `automations`, `templates`, `activity_log`.
  - Store AI outputs/versioning in `documents` table with refs to source lead + prompt metadata.
- **Automation pipeline**
  - Workflow engine (Temporal or lightweight state machine) orchestrates sequences: monitor → notify → queue tasks → execute RPA.
  - Provide approval checkpoints before sending emails or submitting applications; log artifacts and status.
- **Integrations**
  - Calendar (Google/Microsoft) for interview scheduling and reminders.
  - Email automations will be layered in once core pipeline and approvals are stable.
  - Cloud storage (S3/Supabase Storage) for resumes, cover letters, prep docs.
