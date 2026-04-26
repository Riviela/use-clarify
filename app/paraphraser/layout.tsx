import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo/tool-meta';
import { JsonLd, toolPageLd, breadcrumbLd, faqPageLd } from '@/components/structured-data';

export const metadata: Metadata = buildToolMetadata({
    slug: 'paraphraser',
    title: 'Free AI Paraphraser — Rewrite Text Online | Clarify',
    description:
        'Free AI paraphrasing tool that rewrites your text in natural, plagiarism-free language. Better than QuillBot for clean, fluent rewrites — no signup required.',
    keywords: [
        'paraphraser',
        'AI paraphraser',
        'paraphrasing tool',
        'free paraphraser online',
        'rewrite tool',
        'AI rewriter',
        'sentence rewriter',
        'QuillBot alternative',
        'plagiarism-free rewrite',
        'paraphrase aracı',
        'metin yeniden yazma',
    ],
});

const faqs = [
    {
        question: 'How does Clarify’s paraphraser work?',
        answer:
            'It uses advanced language models to reword your text while preserving the original meaning. The output is fluent, varied, and reads as if a human wrote it.',
    },
    {
        question: 'Is it free to use?',
        answer:
            'Yes — paraphrase up to 100 words for free. Upgrade to Clarify Pro for unlimited length and tone control.',
    },
    {
        question: 'Will the output be unique?',
        answer:
            'The paraphraser produces substantially different wording with the same meaning, helping you avoid duplicate-content issues.',
    },
];

export default function ParaphraserLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <JsonLd
                id="ld-paraphraser"
                data={toolPageLd({
                    name: 'AI Paraphraser',
                    description:
                        'Free online paraphrasing tool that rewrites text in clear, natural, plagiarism-free language.',
                    url: '/paraphraser',
                })}
            />
            <JsonLd
                id="ld-paraphraser-bc"
                data={breadcrumbLd([
                    { name: 'Home', url: '/' },
                    { name: 'Paraphraser', url: '/paraphraser' },
                ])}
            />
            <JsonLd id="ld-paraphraser-faq" data={faqPageLd(faqs)} />
            {children}
        </>
    );
}
