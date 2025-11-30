import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

// Pro plan: $50/user/month, minimum 5 users = $250/month minimum
export const PRO_PRICE_PER_USER = 5000; // $50.00 in cents
export const MIN_USERS = 5;
export const MIN_MONTHLY_PRICE = PRO_PRICE_PER_USER * MIN_USERS; // $250.00 in cents
