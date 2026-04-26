import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Home, Search, Wrench } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Page not found',
    description:
        'The page you are looking for could not be found. Explore Clarify’s AI detector, humanizer, and writing tools instead.',
    robots: {
        index: false,
        follow: true,
    },
};

const popularLinks = [
    { href: '/', label: 'AI Detector', icon: Search },
    { href: '/humanizer', label: 'AI Humanizer', icon: Wrench },
    { href: '/paraphraser', label: 'Paraphraser', icon: Wrench },
    { href: '/grammar', label: 'Grammar Checker', icon: Wrench },
    { href: '/summarizer', label: 'Summarizer', icon: Wrench },
    { href: '/pricing', label: 'Pricing', icon: Home },
];

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-16">
            <div className="text-center max-w-2xl mx-auto">
                <p className="text-sm font-medium text-cyan-500 mb-4">404</p>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
                    Page not found
                </h1>
                <p className="text-base text-zinc-500 dark:text-zinc-400 mb-10 max-w-lg mx-auto">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have moved or no
                    longer exists. Try one of our tools instead:
                </p>

                <div className="flex flex-wrap gap-3 justify-center mb-10">
                    {popularLinks.map((l) => (
                        <Button key={l.href} asChild variant="outline" className="rounded-full">
                            <Link href={l.href}>
                                <l.icon className="w-4 h-4 mr-2" />
                                {l.label}
                            </Link>
                        </Button>
                    ))}
                </div>

                <Button asChild className="bg-cyan-500 hover:bg-cyan-600 rounded-lg">
                    <Link href="/">
                        <Home className="w-4 h-4 mr-2" />
                        Back to home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
