import { NextResponse } from 'next/server';
import { getDB } from '@/lib/cloudflare';

// GET /api/search?q=<query>&limit=<n>&offset=<n>
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 50);
  const offset = Number(url.searchParams.get('offset') ?? 0);

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0, query: q });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ results: [], total: 0, query: q });

  const pattern = `%${q}%`;

  // Search feed_items
  const [feedRes, editRes] = await Promise.all([
    db.prepare(`
      SELECT id, title, url, source_name, category, summary, thumbnail, published_at, score,
             'story' as result_type, NULL as slug
      FROM feed_items
      WHERE title LIKE ?1 OR summary LIKE ?1
      ORDER BY CASE WHEN title LIKE ?1 THEN 1 ELSE 2 END, published_at DESC
      LIMIT ?2 OFFSET ?3
    `).bind(pattern, limit, offset).all(),

    db.prepare(`
      SELECT id, title, ('/editorial/' || slug) as url, 'WokPost' as source_name, category, excerpt as summary,
             cover_image as thumbnail, created_at as published_at, 0 as score,
             'editorial' as result_type, slug
      FROM editorial_posts
      WHERE published = 1 AND (title LIKE ?1 OR excerpt LIKE ?1 OR content LIKE ?1)
      ORDER BY CASE WHEN title LIKE ?1 THEN 1 ELSE 2 END, created_at DESC
      LIMIT ?2 OFFSET ?3
    `).bind(pattern, limit, offset).all(),
  ]);

  // Merge and sort by relevance (title match first, then recency)
  const combined = [
    ...(feedRes.results ?? []),
    ...(editRes.results ?? []),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ].sort((a: any, b: any) => {
    const aTitle = (a.title as string).toLowerCase().includes(q.toLowerCase()) ? 0 : 1;
    const bTitle = (b.title as string).toLowerCase().includes(q.toLowerCase()) ? 0 : 1;
    if (aTitle !== bTitle) return aTitle - bTitle;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  }).slice(0, limit);

  return NextResponse.json({ results: combined, total: combined.length, query: q });
}
