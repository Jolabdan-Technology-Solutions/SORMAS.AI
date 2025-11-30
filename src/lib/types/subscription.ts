export type SubscriptionPlan = 'demo' | 'trial' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  user_count: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLimits {
  cases: number;
  contacts: number;
  etlImports: number;
  aiPredictions: number;
}

export interface CurrentUsage {
  cases: number;
  contacts: number;
  etlImports: number;
  aiPredictions: number;
}

// Plan limits
export const PLAN_LIMITS: Record<SubscriptionPlan, UsageLimits> = {
  demo: {
    cases: 100,
    contacts: 500,
    etlImports: 0, // Read-only
    aiPredictions: 10,
  },
  trial: {
    cases: 100,
    contacts: 500,
    etlImports: 10,
    aiPredictions: 50,
  },
  pro: {
    cases: 100, // Per user
    contacts: 500, // Per user
    etlImports: 10, // Per user
    aiPredictions: 50, // Per user
  },
  enterprise: {
    cases: Infinity,
    contacts: Infinity,
    etlImports: Infinity,
    aiPredictions: Infinity,
  },
};

export const TRIAL_DURATION_DAYS = 7;

export function isTrialExpired(trialEnd: string | null): boolean {
  if (!trialEnd) return false;
  return new Date(trialEnd) < new Date();
}

export function getTrialDaysRemaining(trialEnd: string | null): number {
  if (!trialEnd) return 0;
  const end = new Date(trialEnd);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getUserLimits(subscription: Subscription | null): UsageLimits {
  if (!subscription) {
    return PLAN_LIMITS.trial;
  }

  const baseLimits = PLAN_LIMITS[subscription.plan];

  // For pro, multiply by user count
  if (subscription.plan === 'pro') {
    return {
      cases: baseLimits.cases * subscription.user_count,
      contacts: baseLimits.contacts * subscription.user_count,
      etlImports: baseLimits.etlImports * subscription.user_count,
      aiPredictions: baseLimits.aiPredictions * subscription.user_count,
    };
  }

  return baseLimits;
}

export function isLimitReached(current: number, limit: number): boolean {
  return current >= limit && limit !== Infinity;
}

export function getUsagePercentage(current: number, limit: number): number {
  if (limit === Infinity) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
}
