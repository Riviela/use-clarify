import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { createClient } from '@/utils/supabase/server';
import { Navbar } from '@/components/navbar';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  plan_type: string;
  full_name: string | null;
  avatar_url: string | null;
}

const geistSans = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});

export const metadata: Metadata = {
    title: 'Clarify — AI Detection & Humanization Platform',
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
                .select('plan_type, full_name, avatar_url')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                userProfile = profile as UserProfile;
            }
        }
    } catch (error) {
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

                    <footer className="border-t border-zinc-100 dark:border-zinc-800 mt-24">
                        <div className="container mx-auto px-4 py-8">
                            <p className="text-center text-sm text-zinc-400">
                                © 2026 Clarify. All rights reserved.
                            </p>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
