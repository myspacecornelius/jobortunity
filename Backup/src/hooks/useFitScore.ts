import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

const fitScoreSchema = z.object({
  fit_score: z.number().min(0).max(100),
  summary: z.string(),
  top_skills: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  recommended_actions: z.array(z.string()).default([]),
});

interface FitScorePayload {
  jobDescription: string;
  resumeHighlights: string;
}

export const useFitScore = () =>
  useMutation({
    mutationFn: async ({ jobDescription, resumeHighlights }: FitScorePayload) => {
      const response = await axios.post(`${baseUrl}/api/fit-score`, {
        jobDescription,
        resumeHighlights,
      });

      return fitScoreSchema.parse(response.data);
    },
  });

const outreachSchema = z.object({
  subject: z.string(),
  preview: z.string().optional().default(''),
  body: z.string(),
});

interface OutreachPayload {
  company: string;
  role: string;
  tone?: string;
  callToAction?: string;
  persona?: string;
}

export const useOutreachGenerator = () =>
  useMutation({
    mutationFn: async ({ company, role, tone, callToAction, persona }: OutreachPayload) => {
      const response = await axios.post(`${baseUrl}/api/outreach`, {
        company,
        role,
        tone,
        callToAction,
        persona,
      });

      return outreachSchema.parse(response.data);
    },
  });

const resumeSchema = z.object({
  summary: z.string(),
  keywords: z.array(z.string()).default([]),
  bullets: z
    .array(
      z.object({
        headline: z.string(),
        detail: z.string(),
      }),
    )
    .default([]),
});

interface ResumePayload {
  jobDescription: string;
  resume: string;
  focusAreas?: string;
}

export const useResumeTailor = () =>
  useMutation({
    mutationFn: async ({ jobDescription, resume, focusAreas }: ResumePayload) => {
      const response = await axios.post(`${baseUrl}/api/resume-tailor`, {
        jobDescription,
        resume,
        focusAreas,
      });

      return resumeSchema.parse(response.data);
    },
  });

const interviewSchema = z.object({
  warmups: z.array(z.string()).default([]),
  questions: z.array(z.string()).default([]),
  star_stories: z
    .array(
      z.object({
        prompt: z.string(),
        outline: z.string(),
      }),
    )
    .default([]),
});

interface InterviewPayload {
  company: string;
  role: string;
  jobDescription: string;
  experienceHighlights?: string;
}

export const useInterviewPrep = () =>
  useMutation({
    mutationFn: async ({ company, role, jobDescription, experienceHighlights }: InterviewPayload) => {
      const response = await axios.post(`${baseUrl}/api/interview-prep`, {
        company,
        role,
        jobDescription,
        experienceHighlights,
      });

      return interviewSchema.parse(response.data);
    },
  });
