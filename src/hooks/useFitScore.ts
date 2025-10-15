import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

const fitScoreSchema = z.object({
  fit_score: z.number().min(0).max(100),
  recommendations: z.array(z.string()).optional().default([]),
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
  body: z.string(),
});

interface OutreachPayload {
  company: string;
  role: string;
  tone?: string;
}

export const useOutreachGenerator = () =>
  useMutation({
    mutationFn: async ({ company, role, tone }: OutreachPayload) => {
      const response = await axios.post(`${baseUrl}/api/outreach`, {
        company,
        role,
        tone,
      });

      return outreachSchema.parse(response.data);
    },
  });
