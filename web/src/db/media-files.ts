import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';
import { Database } from '../../database.types';

export const getMediaFiles = async (
  supabase: SupabaseClient<Database>,
  { userId }: { userId: string }
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
  {
    userId,
    sourceUrl,
    originalFilename,
    fileName,
    durationSeconds,
    mediaType,
  }: {
    userId: string;
    sourceUrl: string;
    originalFilename: string;
    fileName: string;
    durationSeconds: number;
    mediaType: 'audio';
  }
) => {
  return unwrap(
    await supabase.from('media_files').insert({
      user_id: userId,
      source_url: sourceUrl,
      file_name: fileName,
      media_type: mediaType,
      original_filename: originalFilename,
      duration_seconds: durationSeconds,
    })
  );
};
