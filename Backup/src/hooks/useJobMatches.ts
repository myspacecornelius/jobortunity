import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '../lib/supabaseClient';
import type { JobPriority, JobTask, JobTaskWithLead } from '../types/job';
import type { JobStage } from '../constants/stages';

const jobMatchSchema = z.object({
  id: z.string(),
  status: z.string(),
  priority: z.string(),
  fit_score: z.number().nullable(),
  tags: z.array(z.string()).nullable(),
  notes: z.array(z.string()).nullable(),
  last_touchpoint: z.string().nullable(),
  follow_up_at: z.string().nullable(),
  job_postings: z.object({
    id: z.string(),
    company: z.string(),
    role: z.string(),
    location: z.string().nullable(),
    remote: z.boolean().nullable(),
    job_type: z.string().nullable(),
    seniority: z.string().nullable(),
    description: z.string().nullable(),
    url: z.string().nullable(),
    keywords: z.array(z.string()).nullable(),
  }),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      category: z.string().nullable(),
      due_at: z.string().nullable(),
      status: z.string().nullable(),
      auto_generated: z.boolean(),
    }),
  ),
});

const jobMatchesSchema = z.array(jobMatchSchema);

export const useJobMatches = () =>
  useQuery({
    queryKey: ['job-matches'],
    queryFn: async () => {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('job_matches')
        .select(
          `
          id,
          status,
          priority,
          fit_score,
          tags,
          notes,
          last_touchpoint,
          follow_up_at,
          job_postings:job_postings (
            id,
            company,
            role,
            location,
            remote,
            job_type,
            seniority,
            description,
            url,
            keywords
          ),
          tasks:tasks (
            id,
            title,
            category,
            due_at,
            status,
            auto_generated
          )
        `,
        )
        .order('last_touchpoint', { ascending: false });

      if (error) throw error;
      return jobMatchesSchema.parse(data ?? []);
    },
    enabled: Boolean(supabase),
  });

export const useAddJobMatch = () =>
  useMutation({
    mutationFn: async (payload: {
      company: string;
      role: string;
      location: string;
      link?: string;
      priority: JobPriority;
      tags: string[];
    }) => {
      if (!supabase) {
        throw new Error('Supabase client not initialised');
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        throw new Error('You must be signed in to add a job');
      }

      const { data: posting, error: postingError } = await supabase
        .from('job_postings')
        .insert({
          owner_id: user.id,
          company: payload.company,
          role: payload.role,
          location: payload.location,
          url: payload.link,
          keywords: payload.tags,
        })
        .select()
        .single();

      if (postingError) throw postingError;

      const { error: matchError } = await supabase.from('job_matches').insert({
        posting_id: posting.id,
        user_id: user.id,
        priority: payload.priority,
        tags: payload.tags,
        notes: ['Added manually'],
      });

      if (matchError) throw matchError;
    },
  });

export const normalizeTasks = (
  matches: Awaited<ReturnType<typeof useJobMatches>['data']>,
): JobTaskWithLead[] => {
  if (!matches) return [];
  const statusToStage = (status: string): JobStage => {
    const normalized = status.toLowerCase();
    if (normalized.includes('apply')) return 'Applied';
    if (normalized.includes('interview')) return 'Interviewing';
    if (normalized.includes('offer')) return 'Offer';
    if (normalized.includes('hire')) return 'Hired';
    if (normalized.includes('arch')) return 'Archived';
    return 'Prospecting';
  };
  const mapCategory = (category: string | null | undefined): JobTask['category'] => {
    const normalized = (category ?? '').toLowerCase();
    if (normalized.includes('outreach')) return 'Outreach';
    if (normalized.includes('follow')) return 'Follow-up';
    if (normalized.includes('prep')) return 'Preparation';
    return 'Research';
  };

  const mapStatus = (status: string | null | undefined): JobTask['status'] => {
    const normalized = (status ?? '').toLowerCase();
    if (normalized.includes('complete')) return 'completed';
    if (normalized.includes('schedule')) return 'scheduled';
    return 'pending';
  };

  return matches.flatMap((match) =>
    match.tasks.map((task) => ({
      id: task.id,
      jobId: match.id,
      title: task.title,
      category: mapCategory(task.category),
      dueDate: task.due_at ?? new Date().toISOString(),
      status: mapStatus(task.status),
      autoGenerated: task.auto_generated,
      job: {
        id: match.job_postings.id,
        company: match.job_postings.company,
        role: match.job_postings.role,
        location: match.job_postings.location ?? 'Remote',
        link: match.job_postings.url ?? '',
        priority: (match.priority.charAt(0).toUpperCase() + match.priority.slice(1).toLowerCase()) as JobPriority,
        stage: statusToStage(match.status),
        lastTouchpoint: match.last_touchpoint ?? new Date().toISOString(),
        automationScore: match.fit_score ?? 70,
        tags: match.tags ?? [],
        notes: match.notes ?? [],
        description: match.job_postings.description ?? undefined,
      },
    })),
  );
};
