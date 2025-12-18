import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';
import { Database } from '../../database.types';

export const getPlanById = async (
  supabase: SupabaseClient<Database>,
  planId: string
) => {
  return unwrap(
    await supabase.from('plans').select('*').eq('id', planId).single()
  );
};
