import { NextResponse } from 'next/server';
import { getDB } from '@/lib/cloudflare';

// GET /api/search?q=<query>&limit=<n>&offset=<n>
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawQ = url.searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 50);
  const offset = Number(url.searchParams.get('offset') ?? 0);

  if (!rawQ || rawQ.length < 2) {
    return NextResponse.json({ results: [], total: 0, query: rawQ });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ results: [], total: 0, query: rawQ });

  // Sanitize for FTS5: escape special chars, wrap in quotes for phrase search
  const q = rawQ.toLowerCase();
  const ftsQ = `"${rawQ.replace(/"/g, '""')}"`;
  const ftsQWild = rawQ.replace(/"/g, '""').split(/\s+/).map(t => `"${t}"*`).join(' ');

  // Try FTS5 first, fall back to LIKE on any error
  let feedResults: Record<string, unknown>[] = [];
  let editResults: Record<string, unknown>[] = [];

  try {
    const [fFeed, fEdit] = await Promise.all([
      // FTS5 phrase search, then prefix search
      db.prepare(`
        SELECT fi.id, fi.title, fi.url, fi.source_name, fi.category,
               fi.summary, fi.thumbnail, fi.published_at, fi.score,
               'story' as result_type, NULL as slug,
               fts.rank as fts_rank
        FROM feed_fts fts
        JOIN feed_items fi ON fi.rowid = fts.rowid
        WHERE feed_fts MATCH ?1
        ORDER BY fts.rank, fi.published_at DESC
        LIMIT ?2 OFFSET ?3
      `).bind(ftsQ, limit, offset).all().catch(() =>
        db.prepare(`
          SELECT fi.id, fi.title, fi.url, fi.source_name, fi.category,
                 fi.summary, fi.thumbnail, fi.published_at, fi.score,
                 'story' as result_type, NULL as slug, 0 as fts_rank
          FROM feed_fts fts
          JOIN feed_items fi ON fi.rowid = fts.rowid
          WHERE feed_fts MATCH ?1
          ORDER BY fi.published_at DESC
          LIMIT ?2 OFFSET ?3
        `).bind(ftsQWild, limit, offset).all()
      ),

      db.prepare(`
        SELECT ep.id, ep.title, ('/editorial/' || ep.slug) as url, 'WokPost' as source_name,
               ep.category, ep.excerpt as summary, ep.cover_image as thumbnail,
               ep.created_at as published_at, 0 as score,
               'editorial' as result_type, ep.slug, fts.rank as fts_rank
        FROM editorial_fts fts
        JOIN editorial_posts ep ON ep.rowid = fts.rowid
        WHERE editorial_fts MATCH ?1 AND ep.published = 1
        ORDER BY fts.rank, ep.created_at DESC
        LIMIT ?2 OFFSET ?3
      `).bind(ftsQ, limit, offset).all().catch(() =>
        db.prepare(`
          SELECT ep.id, ep.title, ('/editorial/' || ep.slug) as url, 'WokPost' as source_name,
                 ep.category, ep.excerpt as summary, ep.cover_image as thumbnail,
                 ep.created_at as published_at, 0 as score,
                 'editorial' as result_type, ep.slug, 0 as fts_rank
          FROM editorial_fts fts
          JOIN editorial_posts ep ON ep.rowid = fts.rowid
          WHERE editorial_fts MATCH ?1 AND ep.published = 1
          ORDER BY ep.created_at DESC
          LIMIT ?2 OFFSET ?3
        `).bind(ftsQWild, limit, offset).all()
      ),
    ]);
    feedResults = (fFeed.results ?? []) as Record<string, unknown>[];
    editResults = (fEdit.results ?? []) as Record<string, unknown>[];
  } catch {
    // FTS unavailable — fall back to LIKE
    const pattern = `%${q}%`;
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
        SELECT id, title, ('/editorial/' || slug) as url, 'WokPost' as source_name, category,
               excerpt as summary, cover_image as thumbnail, created_at as published_at, 0 as score,
               'editorial' as result_type, slug
        FROM editorial_posts
        WHERE published = 1 AND (title LIKE ?1 OR excerpt LIKE ?1)
        ORDER BY CASE WHEN title LIKE ?1 THEN 1 ELSE 2 END, created_at DESC
        LIMIT ?2 OFFSET ?3
      `).bind(pattern, limit, offset).all(),
    ]);
    feedResults = (feedRes.results ?? []) as Record<string, unknown>[];
    editResults = (editRes.results ?? []) as Record<string, unknown>[];
  }

  // Merge, dedupe, rank
  const seen = new Set<string>();
  const combined = [...(editResults), ...(feedResults)]
    .filter(r => { const k = r.id as string; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => {
      const aTitle = (a.title as string).toLowerCase().includes(q) ? 0 : 1;
      const bTitle = (b.title as string).toLowerCase().includes(q) ? 0 : 1;
      if (aTitle !== bTitle) return aTitle - bTitle;
      return new Date(b.published_at as string).getTime() - new Date(a.published_at as string).getTime();
    })
    .slice(0, limit);

  return NextResponse.json(
    { results: combined, total: combined.length, query: rawQ },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}

