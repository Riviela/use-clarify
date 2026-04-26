'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { useTranslation } from '@/components/language-provider';

const VARIANT_MONTHLY = process.env.NEXT_PUBLIC_LEMON_VARIANT_MONTHLY || '';
const VARIANT_YEARLY = process.env.NEXT_PUBLIC_LEMON_VARIANT_YEARLY || '';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

type BillingInterval = 'monthly' | 'yearly';

function PricingPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [customerPortalUrl, setCustomerPortalUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanType() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_type, lemon_subscription_id, is_admin')
          .eq('id', user.id)
          .single();
        setPlanType((profile?.is_admin === true || profile?.plan_type === 'premium') ? 'premium' : 'free');

        // If premium, build LemonSqueezy customer portal URL
        if (profile?.lemon_subscription_id) {
          setCustomerPortalUrl(
            `https://app.lemonsqueezy.com/my-orders`
          );
        }
      }
      setLoading(false);
    }
    fetchPlanType();
  }, []);

  // Handle success redirect from LemonSqueezy checkout
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success(t('pricing.successToastTitle'), {
        description: t('pricing.successToastDesc'),
        duration: 6000,
      });
      // Re-fetch plan after short delay to allow webhook processing
      const timer = setTimeout(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan_type, is_admin')
            .eq('id', user.id)
            .single();
          if (profile?.is_admin === true || profile?.plan_type === 'premium') {
            setPlanType('premium');
          }
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleCheckout = async (variantId: string) => {
    if (!variantId) {
      toast.error('Configuration error', {
        description: 'Variant ID is not configured. Please contact support.',
      });
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in', {
            description: 'You need to be signed in to upgrade your plan.',
          });
        } else {
          toast.error('Checkout failed', {
            description: data.error || 'Something went wrong. Please try again.',
          });
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Connection error', {
        description: 'Could not reach the server. Please try again.',
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const proPrice = billingInterval === 'monthly' ? '$19.99' : '$199.99';
  const proPeriod = billingInterval === 'monthly' ? t('pricing.perMonth') : t('pricing.perYear');
  const proVariantId = billingInterval === 'monthly' ? VARIANT_MONTHLY : VARIANT_YEARLY;

  const plans = [
    {
      id: 'starter',
      name: t('pricing.starter.name'),
      price: '$0',
      period: t('pricing.perMonth'),
      description: t('pricing.starter.desc'),
      icon: Sparkles,
      features: [
        t('pricing.starterFeatures.f1'),
        t('pricing.starterFeatures.f2'),
        t('pricing.starterFeatures.f3'),
        t('pricing.starterFeatures.f4'),
        t('pricing.starterFeatures.f5'),
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: t('pricing.pro.name'),
      price: proPrice,
      period: proPeriod,
      description: t('pricing.pro.desc'),
      icon: Zap,
      features: [
        t('pricing.proFeatures.f1'),
        t('pricing.proFeatures.f2'),
        t('pricing.proFeatures.f3'),
        t('pricing.proFeatures.f4'),
        t('pricing.proFeatures.f5'),
        t('pricing.proFeatures.f6'),
      ],
      popular: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            {t('pricing.subtitle')}
          </p>

          {planType === 'premium' && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Crown className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {t('pricing.pro.ctaCurrent')}
              </span>
            </div>
          )}
        </motion.div>

        {/* Billing Toggle */}
        {planType !== 'premium' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-12"
          >
            <span
              className={`text-sm font-medium cursor-pointer transition-colors ${
                billingInterval === 'monthly'
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-400'
              }`}
              onClick={() => setBillingInterval('monthly')}
            >
              {t('pricing.monthly')}
            </span>

            <button
              onClick={() =>
                setBillingInterval((prev) =>
                  prev === 'monthly' ? 'yearly' : 'monthly'
                )
              }
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                billingInterval === 'yearly'
                  ? 'bg-zinc-900 dark:bg-white'
                  : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 ${
                  billingInterval === 'yearly'
                    ? 'translate-x-6 bg-white dark:bg-zinc-900'
                    : 'translate-x-0 bg-white dark:bg-zinc-400'
                }`}
              />
            </button>

            <span
              className={`text-sm font-medium cursor-pointer transition-colors ${
                billingInterval === 'yearly'
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-400'
              }`}
              onClick={() => setBillingInterval('yearly')}
            >
              {t('pricing.yearly')}
            </span>

            {billingInterval === 'yearly' && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0 text-xs font-medium">
                {t('pricing.saveBadge')}
              </Badge>
            )}
          </motion.div>
        )}

        {/* Pricing Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={fadeInUp}
              onMouseEnter={() => setHoveredCard(plan.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative"
            >
              {/* Glow Effect for Pro Plan */}
              {plan.popular && (
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-0 blur transition-opacity duration-500 ${
                    hoveredCard === plan.id ? 'opacity-20' : ''
                  }`}
                />
              )}

              <div
                className={`relative h-full bg-white dark:bg-zinc-900 rounded-xl border transition-all duration-300 ${
                  plan.popular
                    ? 'border-zinc-900 dark:border-zinc-100 shadow-lg'
                    : 'border-zinc-200 dark:border-zinc-800 shadow-sm'
                } ${hoveredCard === plan.id && !plan.popular ? 'border-zinc-300 dark:border-zinc-700' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1 text-xs font-medium">
                      ★
                    </Badge>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        plan.popular
                          ? 'bg-zinc-900 dark:bg-white'
                          : 'bg-zinc-100 dark:bg-zinc-800'
                      }`}
                    >
                      <plan.icon
                        className={`w-6 h-6 ${
                          plan.popular ? 'text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      />
                    </div>

                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                      {plan.name}
                    </h2>

                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-zinc-400">{plan.period}</span>
                    </div>

                    <p className="text-sm text-zinc-500">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.popular
                              ? 'bg-zinc-900 dark:bg-white'
                              : 'bg-zinc-100 dark:bg-zinc-800'
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${
                              plan.popular ? 'text-white dark:text-zinc-900' : 'text-zinc-600'
                            }`}
                          />
                        </div>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {plan.popular ? (
                    // Pro plan button
                    planType === 'premium' ? (
                      <div className="space-y-2">
                        <Button
                          className="w-full h-11 rounded-lg font-medium bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300"
                          disabled
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          {t('pricing.starter.cta')}
                        </Button>
                        {customerPortalUrl && (
                          <Button
                            variant="outline"
                            className="w-full h-9 rounded-lg text-sm"
                            onClick={() => window.open(customerPortalUrl, '_blank')}
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                            {t('pricing.pro.manage')}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        className="w-full h-11 rounded-lg font-medium transition-all duration-200 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900"
                        disabled={checkoutLoading}
                        onClick={() => handleCheckout(proVariantId)}
                      >
                        {checkoutLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('common.loading')}
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            {t('pricing.pro.cta')}
                          </>
                        )}
                      </Button>
                    )
                  ) : (
                    // Starter plan button
                    <Button
                      className="w-full h-11 rounded-lg font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white"
                      disabled
                    >
                      {t('pricing.starter.cta')}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center text-sm text-zinc-400 mt-12"
        >
          {t('pricing.paymentNote')}
        </motion.p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>}>
      <PricingPageContent />
    </Suspense>
  );
}
