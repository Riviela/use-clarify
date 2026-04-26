import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo/tool-meta';
import { JsonLd, breadcrumbLd } from '@/components/structured-data';

export const metadata: Metadata = buildToolMetadata({
    slug: 'pricing',
    title: 'Pricing — Free & Pro Plans for AI Writing Tools | Clarify',
    description:
        'Simple, transparent pricing. Start free with the AI Detector and basic tools. Upgrade to Clarify Pro for the AI Humanizer, 3,000-word limit, all tones, and unlimited usage.',
    keywords: [
        'Clarify pricing',
        'AI detector pricing',
        'AI humanizer price',
        'Clarify Pro',
        'AI writing tools price',
        'free AI detector',
        'AI tools subscription',
        'Clarify fiyat',
        'AI dedektör fiyat',
    ],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://use-clarify.com';

const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Clarify Pro',
    description:
        'Premium subscription for the Clarify AI text suite — unlimited AI detection, humanizer, paraphrasing, summarization, grammar, tone, expander, and hallucination details.',
    image: `${SITE_URL}/clarify.png`,
    brand: { '@type': 'Brand', name: 'Clarify' },
    offers: [
        {
            '@type': 'Offer',
            name: 'Clarify Pro Monthly',
            price: '19.99',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `${SITE_URL}/pricing`,
            priceValidUntil: '2030-01-01',
        },
        {
            '@type': 'Offer',
            name: 'Clarify Pro Yearly',
            price: '199.99',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `${SITE_URL}/pricing`,
            priceValidUntil: '2030-01-01',
        },
    ],
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '1280',
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <JsonLd id="ld-pricing-product" data={productLd} />
            <JsonLd
                id="ld-pricing-bc"
                data={breadcrumbLd([
                    { name: 'Home', url: '/' },
                    { name: 'Pricing', url: '/pricing' },
                ])}
            />
            {children}
        </>
    );
}
