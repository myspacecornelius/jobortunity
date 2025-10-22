import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: any;
    }
  }
}

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(20),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),
  API_SECRET_KEY: z.string().min(32).optional(),
  PORT: z.string().optional(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('[server] Missing OpenAI API key', env.error.flatten().fieldErrors);
  process.exit(1);
}

const openai = new OpenAI({ apiKey: env.data.OPENAI_API_KEY });

const supabase = env.data.SUPABASE_URL && env.data.SUPABASE_ANON_KEY 
  ? createClient(env.data.SUPABASE_URL, env.data.SUPABASE_ANON_KEY)
  : null;

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: { error: 'Too many API requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced request tracking with structured logging
const requestInstrumentation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const startTime = Date.now();
  const bodySize = JSON.stringify(req.body || {}).length;
  const timestamp = new Date().toISOString();
  
  // Structured request log
  const requestLog = {
    timestamp,
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent']?.substring(0, 50) || 'unknown',
    ip: req.ip,
    bodySize,
    hasAuth: !!req.headers.authorization
  };
  
  console.log(`[REQUEST] ${JSON.stringify(requestLog)}`);
  
  if (bodySize > 10000) { // 10KB limit
    console.warn(`[LARGE_REQUEST] ${req.path} - ${bodySize} bytes from ${req.ip}`);
  }
  
  // Response time tracking
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseLog = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip
    };
    
    if (duration > 5000) {
      console.warn(`[SLOW_REQUEST] ${JSON.stringify(responseLog)}`);
    } else {
      console.log(`[RESPONSE] ${JSON.stringify(responseLog)}`);
    }
  });
  
  next();
};

// JWT verification middleware
const verifyAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];
  
  // Allow API key authentication as fallback
  if (apiKey && env.data.API_SECRET_KEY && apiKey === env.data.API_SECRET_KEY) {
    return next();
  }
  
  // JWT verification with Supabase
  if (!authHeader?.startsWith('Bearer ') || !supabase || !env.data.SUPABASE_JWT_SECRET) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.slice(7);
  
  try {
    const decoded = jwt.verify(token, env.data.SUPABASE_JWT_SECRET) as any;
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

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

async function generateJsonResponse<T>(
  prompt: string,
  responseSchema: z.ZodSchema<T>,
  model = 'gpt-4o-mini',
  requestId?: string,
) {
  const startTime = Date.now();
  
  try {
    const requestLog = {
      timestamp: new Date().toISOString(),
      requestId: requestId || 'unknown',
      model,
      promptLength: prompt.length,
      operation: 'openai_request'
    };
    console.log(`[OPENAI_REQUEST] ${JSON.stringify(requestLog)}`);
    
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { 
        type: 'json_schema',
        json_schema: {
          name: 'response',
          schema: zodToJsonSchema(responseSchema),
        }
      },
    });

    const latency = Date.now() - startTime;
    const usage = response.usage;
    
    const responseLog = {
      timestamp: new Date().toISOString(),
      requestId: requestId || 'unknown',
      model,
      latency,
      promptTokens: usage?.prompt_tokens || 0,
      completionTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0,
      operation: 'openai_response'
    };
    console.log(`[OPENAI_RESPONSE] ${JSON.stringify(responseLog)}`);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);
    return responseSchema.parse(parsed);
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorLog = {
      timestamp: new Date().toISOString(),
      requestId: requestId || 'unknown',
      model,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'openai_error'
    };
    console.error(`[OPENAI_ERROR] ${JSON.stringify(errorLog)}`);
    throw error;
  }
}

