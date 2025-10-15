import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabaseClient';
import type { JobLead, TaskStatus } from '../types/job';
import type { JobStage } from '../constants/stages';

const stageToStatus = (stage: JobStage) => stage;

const followUpForStage = (stage: JobStage) => {
  if (stage === 'Interviewing') return new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString();
  if (stage === 'Offer') return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  return null;
};

const generatedTasksForStage = (stage: JobStage, matchId: string) => {
  if (stage === 'Interviewing') {
    return [
      {
        match_id: matchId,
        title: 'Automate interview prep kit (stories + metrics)',
        category: 'Preparation',
        due_at: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
        status: 'scheduled',
        auto_generated: true,
      },
    ];
  }

  if (stage === 'Offer') {
    return [
      {
        match_id: matchId,
        title: 'Generate negotiation brief & market calibration',
        category: 'Research',
        due_at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
        status: 'pending',
        auto_generated: true,
      },
    ];
  }

  return [];
};

export const useJobMutations = () => {
  const queryClient = useQueryClient();

  const updateStage = useMutation({
    mutationFn: async ({ matchId, stage }: { matchId: string; stage: JobStage }) => {
      if (!supabase) throw new Error('Supabase not configured');

      const followUpAt = followUpForStage(stage);
      const { error } = await supabase
        .from('job_matches')
        .update({
          status: stageToStatus(stage),
          last_touchpoint: new Date().toISOString(),
          follow_up_at: followUpAt,
        })
        .eq('id', matchId);

      if (error) throw error;

      const generated = generatedTasksForStage(stage, matchId);
      if (generated.length) {
        const { error: tasksError } = await supabase.from('tasks').insert(generated);
        if (tasksError) throw tasksError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-matches'] });
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      if (!supabase) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-matches'] });
    },
  });

  const scheduleFollowUp = useMutation({
    mutationFn: async ({ matchId, job }: { matchId: string; job: JobLead }) => {
      if (!supabase) throw new Error('Supabase not configured');

      const dueDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString();

      const { error } = await supabase
        .from('job_matches')
        .update({ follow_up_at: dueDate })
        .eq('id', matchId);

      if (error) throw error;

      const { error: taskError } = await supabase.from('tasks').insert({
        match_id: matchId,
        title: `Follow up with ${job.company} about ${job.role}`,
        category: 'Follow-up',
        due_at: dueDate,
        status: 'scheduled',
        auto_generated: true,
      });

      if (taskError) throw taskError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-matches'] });
    },
  });

  return { updateStage, updateTaskStatus, scheduleFollowUp };
};
