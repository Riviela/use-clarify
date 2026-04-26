import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo/tool-meta';
import { JsonLd, toolPageLd, breadcrumbLd, faqPageLd } from '@/components/structured-data';

export const metadata: Metadata = buildToolMetadata({
    slug: 'summarizer',
    title: 'Free AI Text Summarizer — Summarize Articles & Documents | Clarify',
    description:
        'Free AI summarizer that condenses long articles, essays, reports, and documents into concise bullet points or paragraphs. Save reading time without missing key ideas.',
    keywords: [
        'AI summarizer',
        'text summarizer',
        'free summarizer online',
        'article summarizer',
        'document summarizer',
        'summarize text AI',
        'TLDR generator',
        'AI summary tool',
        'metin özetleyici',
        'AI özetleme aracı',
    ],
});

const faqs = [
    {
        question: 'How long can the input text be?',
        answer:
            'Free users can summarize up to 1,500 words. Clarify Pro removes the limit and unlocks paragraph and executive summary formats.',
    },
    {
        question: 'What output formats are supported?',
        answer:
            'Bullet points are free for everyone. Pro adds paragraph format and executive summary format for professional reports.',
    },
];

export default function SummarizerLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <JsonLd
                id="ld-summarizer"
                data={toolPageLd({
                    name: 'AI Text Summarizer',
                    description:
                        'Free AI summarizer that turns long articles and documents into concise summaries.',
                    url: '/summarizer',
                })}
            />
            <JsonLd
                id="ld-summarizer-bc"
                data={breadcrumbLd([
                    { name: 'Home', url: '/' },
                    { name: 'Summarizer', url: '/summarizer' },
                ])}
            />
            <JsonLd id="ld-summarizer-faq" data={faqPageLd(faqs)} />
            {children}
        </>
    );
}
