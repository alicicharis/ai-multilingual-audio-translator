import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '@/lib/utils';
import { Database } from '../../database.types';

export const createSubscription = async (
  supabase: SupabaseClient<Database>,
  {
    userId,
    planId,
    subscriptionId,
  }: { userId: string; planId: string; subscriptionId: string }
) => {
  return unwrap(
    await supabase
      .from('subscriptions')
      .insert({
        status: 'active',
        plan_id: planId,
        stripe_subscription_id: subscriptionId,
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
