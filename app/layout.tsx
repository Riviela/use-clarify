import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'AI Content Detector - Analyze Text for AI-Generated Content',
    description:
        'Professional AI content detection tool that analyzes text to classify as Human-written, AI-Generated, or AI-Refined with paragraph-level insights.',
    keywords: [
        'AI detector',
        'AI content detection',
        'plagiarism checker',
        'AI text analyzer',
        'content authenticity',
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
                    <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
                        <div className="container mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        AI Content Detector
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Professional text analysis powered by advanced heuristics
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="container mx-auto px-4 py-8" role="main">
                        {children}
                    </main>

                    <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-16">
                        <div className="container mx-auto px-4 py-6">
                            <p className="text-center text-sm text-muted-foreground">
                                © 2026 AI Content Detector. Built with Next.js and shadcn/ui.
                            </p>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
