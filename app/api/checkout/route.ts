import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

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
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?success=true`,
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
