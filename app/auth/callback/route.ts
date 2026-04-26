import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Sanitize the `redirect` query param to prevent open-redirect attacks.
 * Only allow same-origin paths starting with "/".
 */
function safeRedirect(value: string | null): string {
    if (!value) return '/';
    if (value.startsWith('/') && !value.startsWith('//')) return value;
    return '/';
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const redirect = safeRedirect(searchParams.get('redirect'));

    // OAuth provider returned an error (e.g. user cancelled, misconfigured app)
    if (errorParam) {
        console.error('[Auth Callback] Provider error:', errorParam, errorDescription);
        const msg = encodeURIComponent(errorDescription || errorParam);
        return NextResponse.redirect(`${origin}/login?error=${msg}`);
    }

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${origin}${redirect}`);
        }

        console.error('[Auth Callback] exchangeCodeForSession failed:', error.message, error);
        const msg = encodeURIComponent(error.message);
        return NextResponse.redirect(`${origin}/login?error=${msg}`);
    }

    // Handle hash-based recovery tokens (Supabase sends #type=recovery)
    const type = searchParams.get('type');
    if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
    }

    // No code, no error — likely a misconfigured redirect URL
    console.error('[Auth Callback] No code or error received. URL:', request.url);
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
