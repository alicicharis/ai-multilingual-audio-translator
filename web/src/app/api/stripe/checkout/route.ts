import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import {
  getPlanById,
  getUserById,
  getUserSubscription,
  updateUser,
} from '@/db';

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userSubscription = await getUserSubscription(supabase, user.id);

    if (userSubscription) {
      return NextResponse.json(
        { error: 'User already has a subscription' },
        { status: 400 }
      );
    }

    const email = user.email;
    const userId = user.id;

    const plan = await getPlanById(supabase, planId);

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const userProfile = await getUserById(supabase, userId);

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    let customerId = userProfile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      await updateUser(supabase, userId, {
        stripe_customer_id: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=false`,
      metadata: {
        userId,
        planId,
        priceId: plan.stripe_price_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error in checkout: ', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
