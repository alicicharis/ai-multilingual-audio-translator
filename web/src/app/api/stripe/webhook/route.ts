import { createSubscription, updateSubscription } from '@/db/subscription';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new NextResponse('Webhook error', { status: 400 });
  }

  const supabase = await createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const stripeSubscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (!userId || !planId || !stripeSubscriptionId || !customerId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      await createSubscription(supabase, {
        userId,
        planId: planId,
        stripeSubscriptionId: stripeSubscriptionId,
      });

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      const stripeSubscriptionId = subscription.id;
      if (!stripeSubscriptionId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Cancel subscription at the end of the period
      if (
        subscription?.cancel_at_period_end &&
        subscription.status === 'active'
      ) {
        await updateSubscription(supabase, {
          stripeSubscriptionId,
          payload: { cancel_at_period_end: true, status: subscription.status },
        });
      }

      // Continue canceled subscription
      if (
        !subscription?.cancel_at_period_end &&
        subscription.status === 'active'
      ) {
        await updateSubscription(supabase, {
          stripeSubscriptionId,
          payload: { cancel_at_period_end: false, status: subscription.status },
        });
      }

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      const stripeSubscriptionId = subscription.id;
      if (!stripeSubscriptionId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      await updateSubscription(supabase, {
        stripeSubscriptionId,
        payload: { status: 'canceled' },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
