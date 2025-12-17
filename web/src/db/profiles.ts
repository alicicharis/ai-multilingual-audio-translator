import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';
import { Database } from '../../database.types';

export const updateProfile = async (
  supabase: SupabaseClient<Database>,
  {
    profileId,
    payload,
  }: {
    profileId: string;
    payload: Partial<Database['public']['Tables']['profiles']['Row']>;
  }
) => {
  return unwrap(
    await supabase
      .from('profiles')
      .update({ ...payload })
      .eq('id', profileId)
      .select()
      .maybeSingle()
  );
};
