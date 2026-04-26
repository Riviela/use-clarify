import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo/tool-meta';
import { JsonLd, toolPageLd, breadcrumbLd, faqPageLd } from '@/components/structured-data';

export const metadata: Metadata = buildToolMetadata({
    slug: 'grammar',
    title: 'Free AI Grammar Checker — Fix Spelling & Punctuation | Clarify',
    description:
        'Free online grammar checker powered by AI. Catch typos, spelling mistakes, and punctuation errors instantly. A clean Grammarly alternative — no signup required.',
    keywords: [
        'grammar checker',
        'free grammar checker',
        'AI grammar checker',
        'spelling checker',
        'punctuation checker',
        'Grammarly alternative',
        'online grammar fix',
        'fix grammar online',
        'gramer kontrol',
        'imla kontrol',
    ],
});

const faqs = [
    {
        question: 'Is the grammar checker free?',
        answer:
            'Yes. Basic spelling and punctuation correction is free. Style, fluency, and tone improvements are part of Clarify Pro.',
    },
    {
        question: 'How accurate is the tool?',
        answer:
            'Clarify uses state-of-the-art language models for highly accurate grammar, spelling, and punctuation correction in seconds.',
    },
];

export default function GrammarLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <JsonLd
                id="ld-grammar"
                data={toolPageLd({
                    name: 'AI Grammar Checker',
                    description:
                        'Free online grammar, spelling, and punctuation checker powered by AI.',
                    url: '/grammar',
                })}
            />
            <JsonLd
                id="ld-grammar-bc"
                data={breadcrumbLd([
                    { name: 'Home', url: '/' },
                    { name: 'Grammar Checker', url: '/grammar' },
                ])}
            />
            <JsonLd id="ld-grammar-faq" data={faqPageLd(faqs)} />
            {children}
        </>
    );
}
