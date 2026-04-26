import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign in — Clarify',
    description:
        'Sign in to your Clarify account to access the AI detector, humanizer, paraphraser, grammar checker, and more.',
    robots: {
        index: false,
        follow: true,
        nocache: true,
    },
    alternates: { canonical: '/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
