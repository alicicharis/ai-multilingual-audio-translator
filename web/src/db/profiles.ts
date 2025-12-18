import { unwrap } from '@/lib/utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const getUserById = async (
  supabase: SupabaseClient<Database>,
  userId: string
) => {
  return unwrap(
    await supabase.from('profiles').select('*').eq('id', userId).single()
  );
};

export const updateUser = async (
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

export const getUserByStripeCustomerId = async (
  supabase: SupabaseClient<Database>,
  stripeCustomerId: string
) => {
  return unwrap(
    await supabase
      .from('profiles')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId)
      .single()
  );
};
