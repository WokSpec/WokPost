import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/feed/types';

const BASE = 'https://wokpost.wokspec.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${BASE}/newsletter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/trending`, lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${BASE}/search`,   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map(cat => ({
    url: `${BASE}/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages];
}
