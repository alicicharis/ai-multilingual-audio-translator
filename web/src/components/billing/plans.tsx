'use client';

import { Check, Sparkles, X, Crown, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { UserSubscription } from '@/db';

const plans = [
  {
    id: 'a24fc44d-ae01-45d1-862f-44a7c5935c62',
    name: 'Starter',
    description: 'Perfect for trying out the service',
    price: 10,
    priceId: 'price_1Sf2vA09KiqPeyOwrN40Snhw',
    popular: false,
    features: {
      'Monthly transcription minutes': '60 min',
      'Available languages': '10',
      'Max file size': '25 MB',
      'Audio quality': 'Standard',
      'Priority processing': false,
      'API access': false,
      'Custom vocabulary': false,
      'Dedicated support': false,
    },
  },
  {
    id: 'bbba2f4f-eb60-40f8-8531-eaf7d89245b1',
    name: 'Pro',
    description: 'Best for content creators and businesses',
    price: 50,
    priceId: 'price_1Sf2vV09KiqPeyOwqbd0rXCs',
    popular: true,
    features: {
      'Monthly transcription minutes': '300 min',
      'Available languages': '50+',
      'Max file size': '100 MB',
      'Audio quality': 'HD',
      'Priority processing': true,
      'API access': true,
      'Custom vocabulary': false,
      'Dedicated support': false,
    },
  },
  {
    id: 'a198a74d-7eff-4dfd-8659-c09e207864d8',
    name: 'Creator',
    description: 'For teams with advanced needs',
    price: 100,
    priceId: 'price_1Sf2vf09KiqPeyOwO0yxD3mC',
    popular: false,
    features: {
      'Monthly transcription minutes': 'Unlimited',
      'Available languages': '100+',
      'Max file size': '500 MB',
      'Audio quality': 'Ultra HD',
      'Priority processing': true,
      'API access': true,
      'Custom vocabulary': true,
      'Dedicated support': true,
    },
  },
];

const featureLabels = [
  'Monthly transcription minutes',
  'Available languages',
  'Max file size',
  'Audio quality',
  'Priority processing',
  'API access',
  'Custom vocabulary',
  'Dedicated support',
];

const Plans = ({
  userSubscription,
}: {
  userSubscription: UserSubscription | null;
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const cancelSubscriptionHandler = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch('/api/stripe/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: userSubscription?.id }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const reactivateSubscriptionHandler = async () => {
    setIsReactivating(true);
    try {
      const response = await fetch('/api/stripe/subscription/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: userSubscription?.id }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    } finally {
      setIsReactivating(false);
    }
  };

  const subscribeHandler = async (planId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="col-span-full">
      {/* Header Section */}
      {userSubscription && (
        <Card className="mb-12 border-primary/30 bg-linear-to-br from-primary/5 via-transparent to-chart-2/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="size-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Your Current Plan</CardTitle>
                  <CardDescription>
                    You&apos;re currently subscribed to our services
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">
                  {userSubscription.plans.name}
                </span>
                <p className="text-sm text-muted-foreground">
                  Active subscription
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              {userSubscription.cancel_at_period_end ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <span>
                      Your subscription is scheduled to cancel at the end of the
                      billing period
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reactivateSubscriptionHandler}
                    disabled={isReactivating}
                    className="text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                  >
                    {isReactivating ? 'Reactivating...' : 'Reactivate Plan'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary" />
                    <span>
                      Your subscription is active and renews automatically
                    </span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      >
                        Cancel Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent showCloseButton={false}>
                      <DialogHeader>
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="size-5 text-destructive" />
                          </div>
                          <DialogTitle>Cancel Subscription?</DialogTitle>
                        </div>
                        <DialogDescription className="pt-2">
                          Are you sure you want to cancel your{' '}
                          <span className="font-semibold text-foreground">
                            {userSubscription.plans.name}
                          </span>{' '}
                          subscription? You&apos;ll lose access to all premium
                          features at the end of your current billing period.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Keep Subscription</Button>
                        </DialogClose>
                        <Button
                          onClick={cancelSubscriptionHandler}
                          disabled={isCancelling}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isCancelling ? 'Cancelling...' : 'Yes, Cancel Plan'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4 bg-linear-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Unlock the power of AI-driven audio translation. Select the plan that
          fits your needs and start translating today.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'relative transition-all duration-300 hover:shadow-lg',
              plan.popular
                ? 'border-primary border-2 shadow-xl scale-[1.02] bg-linear-to-b from-primary/5 to-transparent'
                : 'hover:border-primary/50'
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                  <Sparkles className="size-4" />
                  Most Popular
                </div>
              </div>
            )}

            <CardHeader className={cn(plan.popular && 'pt-8')}>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>

              <ul className="space-y-3">
                {Object.entries(plan.features)
                  .slice(0, 4)
                  .map(([feature, value]) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="shrink-0 size-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="size-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}:</span>
                      <span className="font-medium ml-auto">{value}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button
                onClick={() => subscribeHandler(plan.id)}
                className={cn(
                  'w-full',
                  plan.popular
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
                size="lg"
              >
                {plan.popular ? 'Get Started' : 'Subscribe'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Compare All Features
        </h2>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-4 px-6 font-semibold">Feature</th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className={cn(
                        'text-center py-4 px-6 font-semibold',
                        plan.popular && 'bg-primary/10'
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{plan.name}</span>
                        {plan.popular && (
                          <span className="text-xs text-primary font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureLabels.map((feature, index) => (
                  <tr
                    key={feature}
                    className={cn(
                      'border-b last:border-0 transition-colors hover:bg-muted/20',
                      index % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                    )}
                  >
                    <td className="py-4 px-6 text-sm font-medium">{feature}</td>
                    {plans.map((plan) => {
                      const value =
                        plan.features[feature as keyof typeof plan.features];
                      return (
                        <td
                          key={`${plan.id}-${feature}`}
                          className={cn(
                            'text-center py-4 px-6',
                            plan.popular && 'bg-primary/5'
                          )}
                        >
                          {typeof value === 'boolean' ? (
                            value ? (
                              <div className="flex justify-center">
                                <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
                                  <Check className="size-4 text-primary" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <div className="size-6 rounded-full bg-muted flex items-center justify-center">
                                  <X className="size-4 text-muted-foreground" />
                                </div>
                              </div>
                            )
                          ) : (
                            <span
                              className={cn(
                                'text-sm font-medium',
                                plan.popular && 'text-primary'
                              )}
                            >
                              {value}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Price row */}
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 font-semibold">Monthly Price</td>
                  {plans.map((plan) => (
                    <td
                      key={`${plan.id}-price`}
                      className={cn(
                        'text-center py-4 px-6',
                        plan.popular && 'bg-primary/10'
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'text-2xl font-bold',
                            plan.popular && 'text-primary'
                          )}
                        >
                          ${plan.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          per month
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
                {/* CTA row */}
                <tr>
                  <td className="py-6 px-6"></td>
                  {plans.map((plan) => (
                    <td
                      key={`${plan.id}-cta`}
                      className={cn(
                        'text-center py-6 px-6',
                        plan.popular && 'bg-primary/5'
                      )}
                    >
                      <Button
                        onClick={() => subscribeHandler(plan.priceId)}
                        variant={plan.popular ? 'default' : 'outline'}
                        size="sm"
                      >
                        Choose {plan.name}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FAQ/Trust Section */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground">
          <Check className="size-4 text-primary" />
          <span>
            Cancel anytime • No hidden fees • 7-day money-back guarantee
          </span>
        </div>
      </div>
    </div>
  );
};

export default Plans;
