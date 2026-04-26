import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://use-clarify.com';

export interface ToolMetaConfig {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
}

/**
 * Generates Next.js Metadata for a tool sub-route with full SEO best practices:
 * canonical, hreflang, OpenGraph, Twitter, robots.
 */
export function buildToolMetadata(config: ToolMetaConfig): Metadata {
    const url = `${SITE_URL}/${config.slug}`;
    const ogImage = config.ogImage || '/clarify.png';

    return {
        title: config.title,
        description: config.description,
        keywords: config.keywords,
        alternates: {
            canonical: `/${config.slug}`,
            languages: {
                'en-US': `/${config.slug}`,
                'tr-TR': `/${config.slug}`,
                'x-default': `/${config.slug}`,
            },
        },
        openGraph: {
            type: 'website',
            url,
            title: config.title,
            description: config.description,
            siteName: 'Clarify',
            locale: 'en_US',
            alternateLocale: ['tr_TR'],
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: config.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            site: '@useclarifycom',
            creator: '@useclarifycom',
            title: config.title,
            description: config.description,
            images: [ogImage],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
                'max-video-preview': -1,
            },
        },
    };
}
