import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface InvoiceItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  receiptUrl: string | null;
}

export async function GET() {
  try {
    // 1. Check API key
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    if (!apiKey) {
      console.error('[Billing] LEMONSQUEEZY_API_KEY is not set in .env.local');
      return NextResponse.json(
        { error: 'Payment provider is not configured. LEMONSQUEEZY_API_KEY missing.' },
        { status: 500 }
      );
    }

    const masked = apiKey.slice(0, 8) + '...' + apiKey.slice(-4);
    console.log(`[Billing] API key loaded: ${masked} (length: ${apiKey.length})`);

    // 2. Auth check
    let supabase;
    try {
      supabase = await createClient();
    } catch (err) {
      console.error('[Billing] Failed to create Supabase client:', err);
      return NextResponse.json(
        { error: 'Authentication service unavailable.' },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('[Billing] Supabase auth error:', authError.message);
      return NextResponse.json(
        { error: `Authentication failed: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!user || !user.email) {
      console.error('[Billing] No user or email. User ID:', user?.id ?? 'null');
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    console.log('[Billing] User:', user.email);

    // 3. Fetch orders from Lemon Squeezy
    const lsUrl = new URL('https://api.lemonsqueezy.com/v1/orders');
    lsUrl.searchParams.set('filter[user_email]', user.email);
    lsUrl.searchParams.set('page[size]', '50');

    console.log('[Billing] Requesting:', lsUrl.toString());

    let response: Response;
    try {
      response = await fetch(lsUrl.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${apiKey}`,
        },
        cache: 'no-store',
      });
    } catch (fetchErr) {
      console.error('[Billing] Network error:', fetchErr);
      return NextResponse.json(
        { error: 'Could not reach Lemon Squeezy. Network error.' },
        { status: 502 }
      );
    }

    console.log(`[Billing] Lemon Squeezy responded: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        errorBody = '(could not read response body)';
      }
      console.error(`[Billing] LS API error ${response.status}:`, errorBody);

      // If 401/403 → API key issue
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: `Lemon Squeezy rejected the API key (${response.status}). Check LEMONSQUEEZY_API_KEY in .env.local — make sure it is a Live mode key, not a Test mode key.` },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { error: `Lemon Squeezy returned ${response.status}: ${response.statusText}` },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let json: any;
    try {
      json = await response.json();
    } catch {
      console.error('[Billing] Failed to parse LS response as JSON');
      return NextResponse.json(
        { error: 'Invalid response from payment provider.' },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders: any[] = json.data || [];
    console.log(`[Billing] ${orders.length} order(s) found.`);

    // 4. Map orders safely
    const invoices: InvoiceItem[] = orders.map((order) => {
      const attrs = order.attributes || {};
      const firstItem = attrs.first_order_item;

      let description = 'Clarify Pro';
      if (firstItem) {
        const productName = firstItem.product_name || 'Clarify Pro';
        const variantName = firstItem.variant_name;
        description = variantName ? `${productName} — ${variantName}` : productName;
      }

      const amount = attrs.total_formatted
        ? attrs.total_formatted
        : typeof attrs.total === 'number'
          ? `$${(attrs.total / 100).toFixed(2)}`
          : '$0.00';

      return {
        id: String(order.id),
        date: attrs.created_at || new Date().toISOString(),
        description,
        amount,
        status: attrs.status || 'paid',
        receiptUrl: attrs.urls?.receipt || null,
      };
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('[Billing] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
