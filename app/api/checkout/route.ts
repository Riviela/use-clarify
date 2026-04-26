import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

/**
 * Resolve the public base URL for redirects.
 * Priority:
 *   1. NEXT_PUBLIC_APP_URL — explicit production domain (e.g. https://use-clarify.com)
 *   2. VERCEL_URL          — auto-set by Vercel for preview/production deployments
 *   3. fallback            — production domain
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://use-clarify.com';
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!apiKey || !storeId) {
      return NextResponse.json(
        { error: 'LemonSqueezy configuration is missing.' },
        { status: 500 }
      );
    }

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    // Get variantId from request body
    const body = await request.json();
    const { variantId } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: 'variantId is required.' },
        { status: 400 }
      );
    }

    // Initialize LemonSqueezy SDK
    lemonSqueezySetup({ apiKey });

    // Create checkout session
    const checkout = await createCheckout(storeId, variantId, {
      checkoutData: {
        custom: {
          user_id: user.id,
        },
      },
      productOptions: {
        redirectUrl: `${getBaseUrl()}/pricing?success=true`,
        receiptButtonText: 'Return to App',
      },
    });

    const checkoutUrl = checkout.data?.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error('LemonSqueezy checkout response:', JSON.stringify(checkout));
      return NextResponse.json(
        { error: 'Failed to create checkout URL.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
