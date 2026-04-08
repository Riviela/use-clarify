import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Use Supabase Admin client (Service Role) to bypass RLS
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin credentials are missing.');
  }

  return createClient(url, serviceRoleKey);
}

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      customer_id: number;
      variant_id: number;
      status: string;
      created_at: string;
      renews_at: string | null;
      ends_at: string | null;
      urls: {
        customer_portal: string | null;
        update_payment_method: string | null;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured.');
      return NextResponse.json(
        { error: 'Webhook secret not configured.' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify signature
    const signature = request.headers.get('x-signature');

    if (!signature) {
      console.error('Webhook: Missing X-Signature header.');
      return NextResponse.json(
        { error: 'Missing signature.' },
        { status: 403 }
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error('Webhook: Invalid signature.');
      return NextResponse.json(
        { error: 'Invalid signature.' },
        { status: 403 }
      );
    }

    // Parse the verified payload
    const event: LemonSqueezyWebhookEvent = JSON.parse(rawBody);
    const eventName = event.meta.event_name;
    const userId = event.meta.custom_data?.user_id;

    console.log(`Webhook received: ${eventName}, userId: ${userId}`);

    if (!userId) {
      console.error('Webhook: No user_id in custom_data.');
      return NextResponse.json(
        { error: 'Missing user_id in custom_data.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const attributes = event.data.attributes;

    // Handle subscription events
    if (
      eventName === 'subscription_created' ||
      eventName === 'subscription_updated'
    ) {
      const isActive =
        attributes.status === 'active' || attributes.status === 'on_trial';

      const periodEnd = attributes.renews_at || attributes.ends_at || null;

      // Determine billing interval from variant ID
      const yearlyVariantId = process.env.NEXT_PUBLIC_LEMON_VARIANT_YEARLY || '';
      const interval =
        String(attributes.variant_id) === yearlyVariantId ? 'year' : 'month';

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          plan_type: isActive ? 'premium' : 'free',
          lemon_customer_id: String(attributes.customer_id),
          lemon_subscription_id: String(event.data.id),
          variant_id: String(attributes.variant_id),
          subscription_status: attributes.status,
          current_period_end: periodEnd,
          update_url: attributes.urls?.customer_portal || null,
          subscription_start_date: attributes.created_at,
          subscription_end_date: attributes.renews_at || attributes.ends_at || null,
          plan_interval: interval,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Webhook: Supabase update error:', error);
        return NextResponse.json(
          { error: 'Database update failed.' },
          { status: 500 }
        );
      }

      console.log(
        `User ${userId} plan updated to ${isActive ? 'premium' : 'free'}.`
      );
    }

    // GRACE PERIOD: Cancelled = user keeps premium until period ends
    if (eventName === 'subscription_cancelled') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          // plan_type stays 'premium' — user retains access until period ends
          subscription_status: 'cancelled',
          subscription_end_date: attributes.ends_at || attributes.renews_at || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Webhook: Supabase cancellation error:', error);
        return NextResponse.json(
          { error: 'Database update failed.' },
          { status: 500 }
        );
      }

      console.log(`User ${userId} subscription cancelled. Premium access continues until period end.`);
    }

    // EXPIRED: Billing period is over — fully revoke premium access
    if (eventName === 'subscription_expired') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          plan_type: 'free',
          lemon_subscription_id: null,
          variant_id: null,
          subscription_status: 'expired',
          current_period_end: null,
          update_url: null,
          subscription_start_date: null,
          subscription_end_date: null,
          plan_interval: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Webhook: Supabase expiration error:', error);
        return NextResponse.json(
          { error: 'Database update failed.' },
          { status: 500 }
        );
      }

      console.log(`User ${userId} subscription expired. Downgraded to free.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
