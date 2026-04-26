// Helper component used by app/page.tsx to inject FAQ schema.
// Lives in a route-group folder so it doesn't create a routable URL.
import { JsonLd, faqPageLd } from '@/components/structured-data';

const HOMEPAGE_FAQS = [
    {
        question: 'What is Clarify?',
        answer:
            'Clarify is an all-in-one AI text platform: it detects AI-generated content, humanizes robotic text, fixes grammar, summarizes, paraphrases, expands drafts, changes tone, and catches hallucinations — all in one workspace.',
    },
    {
        question: 'How accurate is the Clarify AI Detector?',
        answer:
            'Clarify uses state-of-the-art language models to classify text as Human, AI-Generated, or AI-Refined. Results consistently outperform single-model detectors and reliably catch ChatGPT, GPT-4, Claude, Gemini, and Llama output.',
    },
    {
        question: 'What is the difference between the Free and Pro plans?',
        answer:
            'The Free plan includes the AI Detector with a 500-word limit and basic tools. Clarify Pro unlocks the Humanizer, 3,000-word limit, all summary formats, all tones, advanced grammar, full hallucination details, and priority processing.',
    },
    {
        question: 'Which AI models power Clarify?',
        answer:
            'Clarify runs on fast frontier models served via Groq for sub-second responses. We use multiple specialized models for different tools to deliver the best result for each task.',
    },
    {
        question: 'Is my text private and secure?',
        answer:
            'Yes. Your text is never stored beyond the analysis. We do not train models on your input, all communication is encrypted in transit, and processing is done securely.',
    },
    {
        question: 'Can I cancel my subscription anytime?',
        answer:
            'Absolutely. Cancel any time from the Settings page. You keep Pro access until the end of your billing period.',
    },
    {
        question: 'Do you offer a refund?',
        answer:
            'Yes — Clarify offers a 7-day money-back guarantee on first-time subscriptions. Email info@use-clarify.com within 7 days for a full refund.',
    },
    {
        question: 'Which languages does Clarify support?',
        answer:
            'The interface is available in English and Turkish. AI tools handle 50+ languages including English, Turkish, German, French, Spanish, and more.',
    },
];

export function HomeFaqJsonLd() {
    return <JsonLd id="ld-home-faq" data={faqPageLd(HOMEPAGE_FAQS)} />;
}
