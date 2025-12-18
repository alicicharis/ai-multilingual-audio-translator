import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';
import { Database, Tables } from '../../database.types';

type SubscriptionInsert =
  Database['public']['Tables']['subscriptions']['Insert'];
type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];

export type UserSubscription = Tables<'subscriptions'> & {
  plans: Pick<Tables<'plans'>, 'id' | 'name'>;
};

export const getSubscriptionById = async (
  supabase: SupabaseClient<Database>,
  subscriptionId: string
) => {
  return unwrap(
    await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single()
  );
};

export const createSubscription = async (
  supabase: SupabaseClient<Database>,
  payload: SubscriptionInsert
) => {
  return unwrap(await supabase.from('subscriptions').insert(payload));
};

export const updateSubscription = async (
  supabase: SupabaseClient<Database>,
  stripeSubscriptionId: string,
  payload: Partial<SubscriptionRow>
) => {
  return unwrap(
    await supabase
      .from('subscriptions')
      .update(payload)
      .eq('stripe_subscription_id', stripeSubscriptionId)
  );
};

export const getUserSubscription = async (
  supabase: SupabaseClient<Database>,
  userId: string
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

export const upsertSubscription = async (
  supabase: SupabaseClient<Database>,
  payload: SubscriptionInsert
) => {
  return unwrap(
    await supabase.from('subscriptions').upsert(payload, {
      onConflict: 'stripe_subscription_id',
    })
  );
};
