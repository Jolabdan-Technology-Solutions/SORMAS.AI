'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  Zap,
  X,
  ArrowRight,
  Users,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { getUsagePercentage } from '@/lib/types/subscription';

interface UpgradePromptProps {
  type: 'trial-expiring' | 'trial-expired' | 'limit-reached' | 'banner';
  limitType?: 'cases' | 'contacts' | 'etlImports' | 'aiPredictions';
  onClose?: () => void;
}

export function UpgradePrompt({ type, limitType, onClose }: UpgradePromptProps) {
  const { trialDaysRemaining, limits, usage, plan } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCount: 5 }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        // Stripe not configured, redirect to pricing page
        window.location.href = '/pricing';
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      window.location.href = '/pricing';
    } finally {
      setIsLoading(false);
    }
  };

  // Trial banner for users with less than 3 days
  if (type === 'banner' && plan === 'trial' && trialDaysRemaining <= 3 && trialDaysRemaining > 0) {
    return (
      <div className="relative bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 mb-6">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-amber-400 hover:text-amber-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold">
              {trialDaysRemaining === 1
                ? 'Your trial expires tomorrow!'
                : `${trialDaysRemaining} days left in your trial`}
            </h4>
            <p className="text-amber-200/70 text-sm">
              Upgrade to Pro to keep your data and continue disease surveillance.
            </p>
          </div>
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
          >
            {isLoading ? 'Loading...' : 'Upgrade Now'}
          </Button>
        </div>
      </div>
    );
  }

  // Trial expired modal
  if (type === 'trial-expired') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a1a] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Trial Expired</h2>
          <p className="text-slate-400 mb-6">
            Your 7-day free trial has ended. Upgrade to Pro to continue using SORMAS AI
            and keep all your disease surveillance data.
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Pro Plan Benefits
            </h4>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>100 cases per user</li>
              <li>500 contacts per user</li>
              <li>10 ETL imports/month per user</li>
              <li>50 AI predictions/month per user</li>
              <li>Priority support</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Loading...
                </div>
              ) : (
                <>
                  <Users className="mr-2 h-5 w-5" />
                  Upgrade to Pro - $50/user/mo
                </>
              )}
            </Button>
            <Link
              href="/pricing"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              View all plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Limit reached modal
  if (type === 'limit-reached' && limitType) {
    const limitNames = {
      cases: 'cases',
      contacts: 'contacts',
      etlImports: 'ETL imports this month',
      aiPredictions: 'AI predictions this month',
    };

    const currentUsage = usage[limitType];
    const limit = limits[limitType];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a1a] p-8 text-center">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 mb-4">
            <Zap className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Limit Reached</h2>
          <p className="text-slate-400 mb-6">
            You've used all {currentUsage} of your {limit} {limitNames[limitType]}.
            Upgrade to Pro to increase your limits.
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Current usage</span>
              <span className="text-white font-semibold">
                {currentUsage} / {limit}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            >
              {isLoading ? 'Loading...' : 'Upgrade to Pro'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Usage indicator component for dashboards
export function UsageIndicator({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number;
}) {
  const percentage = getUsagePercentage(current, limit);
  const isWarning = percentage >= 80;
  const isLimit = percentage >= 100;

  if (limit === Infinity) {
    return (
      <div className="text-slate-400 text-sm">
        {label}: {current} (unlimited)
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={isLimit ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-slate-300'}>
          {current} / {limit}
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isLimit
              ? 'bg-red-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-indigo-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
