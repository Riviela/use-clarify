import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo/tool-meta';
import { JsonLd, toolPageLd, breadcrumbLd, faqPageLd } from '@/components/structured-data';

export const metadata: Metadata = buildToolMetadata({
    slug: 'humanizer',
    title: 'AI Humanizer — Convert AI Text to Human Writing | Clarify',
    description:
        'Free AI Humanizer. Transform ChatGPT, GPT-4, Claude, and Gemini output into natural, human-sounding writing that bypasses AI detectors. Preserves meaning, removes the robotic fingerprint.',
    keywords: [
        'AI humanizer',
        'humanize AI text',
        'AI to human text converter',
        'undetectable AI',
        'bypass AI detection',
        'humanize ChatGPT',
        'humanize GPT-4',
        'AI text humanizer free',
        'best AI humanizer',
        'AI humanizer no signup',
        'rewrite AI text to human',
        'metin insanlaştırıcı',
        'AI insanlaştırıcı',
    ],
});

const faqs = [
    {
        question: 'What does the AI Humanizer do?',
        answer:
            'It rewrites AI-generated text so it reads naturally, like a human wrote it. The tool removes repetitive phrasing, robotic sentence structures, and tell-tale AI signals while preserving meaning.',
    },
    {
        question: 'Will the output bypass AI detectors?',
        answer:
            'Clarify’s humanizer is engineered to dramatically lower AI-detection scores on tools like GPTZero, Originality.ai, and Turnitin. We always recommend reviewing and personalizing the result.',
    },
    {
        question: 'Is the AI Humanizer free?',
        answer:
            'A preview is available on the Free plan. Full unlimited humanization is included with Clarify Pro.',
    },
];

export default function HumanizerLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <JsonLd
                id="ld-humanizer"
                data={toolPageLd({
                    name: 'AI Humanizer',
                    description:
                        'Convert AI-generated text into human-quality writing that bypasses AI detectors.',
                    url: '/humanizer',
                    isFreeTool: false,
                })}
            />
            <JsonLd
                id="ld-humanizer-bc"
                data={breadcrumbLd([
                    { name: 'Home', url: '/' },
                    { name: 'AI Humanizer', url: '/humanizer' },
                ])}
            />
            <JsonLd id="ld-humanizer-faq" data={faqPageLd(faqs)} />
            {children}
        </>
    );
}
