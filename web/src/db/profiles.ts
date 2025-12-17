import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';
import { Database, Tables } from '../../database.types';

export const getProfileById = async (
  supabase: SupabaseClient<Database>,
  { profileId }: { profileId: string }
) => {
  return unwrap(
    await supabase.from('profiles').select('*').eq('id', profileId).single()
  );
};

export type UserSubscription = Tables<'subscriptions'> & {
  plans: Pick<Tables<'plans'>, 'id' | 'name'>;
};

export const getUserSubscription = async (
  supabase: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  return unwrap(
    await supabase
      .from('subscriptions')
      .select('*, plans(id, name)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()
  );
};

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
