import Script from 'next/script';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://use-clarify.com';

interface JsonLdProps {
    data: Record<string, unknown> | Record<string, unknown>[];
    id?: string;
}

/**
 * Renders JSON-LD structured data inline.
 * Use Next.js Script component with `type="application/ld+json"` for maximum SEO impact.
 */
export function JsonLd({ data, id }: JsonLdProps) {
    return (
        <Script
            id={id || `jsonld-${Math.random().toString(36).slice(2)}`}
            type="application/ld+json"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// ─── Reusable graph builders ────────────────────────────────────────────────

export const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: 'Clarify',
    legalName: 'Clarify',
    url: SITE_URL,
    logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/clarify.png`,
        width: 1024,
        height: 320,
    },
    sameAs: [
        'https://twitter.com/useclarifycom',
        'https://x.com/useclarifycom',
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@use-clarify.com',
        contactType: 'customer support',
        availableLanguage: ['English', 'Turkish'],
    },
};

export const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: 'Clarify',
    description:
        'AI content detector, humanizer, paraphraser, grammar checker, summarizer, tone changer, expander, and hallucination detector — all in one platform.',
    publisher: { '@id': `${SITE_URL}#organization` },
    inLanguage: ['en', 'tr'],
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
};

export const softwareAppLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}#software`,
    name: 'Clarify — AI Detection & Humanization Platform',
    description:
        'All-in-one AI text platform: detect AI-generated content, humanize robotic text, paraphrase, summarize, fix grammar, change tone, expand drafts, and catch hallucinations.',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'AI Writing Assistant',
    operatingSystem: 'Web Browser',
    url: SITE_URL,
    image: `${SITE_URL}/clarify.png`,
    softwareVersion: '1.0',
    offers: [
        {
            '@type': 'Offer',
            name: 'Free',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free plan with basic AI detection and limited tools.',
        },
        {
            '@type': 'Offer',
            name: 'Clarify Pro Monthly',
            price: '19.99',
            priceCurrency: 'USD',
            description: 'Pro plan billed monthly — unlimited tools and humanizer.',
        },
        {
            '@type': 'Offer',
            name: 'Clarify Pro Yearly',
            price: '199.99',
            priceCurrency: 'USD',
            description: 'Pro plan billed yearly — save over 16%.',
        },
    ],
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '1280',
        bestRating: '5',
        worstRating: '1',
    },
    creator: { '@id': `${SITE_URL}#organization` },
    publisher: { '@id': `${SITE_URL}#organization` },
};

interface BreadcrumbItem {
    name: string;
    url: string;
}

export function breadcrumbLd(items: BreadcrumbItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        })),
    };
}

interface FaqItem {
    question: string;
    answer: string;
}

export function faqPageLd(faqs: FaqItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

interface ToolPageLdParams {
    name: string;
    description: string;
    url: string;
    isFreeTool?: boolean;
}

export function toolPageLd({ name, description, url, isFreeTool = true }: ToolPageLdParams) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name,
        description,
        url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript and a modern browser.',
        isAccessibleForFree: isFreeTool,
        creator: { '@id': `${SITE_URL}#organization` },
        publisher: { '@id': `${SITE_URL}#organization` },
        offers: {
            '@type': 'Offer',
            price: isFreeTool ? '0' : '19.99',
            priceCurrency: 'USD',
        },
    };
}
