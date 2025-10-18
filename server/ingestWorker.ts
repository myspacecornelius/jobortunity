import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { ingestGreenhouseBoard } from '../scripts/ingestGreenhouse';

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});
app.use(limiter);

const payloadSchema = z.object({
  board: z.string().min(2),
  limit: z.number().int().positive().optional(),
});

app.post('/trigger/greenhouse', async (req, res) => {
  const data = payloadSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ error: data.error.flatten().fieldErrors });
  }

  try {
    const result = await ingestGreenhouseBoard(data.data.board, data.data.limit);
    return res.json({ status: 'ok', ...result });
  } catch (error) {
    console.error('[worker] greenhouse ingest error', error);
    return res.status(500).json({ error: 'Failed to ingest board' });
  }
});

const port = Number(process.env.WORKER_PORT ?? 8989);
app.listen(port, () => {
  console.log(`[worker] running on http://localhost:${port}`);
});
