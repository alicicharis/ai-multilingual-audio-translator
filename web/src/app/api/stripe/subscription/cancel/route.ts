import { getSubscriptionById } from '@/db';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { subscriptionId } = await req.json();

  const supabase = await createClient();

  const subscription = await getSubscriptionById(supabase, subscriptionId);

  if (!subscription) {
    return NextResponse.json(
      { error: 'Subscription not found' },
      { status: 404 }
    );
  }

  const cancelled = await stripe.subscriptions.update(
    subscription.stripe_subscription_id,
    {
      cancel_at_period_end: true,
    }
  );

  return NextResponse.json({ cancelled });
}
