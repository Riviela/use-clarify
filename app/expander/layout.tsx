import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo/tool-meta';
import { JsonLd, toolPageLd, breadcrumbLd, faqPageLd } from '@/components/structured-data';

export const metadata: Metadata = buildToolMetadata({
    slug: 'expander',
    title: 'Free AI Text Expander — Expand Sentences & Drafts | Clarify',
    description:
        'AI text expander that turns short sentences and outlines into full paragraphs and detailed drafts. Beat writer’s block and flesh out ideas in seconds.',
    keywords: [
        'AI text expander',
        'text expander',
        'sentence expander',
        'paragraph expander',
        'expand text AI',
        'flesh out writing',
        'writing expander',
        'AI draft expander',
        'metin genişletici',
    ],
});

const faqs = [
    {
        question: 'How long can the expanded output be?',
        answer:
            'Free plan caps the expansion at around 300 words and shows a preview. Clarify Pro expands up to 3,000 words with the full text revealed.',
    },
    {
        question: 'When should I use a text expander?',
        answer:
            'It’s perfect for turning bullet points into full paragraphs, expanding outlines into drafts, or breaking writer’s block on essays and articles.',
    },
];

export default function ExpanderLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <JsonLd
                id="ld-expander"
                data={toolPageLd({
                    name: 'AI Text Expander',
                    description:
                        'Expand short sentences and outlines into rich, detailed paragraphs with AI.',
                    url: '/expander',
                })}
            />
            <JsonLd
                id="ld-expander-bc"
                data={breadcrumbLd([
                    { name: 'Home', url: '/' },
                    { name: 'Text Expander', url: '/expander' },
                ])}
            />
            <JsonLd id="ld-expander-faq" data={faqPageLd(faqs)} />
            {children}
        </>
    );
}
