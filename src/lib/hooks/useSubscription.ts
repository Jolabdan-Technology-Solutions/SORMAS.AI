'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Subscription,
  SubscriptionPlan,
  UsageLimits,
  CurrentUsage,
  getUserLimits,
  isTrialExpired,
  getTrialDaysRemaining,
  isLimitReached,
  TRIAL_DURATION_DAYS,
} from '@/lib/types/subscription';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plan: SubscriptionPlan;
  limits: UsageLimits;
  usage: CurrentUsage;
  isLoading: boolean;
  isDemo: boolean;
  isTrial: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  trialExpired: boolean;
  trialDaysRemaining: number;
  canCreateCase: boolean;
  canCreateContact: boolean;
  canImportEtl: boolean;
  canMakePrediction: boolean;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<CurrentUsage>({
    cases: 0,
    contacts: 0,
    etlImports: 0,
    aiPredictions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchSubscription = useCallback(async () => {
    try {
      // Check if in demo mode
      const isDemo = typeof window !== 'undefined' && localStorage.getItem('sormas_demo_mode') === 'true';

      if (isDemo) {
        setSubscription({
          id: 'demo',
          user_id: 'demo',
          plan: 'demo',
          status: 'active',
          user_count: 1,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          trial_start: null,
          trial_end: null,
          current_period_start: null,
          current_period_end: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      // Try to get existing subscription
      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is expected for new users
        console.error('Error fetching subscription:', error);
      }

      if (sub) {
        setSubscription(sub as Subscription);
      } else {
        // Create trial subscription for new user
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);

        const newSub: Partial<Subscription> = {
          user_id: user.id,
          plan: 'trial',
          status: 'active',
          user_count: 1,
          trial_start: new Date().toISOString(),
          trial_end: trialEnd.toISOString(),
        };

        const { data: createdSub, error: createError } = await supabase
          .from('subscriptions')
          .insert(newSub)
          .select()
          .single();

        if (createError) {
          // Table might not exist yet, use default trial state
          console.log('Subscriptions table not set up, using default trial');
          setSubscription({
            id: 'temp',
            user_id: user.id,
            plan: 'trial',
            status: 'active',
            user_count: 1,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            trial_start: new Date().toISOString(),
            trial_end: trialEnd.toISOString(),
            current_period_start: null,
            current_period_end: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          setSubscription(createdSub as Subscription);
        }
      }

      // Fetch current usage
      await fetchUsage(user.id);

    } catch (err) {
      console.error('Error in fetchSubscription:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const fetchUsage = async (userId: string) => {
    try {
      // Count cases
      const { count: casesCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId);

      // Count contacts
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId);

      // Count ETL imports this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: etlCount } = await supabase
        .from('etl_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .gte('created_at', startOfMonth.toISOString());

      // Count AI predictions this month
      const { count: predictionsCount } = await supabase
        .from('ai_predictions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      setUsage({
        cases: casesCount || 0,
        contacts: contactsCount || 0,
        etlImports: etlCount || 0,
        aiPredictions: predictionsCount || 0,
      });
    } catch (err) {
      // Tables might not exist, use default values
      console.log('Usage tracking tables not set up');
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const plan = subscription?.plan || 'trial';
  const limits = getUserLimits(subscription);
  const trialExpired = subscription?.plan === 'trial' && isTrialExpired(subscription.trial_end);
  const trialDaysRemaining = subscription?.trial_end
    ? getTrialDaysRemaining(subscription.trial_end)
    : TRIAL_DURATION_DAYS;

  return {
    subscription,
    plan,
    limits,
    usage,
    isLoading,
    isDemo: plan === 'demo',
    isTrial: plan === 'trial',
    isPro: plan === 'pro',
    isEnterprise: plan === 'enterprise',
    trialExpired,
    trialDaysRemaining,
    canCreateCase: !trialExpired && !isLimitReached(usage.cases, limits.cases),
    canCreateContact: !trialExpired && !isLimitReached(usage.contacts, limits.contacts),
    canImportEtl: plan !== 'demo' && !trialExpired && !isLimitReached(usage.etlImports, limits.etlImports),
    canMakePrediction: !trialExpired && !isLimitReached(usage.aiPredictions, limits.aiPredictions),
    refresh: fetchSubscription,
  };
}
