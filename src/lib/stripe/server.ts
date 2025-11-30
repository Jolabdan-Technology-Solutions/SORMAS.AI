import Stripe from 'stripe';

// Lazy initialization to avoid build errors when env vars aren't set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backward compatibility - will throw if accessed without env var
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get invoices() { return getStripe().invoices; },
  get webhooks() { return getStripe().webhooks; },
} as unknown as Stripe;

// Pro plan: $50/user/month, minimum 5 users = $250/month minimum
export const PRO_PRICE_PER_USER = 5000; // $50.00 in cents
export const MIN_USERS = 5;
export const MIN_MONTHLY_PRICE = PRO_PRICE_PER_USER * MIN_USERS; // $250.00 in cents
