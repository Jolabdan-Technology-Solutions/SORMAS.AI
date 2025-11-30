import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRO_PRICE_PER_USER, MIN_USERS } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userCount = MIN_USERS } = await request.json();

    // Enforce minimum user count
    const users = Math.max(userCount, MIN_USERS);

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_key')) {
      return NextResponse.json({
        success: false,
        error: 'Stripe is not configured. Please contact support.'
      }, { status: 503 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'SORMAS AI Pro',
              description: `Team subscription for ${users} users`,
            },
            unit_amount: PRO_PRICE_PER_USER,
            recurring: {
              interval: 'month',
            },
          },
          quantity: users,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?subscription=cancelled`,
      metadata: {
        user_id: user.id,
        user_email: user.email || '',
        user_count: users.toString(),
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          user_count: users.toString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create checkout session'
    }, { status: 500 });
  }
}
