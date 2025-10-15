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

async function generateJsonResponse(prompt: string, model = 'gpt-4o-mini') {
  const response = await openai.responses.create({
    model,
    input: prompt,
    response_format: { type: 'json_object' },
  });

  const output = response.output_text;
  return JSON.parse(output);
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/fit-score', async (req, res) => {
  try {
    const { jobDescription, resumeHighlights } = req.body as {
      jobDescription: string;
      resumeHighlights: string;
    };

    const prompt = `You are an executive career copilot. Compare the job description and candidate highlights below and respond with JSON containing: fit_score (0-100), summary (string), top_skills (array of strings), gaps (array of strings), risks (array of strings), recommended_actions (array of strings).
Job description: ${jobDescription}
Candidate highlights: ${resumeHighlights}`;

    const json = await generateJsonResponse(prompt);
    res.json(json);
  } catch (error) {
    console.error('[fit-score] error', error);
    res.status(500).json({ error: 'Failed to generate fit score' });
  }
});

app.post('/api/outreach', async (req, res) => {
  try {
    const { company, role, tone, callToAction, persona } = req.body as {
      company: string;
      role: string;
      tone?: string;
      callToAction?: string;
      persona?: string;
    };

    const prompt = `You help craft personalised outreach messages. Return JSON with fields: subject, preview, body. Tone: ${tone ?? 'warm, professional'}. Call to action: ${callToAction ?? 'request a short intro call'}. Persona/context: ${persona ?? 'product leader who cares about metrics and collaboration'}. Role: ${role} at ${company}. Body should be <= 170 words.`;

    const json = await generateJsonResponse(prompt, 'gpt-4o-mini');
    res.json(json);
  } catch (error) {
    console.error('[outreach] error', error);
    res.status(500).json({ error: 'Failed to generate outreach' });
  }
});

app.post('/api/resume-tailor', async (req, res) => {
  try {
    const { jobDescription, resume, focusAreas } = req.body as {
      jobDescription: string;
      resume: string;
      focusAreas?: string;
    };

    const prompt = `You tailor resumes into impact bullets. Produce JSON with fields: summary (string), bullets (array of objects {headline, detail}), keywords (array of strings). Focus areas: ${focusAreas ?? 'product impact, metrics, leadership'}.
Job description: ${jobDescription}
Resume source: ${resume}`;

    const json = await generateJsonResponse(prompt, 'gpt-4o-mini');
    res.json(json);
  } catch (error) {
    console.error('[resume-tailor] error', error);
    res.status(500).json({ error: 'Failed to tailor resume' });
  }
});

app.post('/api/interview-prep', async (req, res) => {
  try {
    const { company, role, jobDescription, experienceHighlights } = req.body as {
      company: string;
      role: string;
      jobDescription: string;
      experienceHighlights?: string;
    };

    const prompt = `You create interview prep kits. Respond with JSON containing: warmups (array of strings), questions (array of strings), star_stories (array of objects {prompt, outline}). Company: ${company}. Role: ${role}. Job description: ${jobDescription}. Candidate highlights: ${experienceHighlights ?? 'seasoned operator with cross-functional leadership experience'}.`;

    const json = await generateJsonResponse(prompt, 'gpt-4o-mini');
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
