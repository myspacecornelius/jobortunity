import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { ingestGreenhouseBoard } from '../scripts/ingestGreenhouse';

const envSchema = z.object({
  WORKER_SECRET: z.string().min(32),
  WORKER_PORT: z.string().optional(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('[worker] Missing required environment variables', env.error.flatten().fieldErrors);
  process.exit(1);
}

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many worker requests, please try again later' },
});
app.use(limiter);

// Worker authentication middleware
const verifyWorkerSecret = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const workerSecret = req.headers['x-worker-secret'];
  
  if (!workerSecret || workerSecret !== env.data.WORKER_SECRET) {
    console.warn(`[worker] Unauthorized access attempt from ${req.ip} to ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized worker access' });
  }
  
  next();
};

const payloadSchema = z.object({
  board: z.string().min(2),
  limit: z.number().int().positive().optional(),
});

app.post('/trigger/greenhouse', verifyWorkerSecret, async (req, res) => {
  const data = payloadSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ error: data.error.flatten().fieldErrors });
  }

  try {
    console.log(`[worker] Starting greenhouse ingest for board: ${data.data.board}`);
    const result = await ingestGreenhouseBoard(data.data.board, data.data.limit);
    console.log(`[worker] Greenhouse ingest completed:`, result);
    return res.json({ status: 'ok', ...result });
  } catch (error) {
    console.error('[worker] greenhouse ingest error', error);
    return res.status(500).json({ error: 'Failed to ingest board' });
  }
});

const port = Number(env.data.WORKER_PORT ?? 8989);
app.listen(port, () => {
  console.log(`[worker] running on http://localhost:${port}`);
});
