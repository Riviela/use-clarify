import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Clarify — AI Detection & Humanization Platform',
        short_name: 'Clarify',
        description:
            'All-in-one AI text suite: detector, humanizer, paraphraser, grammar checker, summarizer, tone changer, expander, and hallucination detector.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#06b6d4',
        orientation: 'portrait',
        categories: ['productivity', 'utilities', 'education'],
        lang: 'en',
        icons: [
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    };
}
