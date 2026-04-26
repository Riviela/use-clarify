import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo/tool-meta';
import { JsonLd, toolPageLd, breadcrumbLd, faqPageLd } from '@/components/structured-data';

export const metadata: Metadata = buildToolMetadata({
    slug: 'hallucination',
    title: 'AI Hallucination Detector — Spot False Claims in AI Text | Clarify',
    description:
        'Free AI hallucination detector that flags suspicious facts, fabricated statistics, and unsupported claims in ChatGPT, GPT-4, Claude, and Gemini output. Trust what you publish.',
    keywords: [
        'AI hallucination detector',
        'AI fact checker',
        'detect AI hallucinations',
        'check ChatGPT facts',
        'AI false claim detector',
        'AI fact-checking tool',
        'fact checker AI',
        'halüsinasyon dedektörü',
        'AI gerçek kontrol',
    ],
});

const faqs = [
    {
        question: 'What counts as an AI hallucination?',
        answer:
            'Hallucinations are confident-sounding statements an AI invents — fake statistics, wrong dates, fabricated citations, or unsupported claims. Our detector highlights the most suspicious ones.',
    },
    {
        question: 'How does the detector work?',
        answer:
            'Clarify analyzes the text for unverifiable factual claims, internal contradictions, and statements with low confidence based on its training and reasoning.',
    },
];

export default function HallucinationLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <JsonLd
                id="ld-hallucination"
                data={toolPageLd({
                    name: 'AI Hallucination Detector',
                    description:
                        'Detect false claims, fabricated statistics, and unsupported facts in AI-generated text.',
                    url: '/hallucination',
                })}
            />
            <JsonLd
                id="ld-hallucination-bc"
                data={breadcrumbLd([
                    { name: 'Home', url: '/' },
                    { name: 'Hallucination Detector', url: '/hallucination' },
                ])}
            />
            <JsonLd id="ld-hallucination-faq" data={faqPageLd(faqs)} />
            {children}
        </>
    );
}
