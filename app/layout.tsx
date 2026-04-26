import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { createClient } from '@/utils/supabase/server';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { LanguageProvider } from '@/components/language-provider';
import { getLocale } from '@/lib/i18n';
import { User } from '@supabase/supabase-js';
import { JsonLd, organizationLd, websiteLd, softwareAppLd } from '@/components/structured-data';

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
        default: 'Clarify — AI Detector, Humanizer & Writing Suite',
        template: '%s | Clarify',
    },
    description:
        'Clarify is the all-in-one AI text suite: free AI content detector, humanizer, paraphraser, grammar checker, summarizer, tone changer, expander, and hallucination detector. Trusted by writers, students, and teams to detect ChatGPT, Claude, Gemini, and Llama output and produce undetectable, human-quality text.',
    applicationName: 'Clarify',
    keywords: [
        // Brand
        'Clarify',
        'use clarify',
        'use-clarify.com',
        // Core category
        'AI detector',
        'AI content detector',
        'AI text detector',
        'free AI detector',
        'best AI detector',
        'most accurate AI detector',
        'ChatGPT detector',
        'GPT detector',
        'GPT-4 detector',
        'Claude detector',
        'Gemini detector',
        'Llama detector',
        'AI detection tool',
        'detect AI written text',
        'AI plagiarism checker',
        // Humanizer
        'AI humanizer',
        'AI to human text converter',
        'humanize AI text',
        'undetectable AI',
        'bypass AI detection',
        'make AI text human',
        'AI to human',
        'humanize ChatGPT',
        // Tools
        'paraphraser',
        'paraphrasing tool',
        'rewriter',
        'AI rewriter',
        'grammar checker',
        'free grammar checker',
        'text summarizer',
        'AI summarizer',
        'tone changer',
        'rewrite tone',
        'text expander',
        'sentence expander',
        'hallucination detector',
        'fact checker',
        // Audience / intent
        'AI detector for students',
        'AI detector for teachers',
        'essay AI detector',
        'GPTZero alternative',
        'Originality.ai alternative',
        'QuillBot alternative',
        'Grammarly alternative',
        'free AI writing tools',
        // Turkish
        'AI dedektör',
        'yapay zeka tespit',
        'metin insanlaştırıcı',
        'AI içerik tespit',
        'ChatGPT tespit',
        'paraphrase aracı',
        'gramer kontrol',
        'metin özetleyici',
    ],
    authors: [{ name: 'Clarify', url: siteUrl }],
    creator: 'Clarify',
    publisher: 'Clarify',
    category: 'Technology',
    classification: 'AI Writing Tools',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
        telephone: false,
        address: false,
        email: false,
    },
    alternates: {
        canonical: '/',
        languages: {
            'en-US': '/',
            'tr-TR': '/',
            'x-default': '/',
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        alternateLocale: ['tr_TR'],
        url: siteUrl,
        title: 'Clarify — AI Detector, Humanizer & Writing Suite',
        description:
            'The all-in-one AI text suite: detect ChatGPT/GPT-4/Claude/Gemini output, humanize robotic text, paraphrase, summarize, fix grammar, change tone, expand, and catch hallucinations — free to start.',
        siteName: 'Clarify',
        images: [
            {
                url: '/clarify.png',
                width: 1200,
                height: 630,
                alt: 'Clarify — AI Detection & Humanization Platform',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@useclarifycom',
        creator: '@useclarifycom',
        title: 'Clarify — AI Detector, Humanizer & Writing Suite',
        description:
            'Detect ChatGPT, Claude, Gemini, and Llama output. Humanize, paraphrase, summarize, and refine — all in one place.',
        images: ['/clarify.png'],
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        // Replace these with real verification tokens once issued
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
        yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
        other: {
            'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
        },
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Clarify',
    },
    other: {
        'apple-mobile-web-app-title': 'Clarify',
        'msapplication-TileColor': '#09090b',
    },
    // Favicon is auto-detected from `app/icon.png` by Next.js App Router.
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    colorScheme: 'light dark',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    ],
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
                const typedProfile = profile as UserProfile;
                // Admins automatically get premium privileges
                userProfile = {
                    ...typedProfile,
                    plan_type: typedProfile.is_admin ? 'premium' : typedProfile.plan_type,
                };
            }
        }
    } catch {
        // Supabase not configured - continue without auth
        console.warn('Supabase auth not available, continuing without authentication');
    }

    const locale = await getLocale();

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="//api.groq.com" />
                <JsonLd id="ld-organization" data={organizationLd} />
                <JsonLd id="ld-website" data={websiteLd} />
                <JsonLd id="ld-software" data={softwareAppLd} />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
            >
                <LanguageProvider initialLocale={locale}>
                    <div className="min-h-screen bg-white dark:bg-zinc-950">
                        <Navbar user={user} userProfile={userProfile} />

                        <main className="container mx-auto px-4 py-12" role="main">
                            {children}
                        </main>

                        <Toaster />

                        <Footer />
                    </div>
                </LanguageProvider>
            </body>
        </html>
    );
}
