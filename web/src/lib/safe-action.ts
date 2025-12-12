import { createSafeActionClient } from 'next-safe-action';
import { createClient } from './supabase/server';

export const actionClient = createSafeActionClient();

export const authActionClient = actionClient.use(async ({ next }) => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    throw new Error('User not found!');
  }

  return next({ ctx: { user: data.user } });
});
