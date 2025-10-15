import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
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

const configuration = new Configuration({ apiKey: env.data.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/fit-score', async (req, res) => {
  try {
    const { jobDescription, resumeHighlights } = req.body as {
      jobDescription: string;
      resumeHighlights: string;
    };

    const prompt = `You are a career agent. Given a job description and candidate highlights, respond in JSON with fields: fit_score (0-100) and recommendations (array of 3 bullet strings).\nJob Description: ${jobDescription}\nCandidate Highlights: ${resumeHighlights}`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    });

    const message = completion.data.choices[0]?.message?.content ?? '{}';
    res.json(JSON.parse(message));
  } catch (error) {
    console.error('[fit-score] error', error);
    res.status(500).json({ error: 'Failed to generate fit score' });
  }
});

app.post('/api/outreach', async (req, res) => {
  try {
    const { company, role, tone } = req.body as { company: string; role: string; tone?: string };
    const prompt = `Write a concise outreach email for a candidate applying to ${company} for a ${role} position. Tone should be ${tone ?? 'warm, professional'}. Return JSON with subject and body fields.`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const message = completion.data.choices[0]?.message?.content ?? '{}';
    res.json(JSON.parse(message));
  } catch (error) {
    console.error('[outreach] error', error);
    res.status(500).json({ error: 'Failed to generate outreach' });
  }
});

const port = env.data.PORT ? Number(env.data.PORT) : 8787;
app.listen(port, () => {
  console.log(`[server] running on http://localhost:${port}`);
});