// Helper to convert Zod schema to JSON Schema (basic implementation)
function zodToJsonSchema(schema: z.ZodSchema): any {
  // This is a simplified implementation - in production, use zod-to-json-schema library
  return {
    type: 'object',
    additionalProperties: true
  };
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(apiLimiter);
app.use(requestInstrumentation);

// Add request ID for tracing
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

app.post('/api/fit-score', verifyAuth, async (req, res) => {
  try {
    const parsed = fitScoreRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorLog = {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        endpoint: '/api/fit-score',
        error: 'validation_failed',
        details: parsed.error.flatten().fieldErrors
      };
      console.error(`[VALIDATION_ERROR] ${JSON.stringify(errorLog)}`);
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const { jobDescription, resumeHighlights } = parsed.data;

    const prompt = `You are an executive career copilot. Compare the job description and candidate highlights below and respond with JSON containing: fit_score (0-100), summary (string), top_skills (array of strings), gaps (array of strings), risks (array of strings), recommended_actions (array of strings).
Job description: ${jobDescription}
Candidate highlights: ${resumeHighlights}`;

    const json = await generateJsonResponse(prompt, fitScoreResponseSchema, 'gpt-4o-mini', req.requestId);
    res.json(json);
  } catch (error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      endpoint: '/api/fit-score',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    };
    console.error(`[ENDPOINT_ERROR] ${JSON.stringify(errorLog)}`);
    res.status(500).json({ error: 'Failed to generate fit score' });
  }
});

app.post('/api/outreach', verifyAuth, async (req, res) => {
  try {
    const parsed = outreachRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { company, role, tone, callToAction, persona } = parsed.data;

    const prompt = `You help craft personalised outreach messages. Return JSON with fields: subject, preview, body. Tone: ${tone ?? 'warm, professional'}. Call to action: ${callToAction ?? 'request a short intro call'}. Persona/context: ${persona ?? 'product leader who cares about metrics and collaboration'}. Role: ${role} at ${company}. Body should be <= 170 words.`;

    const json = await generateJsonResponse(prompt, outreachResponseSchema, 'gpt-4o-mini', req.requestId);
    res.json(json);
  } catch (error) {
    console.error('[outreach] error', error);
    res.status(500).json({ error: 'Failed to generate outreach' });
  }
});

app.post('/api/resume-tailor', verifyAuth, async (req, res) => {
  try {
    const parsed = resumeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { jobDescription, resume, focusAreas } = parsed.data;

    const prompt = `You tailor resumes into impact bullets. Produce JSON with fields: summary (string), bullets (array of objects {headline, detail}), keywords (array of strings). Focus areas: ${focusAreas ?? 'product impact, metrics, leadership'}.
Job description: ${jobDescription}
Resume source: ${resume}`;

    const json = await generateJsonResponse(prompt, resumeResponseSchema, 'gpt-4o-mini', req.requestId);
    res.json(json);
  } catch (error) {
    console.error('[resume-tailor] error', error);
    res.status(500).json({ error: 'Failed to tailor resume' });
  }
});

app.post('/api/interview-prep', verifyAuth, async (req, res) => {
  try {
    const parsed = interviewRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { company, role, jobDescription, experienceHighlights } = parsed.data;

    const prompt = `You create interview prep kits. Respond with JSON containing: warmups (array of strings), questions (array of strings), star_stories (array of objects {prompt, outline}). Company: ${company}. Role: ${role}. Job description: ${jobDescription}. Candidate highlights: ${experienceHighlights ?? 'seasoned operator with cross-functional leadership experience'}.`;

    const json = await generateJsonResponse(prompt, interviewResponseSchema, 'gpt-4o-mini', req.requestId);
    res.json(json);
  } catch (error) {
    console.error('[interview-prep] error', error);
    res.status(500).json({ error: 'Failed to generate interview prep' });
  }
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    operation: 'global_error_handler'
  };
  console.error(`[GLOBAL_ERROR] ${JSON.stringify(errorLog)}`);
  
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
});

const port = env.data.PORT ? Number(env.data.PORT) : 8787;
app.listen(port, () => {
  const startupLog = {
    timestamp: new Date().toISOString(),
    port,
    env: process.env.NODE_ENV || 'development',
    operation: 'server_startup'
  };
  console.log(`[SERVER_START] ${JSON.stringify(startupLog)}`);
});
