import { createSubscription, updateSubscription } from '@/db';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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

        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const stripeSubscriptionId = subscription.id;

        if (!userId || !planId) {
          throw new Error('Missing required metadata fields');
        }

        await createSubscription(supabase, {
          plan_id: planId,
          stripe_subscription_id: stripeSubscriptionId,
          user_id: userId,
          current_period_start: new Date(
            subscription.items.data[0].current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.items.data[0].current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          status: 'active',
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;

        await updateSubscription(supabase, stripeSubscriptionId, {
          current_period_end: new Date(
            subscription.items.data[0].current_period_end * 1000
          ).toISOString(),
          current_period_start: new Date(
            subscription.items.data[0].current_period_start * 1000
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          status: subscription.status === 'active' ? 'active' : 'canceled',
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;

        await updateSubscription(supabase, stripeSubscriptionId, {
          status: 'canceled',
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe Webhook error: ', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
