import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

let supabaseClient:
  | ReturnType<typeof createClient>
  | undefined;

export const getSupabaseServiceClient = () => {
  if (supabaseClient) return supabaseClient;

  const env = envSchema.safeParse(process.env);

  if (!env.success) {
    throw new Error(
      `[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY: ${JSON.stringify(
        env.error.flatten().fieldErrors,
      )}`,
    );
  }

  supabaseClient = createClient(env.data.SUPABASE_URL, env.data.SUPABASE_SERVICE_ROLE_KEY);
  return supabaseClient;
};
