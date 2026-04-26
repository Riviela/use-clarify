import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo/tool-meta';
import { JsonLd, toolPageLd, breadcrumbLd, faqPageLd } from '@/components/structured-data';

export const metadata: Metadata = buildToolMetadata({
    slug: 'tone',
    title: 'AI Tone Changer — Rewrite in Any Voice | Clarify',
    description:
        'Free AI tone changer that rewrites your text in professional, academic, casual, witty, or persuasive voice. Find the perfect tone for any audience.',
    keywords: [
        'AI tone changer',
        'tone of voice rewriter',
        'change writing tone',
        'professional tone rewriter',
        'casual tone rewriter',
        'academic tone rewriter',
        'persuasive tone',
        'rewrite tone AI',
        'ton değiştirici',
    ],
});

const faqs = [
    {
        question: 'Which tones are available?',
        answer:
            'Professional tone is free for everyone. Academic, Casual, Witty, and Aggressive tones are unlocked with Clarify Pro.',
    },
    {
        question: 'Will the meaning of the text stay the same?',
        answer:
            'Yes — the tone changer rewrites style and voice while preserving the original meaning and key points.',
    },
];

export default function ToneLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <JsonLd
                id="ld-tone"
                data={toolPageLd({
                    name: 'AI Tone Changer',
                    description:
                        'Rewrite text in different tones — professional, academic, casual, witty, or persuasive.',
                    url: '/tone',
                })}
            />
            <JsonLd
                id="ld-tone-bc"
                data={breadcrumbLd([
                    { name: 'Home', url: '/' },
                    { name: 'Tone Changer', url: '/tone' },
                ])}
            />
            <JsonLd id="ld-tone-faq" data={faqPageLd(faqs)} />
            {children}
        </>
    );
}
