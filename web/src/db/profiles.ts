import { unwrap } from '@/lib/utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const getProfileById = async (
  supabase: SupabaseClient<Database>,
  userId: string
) => {
  return unwrap(
    await supabase.from('profiles').select('*').eq('id', userId).single()
  );
};

export const updateProfile = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  payload: Partial<ProfileRow>
) => {
  return unwrap(
    await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .maybeSingle()
  );
};
