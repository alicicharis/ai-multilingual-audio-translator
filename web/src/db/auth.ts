import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';

export const signUpUser = async (
  supabase: SupabaseClient,
  {
    email,
    password,
    username,
  }: { email: string; password: string; username: string }
) => {
  return unwrap(
    await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
        },
      },
    })
  );
};

export const signInUser = async (
  supabase: SupabaseClient,
  { email, password }: { email: string; password: string }
) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};
