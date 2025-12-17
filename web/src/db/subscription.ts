import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';
import { Database } from '../../database.types';

export const getSubscriptionById = async (
  supabase: SupabaseClient<Database>,
  { subscriptionId }: { subscriptionId: string }
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
  {
    userId,
    planId,
    stripeSubscriptionId,
  }: { userId: string; planId: string; stripeSubscriptionId: string }
) => {
  return unwrap(
    await supabase
      .from('subscriptions')
      .insert({
        status: 'active',
        plan_id: planId,
        stripe_subscription_id: stripeSubscriptionId,
        user_id: userId,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        cancel_at_period_end: false,
      })
      .select()
      .single()
  );
};

export const updateSubscription = async (
  supabase: SupabaseClient<Database>,
  {
    stripeSubscriptionId,
    payload,
  }: {
    stripeSubscriptionId: string;
    payload: Partial<Database['public']['Tables']['subscriptions']['Row']>;
  }
) => {
  return unwrap(
    await supabase
      .from('subscriptions')
      .update(payload)
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .select()
      .single()
  );
};
