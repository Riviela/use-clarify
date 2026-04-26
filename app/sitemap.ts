import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://use-clarify.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' },
    { url: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
    { url: '/grammar', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/summarizer', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/expander', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/tone', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/hallucination', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/paraphraser', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/humanizer', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { url: '/terms', priority: 0.4, changeFrequency: 'yearly' },
    { url: '/refund', priority: 0.4, changeFrequency: 'yearly' },
  ];

  return routes.map((route) => ({
    ...route,
    url: `${siteUrl}${route.url}`,
    lastModified: now,
  }));
}
