import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/feed/types';

const BASE = 'https://wokpost.wokspec.org';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${BASE}/editorial`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${BASE}/discover`,  lastModified: new Date(), changeFrequency: 'daily',  priority: 0.8 },
    { url: `${BASE}/stats`,     lastModified: new Date(), changeFrequency: 'daily',  priority: 0.7 },
    { url: `${BASE}/trending`,  lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE}/newsletter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/search`,   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map(cat => ({
    url: `${BASE}/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  // Fetch editorial posts from D1 for sitemap
  let editorialPages: MetadataRoute.Sitemap = [];
  try {
    const { getDB } = await import('@/lib/cloudflare');
    const db = await getDB();
    if (db) {
      const { results } = await db.prepare(
        'SELECT slug, updated_at, created_at FROM editorial_posts WHERE published = 1'
      ).all() as { results: { slug: string; updated_at: string; created_at: string }[] };
      editorialPages = results.map(p => ({
        url: `${BASE}/editorial/${p.slug}`,
        lastModified: new Date(p.updated_at || p.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch { /* no D1 at build */ }

  return [...staticPages, ...categoryPages, ...editorialPages];
}
