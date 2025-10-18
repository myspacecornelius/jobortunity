import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(20),
  PORT: z.string().optional(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('[server] Missing OpenAI API key', env.error.flatten().fieldErrors);
  process.exit(1);
}

const openai = new OpenAI({ apiKey: env.data.OPENAI_API_KEY });

const fitScoreResponseSchema = z.object({
  fit_score: z.number().min(0).max(100),
  summary: z.string(),
  top_skills: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  recommended_actions: z.array(z.string()).default([]),
});

const outreachResponseSchema = z.object({
  subject: z.string(),
  preview: z.string().optional().default(''),
  body: z.string(),
});

const resumeResponseSchema = z.object({
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

const interviewResponseSchema = z.object({
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

const fitScoreRequestSchema = z.object({
  jobDescription: z.string().min(16),
  resumeHighlights: z.string().min(16),
});

const outreachRequestSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  tone: z.string().max(80).optional(),
  callToAction: z.string().max(120).optional(),
  persona: z.string().max(200).optional(),
});

const resumeRequestSchema = z.object({
  jobDescription: z.string().min(16),
  resume: z.string().min(16),
  focusAreas: z.string().max(160).optional(),
});

const interviewRequestSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  jobDescription: z.string().min(16),
  experienceHighlights: z.string().max(1000).optional(),
});

function extractJsonObject(raw: string) {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('OpenAI response did not include JSON object.');
  }
  return raw.slice(start, end + 1);
}

async function generateJsonResponse<T>(
  prompt: string,
  responseSchema: z.ZodSchema<T>,
  model = 'gpt-4o-mini',
) {
  const response = await openai.responses.create({
    model,
    input: prompt,
    response_format: { type: 'json_object' },
  });

  const output = response.output_text ?? '';
  const jsonPayload = extractJsonObject(output.trim());

  try {
    const parsed = JSON.parse(jsonPayload);
    return responseSchema.parse(parsed);
  } catch (error) {
    console.error('[openai] failed to parse JSON payload', { output, error });
    throw error;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/fit-score', async (req, res) => {
  try {
    const parsed = fitScoreRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const { jobDescription, resumeHighlights } = parsed.data;

    const prompt = `You are an executive career copilot. Compare the job description and candidate highlights below and respond with JSON containing: fit_score (0-100), summary (string), top_skills (array of strings), gaps (array of strings), risks (array of strings), recommended_actions (array of strings).
Job description: ${jobDescription}
Candidate highlights: ${resumeHighlights}`;

    const json = await generateJsonResponse(prompt, fitScoreResponseSchema);
    res.json(json);
  } catch (error) {
    console.error('[fit-score] error', error);
    res.status(500).json({ error: 'Failed to generate fit score' });
  }
});

app.post('/api/outreach', async (req, res) => {
  try {
    const parsed = outreachRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { company, role, tone, callToAction, persona } = parsed.data;

    const prompt = `You help craft personalised outreach messages. Return JSON with fields: subject, preview, body. Tone: ${tone ?? 'warm, professional'}. Call to action: ${callToAction ?? 'request a short intro call'}. Persona/context: ${persona ?? 'product leader who cares about metrics and collaboration'}. Role: ${role} at ${company}. Body should be <= 170 words.`;

    const json = await generateJsonResponse(prompt, outreachResponseSchema, 'gpt-4o-mini');
    res.json(json);
  } catch (error) {
    console.error('[outreach] error', error);
    res.status(500).json({ error: 'Failed to generate outreach' });
  }
});

app.post('/api/resume-tailor', async (req, res) => {
  try {
    const parsed = resumeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { jobDescription, resume, focusAreas } = parsed.data;

    const prompt = `You tailor resumes into impact bullets. Produce JSON with fields: summary (string), bullets (array of objects {headline, detail}), keywords (array of strings). Focus areas: ${focusAreas ?? 'product impact, metrics, leadership'}.
Job description: ${jobDescription}
Resume source: ${resume}`;

    const json = await generateJsonResponse(prompt, resumeResponseSchema, 'gpt-4o-mini');
    res.json(json);
  } catch (error) {
    console.error('[resume-tailor] error', error);
    res.status(500).json({ error: 'Failed to tailor resume' });
  }
});

app.post('/api/interview-prep', async (req, res) => {
  try {
    const parsed = interviewRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { company, role, jobDescription, experienceHighlights } = parsed.data;

    const prompt = `You create interview prep kits. Respond with JSON containing: warmups (array of strings), questions (array of strings), star_stories (array of objects {prompt, outline}). Company: ${company}. Role: ${role}. Job description: ${jobDescription}. Candidate highlights: ${experienceHighlights ?? 'seasoned operator with cross-functional leadership experience'}.`;

    const json = await generateJsonResponse(prompt, interviewResponseSchema, 'gpt-4o-mini');
    res.json(json);
  } catch (error) {
    console.error('[interview-prep] error', error);
    res.status(500).json({ error: 'Failed to generate interview prep' });
  }
});

const port = env.data.PORT ? Number(env.data.PORT) : 8787;
app.listen(port, () => {
  console.log(`[server] running on http://localhost:${port}`);
});
