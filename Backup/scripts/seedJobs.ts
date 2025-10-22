import 'dotenv/config';
import { z } from 'zod';
import { getSupabaseServiceClient } from '../src/lib/supabaseService';

const envSchema = z.object({
  SUPABASE_DEMO_USER_ID: z.string().uuid(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('[seed] Missing SUPABASE_DEMO_USER_ID', env.error.flatten().fieldErrors);
  process.exit(1);
}

const supabase = getSupabaseServiceClient();

const sampleJobs = [
  {
    company: 'Atlas Robotics',
    role: 'Senior AI Product Manager',
    location: 'Remote - US',
    remote: true,
    job_type: 'Full-time',
    seniority: 'Senior',
    description:
      'Lead cross-functional AI initiatives across our robotics platform. Define product roadmaps and partner with research teams.',
    url: 'https://example.com/jobs/atlas-ai-pm',
    keywords: ['AI', 'Product', 'Robotics'],
    matches: [
      {
        status: 'Interviewing',
        priority: 'High',
        fit_score: 84,
        tags: ['AI', 'Product', 'Remote-first'],
        notes: [
          'Panel interview scheduled Friday',
          'Hiring manager loves quant storytelling',
        ],
        tasks: [
          {
            title: 'Send thank-you recap & attach roadmap artifact',
            category: 'Follow-up',
            due_at: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
            status: 'scheduled',
            auto_generated: true,
          },
        ],
      },
    ],
  },
  {
    company: 'Northwind Labs',
    role: 'Lead Platform Strategist',
    location: 'Austin, TX',
    remote: false,
    job_type: 'Full-time',
    seniority: 'Lead',
    description:
      'Grow and optimize platform adoption across enterprise partners. Collaborate with GTM to design activation playbooks.',
    url: 'https://example.com/jobs/northwind-platform',
    keywords: ['Platform', 'Strategy'],
    matches: [
      {
        status: 'Applied',
        priority: 'Medium',
        fit_score: 74,
        tags: ['Platform', 'Growth'],
        notes: ['Referred by alumni', 'Needs follow-up to recruiter on availability'],
        tasks: [
          {
            title: 'Automate recruiter follow-up email with metrics',
            category: 'Outreach',
            due_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
            status: 'pending',
            auto_generated: true,
          },
        ],
      },
    ],
  },
  {
    company: 'Lighthouse Health',
    role: 'Director of Product Operations',
    location: 'Boston, MA (Hybrid)',
    remote: false,
    job_type: 'Full-time',
    seniority: 'Director',
    description:
      'Scale product operations for our care delivery platform. Build systems that empower teams to ship faster with higher quality.',
    url: 'https://example.com/jobs/lighthouse-product-ops',
    keywords: ['Healthcare', 'Operations'],
    matches: [
      {
        status: 'Prospecting',
        priority: 'High',
        fit_score: 68,
        tags: ['Healthcare', 'Operations'],
        notes: ['Need warm intro via LinkedIn group', 'Map product suite before outreach'],
        tasks: [
          {
            title: 'Build persona map & generate custom outreach sequence',
            category: 'Research',
            due_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            status: 'pending',
            auto_generated: false,
          },
        ],
      },
    ],
  },
];

async function seed() {
  console.log('[seed] inserting sample jobs');

  for (const job of sampleJobs) {
    const { data: posting, error: postingError } = await supabase
      .from('job_postings')
      .insert({
        owner_id: env.data.SUPABASE_DEMO_USER_ID,
        company: job.company,
        role: job.role,
        location: job.location,
        remote: job.remote,
        job_type: job.job_type,
        seniority: job.seniority,
        description: job.description,
        url: job.url,
        keywords: job.keywords,
      })
      .select()
      .single();

    if (postingError) {
      console.error('[seed] posting error', postingError);
      continue;
    }

    for (const match of job.matches) {
      const { data: jobMatch, error: matchError } = await supabase
        .from('job_matches')
        .insert({
          posting_id: posting.id,
          user_id: env.data.SUPABASE_DEMO_USER_ID,
          status: match.status,
          priority: match.priority,
          fit_score: match.fit_score,
          tags: match.tags,
          notes: match.notes,
          last_touchpoint: new Date().toISOString(),
          follow_up_at: match.tasks[0]?.due_at ?? null,
        })
        .select()
        .single();

      if (matchError) {
        console.error('[seed] match error', matchError);
        continue;
      }

      if (match.tasks?.length) {
        const { error: tasksError } = await supabase.from('tasks').insert(
          match.tasks.map((task) => ({
            match_id: jobMatch.id,
            title: task.title,
            category: task.category,
            due_at: task.due_at,
            status: task.status,
            auto_generated: task.auto_generated,
          })),
        );

        if (tasksError) {
          console.error('[seed] tasks error', tasksError);
        }
      }
    }
  }

  console.log('[seed] done');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
