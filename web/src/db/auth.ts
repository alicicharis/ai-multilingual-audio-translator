import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';

export const signUpUser = async (
  supabase: SupabaseClient,
  email: string,
  password: string,
  username: string
) => {
  return unwrap(
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })
  );
};

export const signInUser = async (
  supabase: SupabaseClient,
  email: string,
  password: string
) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};
