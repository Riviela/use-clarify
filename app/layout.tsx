import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { createClient } from '@/utils/supabase/server';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  plan_type: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
}

const geistSans = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://use-clarify.com';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'Clarify — AI Detection & Humanization Platform',
        template: '%s — Clarify',
    },
    description:
        'Clarify is the definitive AI text analysis platform. Detect AI-generated content with surgical precision, humanize robotic text, and refine your writing — all in one place.',
    keywords: [
        'Clarify',
        'AI detector',
        'AI content detection',
        'AI humanizer',
        'grammar checker',
        'text summarizer',
        'tone changer',
        'paraphraser',
        'hallucination detector',
    ],
    authors: [{ name: 'Clarify' }],
    creator: 'Clarify',
    publisher: 'Clarify',
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteUrl,
        title: 'Clarify — AI Detection & Humanization Platform',
        description:
            'Detect AI-generated content with surgical precision, humanize robotic text, and refine your writing — all in one place.',
        siteName: 'Clarify',
        images: [
            {
                url: '/clarify.png',
                width: 1024,
                height: 320,
                alt: 'Clarify',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Clarify — AI Detection & Humanization Platform',
        description:
            'Detect AI-generated content with surgical precision, humanize robotic text, and refine your writing — all in one place.',
        images: ['/clarify.png'],
        creator: '@useclarifycom',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    // Favicon is auto-detected from `app/icon.png` by Next.js App Router.
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let user: User | null = null;
    let userProfile: UserProfile | null = null;

    try {
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;

        // Fetch user profile from database
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('plan_type, full_name, avatar_url, is_admin')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                userProfile = profile as UserProfile;
            }
        }
    } catch {
        // Supabase not configured - continue without auth
        console.warn('Supabase auth not available, continuing without authentication');
    }

    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
            >
                <div className="min-h-screen bg-white dark:bg-zinc-950">
                    <Navbar user={user} userProfile={userProfile} />

                    <main className="container mx-auto px-4 py-12" role="main">
                        {children}
                    </main>

                    <Toaster />

                    <Footer />
                </div>
            </body>
        </html>
    );
}
