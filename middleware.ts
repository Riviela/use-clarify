import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    // Check if Supabase credentials are valid
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

    // Skip auth checks in development if Supabase is not configured
    if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
        console.warn('Supabase credentials not configured. Skipping auth check for:', request.nextUrl.pathname);
        return supabaseResponse;
    }

    try {
        const supabase = createServerClient(
            supabaseUrl as string,
            supabaseAnonKey as string,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet: { name: string; value: string; options: object }[]) {
                        cookiesToSet.forEach(({ name, value }) => {
                            request.cookies.set(name, value);
                        });
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) => {
                            supabaseResponse.cookies.set(name, value, options);
                        });
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Protected routes that require authentication (personal pages only)
        const protectedRoutes = [
            '/settings',
            '/profile',
            '/billing',
        ];

        const isProtectedRoute = protectedRoutes.some((route) =>
            request.nextUrl.pathname.startsWith(route)
        );

        if (isProtectedRoute && !user) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }
    } catch (error) {
        console.error('Supabase auth error:', error);
        // In case of error, allow the request to proceed (fail open for better UX)
        return supabaseResponse;
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
