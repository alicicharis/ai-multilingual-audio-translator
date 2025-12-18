import {
  getPlanByStripePriceId,
  getUserByStripeCustomerId,
  updateSubscription,
  upsertSubscription,
} from '@/db';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { SupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Database } from '../../../../../database.types';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = (await headers()).get('stripe-signature')!;

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    const supabase = await createAdminClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await handleSubscriptionUpserted(supabase, subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        await handleSubscriptionUpserted(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe Webhook error: ', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}

const handleSubscriptionUpserted = async (
  supabase: SupabaseClient<Database>,
  subscription: Stripe.Subscription
) => {
  const stripeSubscriptionId = subscription.id;
  const stripePriceId = subscription.items.data[0].price.id;
  const stripeCustomerId = subscription.customer as string;

  const [plan, customer] = await Promise.all([
    getPlanByStripePriceId(supabase, stripePriceId),
    getUserByStripeCustomerId(supabase, stripeCustomerId),
  ]);

  if (!plan || !customer) {
    throw new Error('Missing required subscription data: plan or customer');
  }

  await upsertSubscription(supabase, {
    plan_id: plan.id,
    user_id: customer.id,
    stripe_subscription_id: stripeSubscriptionId,
    current_period_start: new Date(
      subscription.items.data[0].current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      subscription.items.data[0].current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    status: subscription.status === 'active' ? 'active' : 'canceled',
  });
};

const handleSubscriptionDeleted = async (
  supabase: SupabaseClient<Database>,
  subscription: Stripe.Subscription
) => {
  const stripeSubscriptionId = subscription.id;
  await updateSubscription(supabase, stripeSubscriptionId, {
    status: 'canceled',
  });
};
