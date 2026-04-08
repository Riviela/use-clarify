import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Validate URL format
const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
};

export async function createClient() {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
        throw new Error(
            'Supabase credentials are not properly configured. ' +
            'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. ' +
            'URL must start with http:// or https://'
        );
    }

    return createServerClient(
        supabaseUrl as string,
        supabaseAnonKey as string,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: object }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}
