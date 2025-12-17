import { getProfileById, updateProfile } from '@/db';
import { createSubscription } from '@/db/subscription';
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
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (!userId || !planId || !subscriptionId || !customerId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const userProfile = await getProfileById(supabase, { profileId: userId });

      if (!userProfile) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        );
      }

      if (!userProfile?.stripe_customer_id) {
        await updateProfile(supabase, {
          profileId: userId,
          payload: { stripe_customer_id: customerId },
        });
      }

      await createSubscription(supabase, {
        userId,
        planId: planId,
        subscriptionId: subscriptionId,
      });

      break;
    }

    case 'customer.subscription.deleted':
      console.log('SUBSCRIPTION DELETED');
      // ❌ Mark user unsubscribed
      break;
  }

  return NextResponse.json({ received: true });
}
