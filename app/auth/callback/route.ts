import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const redirect = searchParams.get('redirect') || '/';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // If the redirect target is the reset-password page, always honor it
            // This handles the password recovery flow
            return NextResponse.redirect(`${origin}${redirect}`);
        }
    }

    // Handle hash-based recovery tokens (Supabase sends #type=recovery)
    // These are handled client-side by Supabase SDK automatically,
    // but we redirect to reset-password as a fallback
    const type = searchParams.get('type');
    if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth`);
}
