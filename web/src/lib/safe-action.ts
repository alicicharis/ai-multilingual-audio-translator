import { createSafeActionClient } from 'next-safe-action';
import { createClient } from './supabase/server';
import { Database } from '../../database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export const actionClient = createSafeActionClient();

export const authActionClient = actionClient.use(async ({ next }) => {
  const supabase: SupabaseClient<Database> = await createClient();

  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    throw new Error('User not found!');
  }

  return next({ ctx: { user: data.user, supabase } });
});
