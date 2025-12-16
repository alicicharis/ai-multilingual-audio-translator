import { unwrap } from '@/lib/utils';
import { Database, Tables } from '../../database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export const createTranslationJob = async (
  supabase: SupabaseClient<Database>,
  {
    mediaFileId,
    targetLanguage,
    userId,
  }: { mediaFileId: string; targetLanguage: string; userId: string }
) => {
  return unwrap(
    await supabase
      .from('translation_jobs')
      .insert({
        media_file_id: mediaFileId,
        target_language: targetLanguage,
        user_id: userId,
        voice_mode: 'new_voice',
        status: 'queued',
        gpt_model: 'gpt-4o-transcribe',
        whisper_model: 'whisper-1',
        tts_provider: 'eleven_labs',
      })
      .select()
      .single()
  );
};

export type TranslationJobWithMedia = Tables<'translation_jobs'> & {
  media_files: Pick<Tables<'media_files'>, 'original_filename'> | null;
};

export const getTranslationJobs = async (
  supabase: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  return unwrap(
    await supabase
      .from('translation_jobs')
      .select('*, media_files(original_filename)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  );
};
