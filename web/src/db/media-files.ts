import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';
import { Database } from '../../database.types';

type MediaFileInsert = Database['public']['Tables']['media_files']['Insert'];

export const getMediaFiles = async (
  supabase: SupabaseClient<Database>,
  userId: string
) => {
  return unwrap(
    await supabase
      .from('media_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  );
};

export const createMediaFile = async (
  supabase: SupabaseClient<Database>,
  payload: MediaFileInsert
) => {
  return unwrap(await supabase.from('media_files').insert(payload));
};

export const deleteMediaFile = async (
  supabase: SupabaseClient<Database>,
  id: string,
  userId: string
) => {
  return unwrap(
    await supabase
      .from('media_files')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
  );
};
