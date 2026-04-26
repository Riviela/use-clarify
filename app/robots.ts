import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://use-clarify.com';

const PRIVATE_PATHS = [
    '/api/',
    '/admin',
    '/admin/',
    '/settings',
    '/settings/',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/auth/',
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Default — all good crawlers
            {
                userAgent: '*',
                allow: '/',
                disallow: PRIVATE_PATHS,
            },
            // Major search engines — explicit allow + crawl-delay none
            {
                userAgent: ['Googlebot', 'Googlebot-Image', 'Googlebot-News'],
                allow: '/',
                disallow: PRIVATE_PATHS,
            },
            {
                userAgent: ['Bingbot', 'Slurp', 'DuckDuckBot', 'YandexBot', 'Baiduspider'],
                allow: '/',
                disallow: PRIVATE_PATHS,
            },
            // Friendly AI crawlers — let them index public pages so Clarify gets cited
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'OAI-SearchBot',
                    'PerplexityBot',
                    'Perplexity-User',
                    'ClaudeBot',
                    'Claude-Web',
                    'anthropic-ai',
                    'Google-Extended',
                    'Applebot',
                    'Applebot-Extended',
                    'CCBot',
                    'Meta-ExternalAgent',
                ],
                allow: '/',
                disallow: PRIVATE_PATHS,
            },
            // Block known content-scraping / SEO-data bots that don't drive traffic
            {
                userAgent: [
                    'AhrefsBot',
                    'SemrushBot',
                    'MJ12bot',
                    'DotBot',
                    'PetalBot',
                    'BLEXBot',
                ],
                disallow: '/',
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
