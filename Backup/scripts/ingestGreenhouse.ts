import 'dotenv/config';
import axios from 'axios';
import { z } from 'zod';
import { getSupabaseServiceClient } from '../src/lib/supabaseService';

const envSchema = z.object({
  SUPABASE_AUTOMATION_USER_ID: z.string().uuid(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('[ingest] Missing SUPABASE_AUTOMATION_USER_ID', env.error.flatten().fieldErrors);
  process.exit(1);
}

const supabase = getSupabaseServiceClient();

const jobSchema = z.object({
  id: z.number(),
  title: z.string(),
  absolute_url: z.string().url(),
  updated_at: z.string(),
  location: z.object({ name: z.string() }).nullable(),
  departments: z.array(z.object({ name: z.string() })).nullable(),
  offices: z.array(z.object({ name: z.string() })).nullable(),
  metadata: z.array(z.object({ name: z.string(), value: z.string().nullable() })).optional(),
});

type GreenhouseJob = z.infer<typeof jobSchema>;

async function upsertSource(name: string, url: string) {
  const { data, error } = await supabase
    .from('job_sources')
    .upsert({ name, url }, { onConflict: 'name' })
    .select()
    .single();

  if (error) throw error;
  return data.id as string;
}

async function upsertPosting(sourceId: string, job: GreenhouseJob) {
  const { data, error } = await supabase
    .from('job_postings')
    .upsert(
      {
        source_id: sourceId,
        external_id: job.id.toString(),
        owner_id: env.data.SUPABASE_AUTOMATION_USER_ID,
        company: 'Greenhouse Company',
        role: job.title,
        location: job.location?.name ?? 'Remote',
        url: job.absolute_url,
        keywords: [
          ...(job.departments?.map((department) => department.name) ?? []),
          ...(job.offices?.map((office) => office.name) ?? []),
        ],
        updated_at: job.updated_at,
      },
      { onConflict: 'external_id' },
    )
    .select()
    .single();

  if (error) throw error;
  return data.id as string;
}

async function ensureMatchForPosting(postingId: string) {
  const { data } = await supabase
    .from('job_matches')
    .select('id')
    .eq('posting_id', postingId)
    .eq('user_id', env.data.SUPABASE_AUTOMATION_USER_ID)
    .maybeSingle();

  if (data) return;

  const { error } = await supabase
    .from('job_matches')
    .insert({ posting_id: postingId, user_id: env.data.SUPABASE_AUTOMATION_USER_ID });
  if (error) throw error;
}

export async function ingestGreenhouseBoard(boardToken: string, limit?: number) {
  const sourceId = await upsertSource(`Greenhouse:${boardToken}`, `https://boards.greenhouse.io/${boardToken}`);

  const response = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`);
  const jobs = z.object({ jobs: z.array(jobSchema) }).parse(response.data).jobs;
  const jobsToProcess = typeof limit === 'number' ? jobs.slice(0, limit) : jobs;

  for (const job of jobsToProcess) {
    const postingId = await upsertPosting(sourceId, job);
    await ensureMatchForPosting(postingId);
  }

  return { total: jobs.length, processed: jobsToProcess.length };
}

async function main() {
  const boardToken = process.argv[2];
  if (!boardToken) {
    console.error('Usage: npm run ingest:greenhouse -- <board-token>');
    process.exit(1);
  }

  const result = await ingestGreenhouseBoard(boardToken);
  console.log('[ingest] Completed for', boardToken, result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
