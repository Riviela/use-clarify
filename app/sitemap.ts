import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://use-clarify.com';

interface RouteCfg {
    url: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const routes: RouteCfg[] = [
        { url: '/', priority: 1.0, changeFrequency: 'daily' },
        { url: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
        // Tools — high SEO value
        { url: '/humanizer', priority: 0.95, changeFrequency: 'weekly' },
        { url: '/paraphraser', priority: 0.9, changeFrequency: 'weekly' },
        { url: '/grammar', priority: 0.9, changeFrequency: 'weekly' },
        { url: '/summarizer', priority: 0.9, changeFrequency: 'weekly' },
        { url: '/expander', priority: 0.85, changeFrequency: 'weekly' },
        { url: '/tone', priority: 0.85, changeFrequency: 'weekly' },
        { url: '/hallucination', priority: 0.85, changeFrequency: 'weekly' },
        // Legal — required for trust signals
        { url: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
        { url: '/terms', priority: 0.4, changeFrequency: 'yearly' },
        { url: '/refund', priority: 0.4, changeFrequency: 'yearly' },
    ];

    return routes.map((route) => ({
        url: `${siteUrl}${route.url}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
            languages: {
                'en-US': `${siteUrl}${route.url}`,
                'tr-TR': `${siteUrl}${route.url}`,
                'x-default': `${siteUrl}${route.url}`,
            },
        },
    }));
}
