import { NextResponse } from 'next/server';
import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import type { Category, FeedItem } from '@/lib/feed/types';
import { getDB, getKV } from '@/lib/cloudflare';

// ── Cache config ─────────────────────────────────────────────────────────────
const CACHE_SOFT_TTL_S = 900;   // 15 min — serve stale after this, trigger background refresh
const CACHE_HARD_TTL_S = 1800;  // 30 min — KV hard expiry (fallback stale window)
const LOCK_TTL_S = 60;           // 60s refresh lock (prevents thundering herd)

interface CacheEntry { items: FeedItem[]; fetchedAt: number }

// ── Upsert fetched items into D1 for persistent /post/[id] lookup ────────────
async function persistItems(items: FeedItem[]) {
  try {
    const db = await getDB();
    if (!db) return;
    // Batch in chunks of 50
    for (let i = 0; i < items.length; i += 50) {
      const chunk = items.slice(i, i + 50);
      const stmts = chunk.map(item =>
        db.prepare(`INSERT OR REPLACE INTO feed_items
          (id, title, url, source_id, source_name, source_type, source_tier,
           content_type, category, ai_tagged, ai_score, published_at,
           summary, tags, thumbnail, score, repo_language, repo_topics, fetched_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`)
          .bind(
            item.id, item.title, item.url, item.sourceId, item.sourceName,
            item.sourceType, item.sourceTier, item.contentType ?? 'story',
            item.category, item.aiTagged ? 1 : 0, item.aiScore,
            item.publishedAt, item.summary ?? '',
            JSON.stringify(item.tags ?? []),
            item.thumbnail ?? null, item.score ?? null,
            item.repoLanguage ?? null,
            item.repoTopics ? JSON.stringify(item.repoTopics) : null,
          )
      );
      await db.batch(stmts);
    }
  } catch (err) {
    console.error('[feed] persistItems failed:', err);
  }
}

// ── Background cache refresh (stale-while-revalidate) ────────────────────────
async function refreshCache(cacheKey: string, sources: typeof FEED_SOURCES) {
  const kv = await getKV();
  if (!kv) return;

  // Set a lock to prevent concurrent refreshes
  const lockKey = `lock:${cacheKey}`;
  const existingLock = await kv.get(lockKey);
  if (existingLock) return; // another worker is already refreshing

  await kv.put(lockKey, '1', { expirationTtl: LOCK_TTL_S });

  try {
    const items = await fetchAllSources(sources);
    if (items.length > 0) {
      const entry: CacheEntry = { items, fetchedAt: Date.now() };
      await kv.put(cacheKey, JSON.stringify(entry), { expirationTtl: CACHE_HARD_TTL_S });
      persistItems(items); // fire-and-forget
    }
  } catch (err) {
    console.error('[feed] refreshCache failed:', err);
  } finally {
    await kv.delete(lockKey);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as Category | null;
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const sort = searchParams.get('sort') ?? 'latest';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const format = searchParams.get('format') ?? 'json';
  const limit = format === 'rss' ? 50 : 20;

  const cacheKey = `feed2:${category ?? 'all'}`;

  // ── KV cache with stale-while-revalidate ────────────────────────────────────
  let items: FeedItem[] | undefined;
  let cacheStatus: 'HIT' | 'STALE' | 'MISS' = 'MISS';
  let isStale = false;

  try {
    const kv = await getKV();
    if (kv) {
      const raw = await kv.get(cacheKey, 'json') as CacheEntry | null;
      if (raw?.items?.length) {
        items = raw.items;
        const ageS = (Date.now() - raw.fetchedAt) / 1000;
        if (ageS > CACHE_SOFT_TTL_S) {
          cacheStatus = 'STALE';
          isStale = true;
        } else {
          cacheStatus = 'HIT';
        }
      }
    }
  } catch { /* no KV in local dev */ }

  // Trigger background refresh when stale (stale-while-revalidate)
  if (isStale) {
    const sources = category ? FEED_SOURCES.filter(s => s.defaultCategory === category) : FEED_SOURCES;
    // Don't await — background refresh
    refreshCache(cacheKey, sources).catch(() => {});
  }

  if (!items) {
    // Cold cache miss — fetch synchronously
    const sources = category ? FEED_SOURCES.filter(s => s.defaultCategory === category) : FEED_SOURCES;
    items = await fetchAllSources(sources);

    // Write to KV
    try {
      const kv = await getKV();
      if (kv) {
        const entry: CacheEntry = { items, fetchedAt: Date.now() };
        await kv.put(cacheKey, JSON.stringify(entry), { expirationTtl: CACHE_HARD_TTL_S });
      }
    } catch { /* no KV in local dev */ }

    persistItems(items); // fire-and-forget
  }

  // ── Inject editorial posts from D1 (always fresh) ──────────────────────────
  try {
    const db = await getDB();
    if (db) {
      const editQuery = category
        ? 'SELECT * FROM editorial_posts WHERE published = 1 AND category = ?1 ORDER BY featured DESC, created_at DESC LIMIT 20'
        : 'SELECT * FROM editorial_posts WHERE published = 1 ORDER BY featured DESC, created_at DESC LIMIT 20';
      const { results: editPosts } = await (category
        ? db.prepare(editQuery).bind(category)
        : db.prepare(editQuery)
      ).all();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editItems: FeedItem[] = (editPosts as any[]).map(p => ({
        id: `editorial-${p.slug}`,
        title: p.title,
        url: `https://wokpost.wokspec.org/editorial/${p.slug}`,
        sourceId: 'wokpost-editorial',
        sourceName: p.author_name,
        sourceType: 'editorial' as const,
        sourceTier: 1 as const,
        contentType: 'editorial' as const,
        category: p.category,
        aiTagged: false,
        aiScore: 9,
        publishedAt: p.created_at,
        summary: p.excerpt,
        tags: (() => { try { return JSON.parse(p.tags); } catch { return []; } })(),
        thumbnail: p.cover_image ?? undefined,
        authorName: p.author_name,
        authorAvatar: p.author_avatar ?? undefined,
        editorialSlug: p.slug,
      }));
      // Prepend featured editorial posts, then merge rest
      const featuredEdit = editItems.filter(e => (editPosts as {slug:string|number;featured:number}[]).find(p => `editorial-${p.slug}` === e.id)?.featured === 1);
      const regularEdit = editItems.filter(e => !featuredEdit.includes(e));
      items = [...featuredEdit, ...items, ...regularEdit];
    }
  } catch { /* editorial posts unavailable */ }

  let filtered = items as FeedItem[];

  // Filter
  if (category) filtered = filtered.filter(i => i.category === category);
  if (q) filtered = filtered.filter(i =>
    i.title.toLowerCase().includes(q) || (i.summary ?? '').toLowerCase().includes(q)
  );

  // Sort
  if (sort === 'trending') {
    filtered = [...filtered].sort((a, b) =>
      ((b.score ?? 0) + (b.commentCount ?? 0)) - ((a.score ?? 0) + (a.commentCount ?? 0))
    );
  } else if (sort === 'impact') {
    filtered = [...filtered].sort((a, b) => b.aiScore - a.aiScore);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  // ── RSS output ──────────────────────────────────────────────────────────────
  if (format === 'rss') {
    const feedTitle = category
      ? `WokPost — ${category.charAt(0).toUpperCase() + category.slice(1)}`
      : 'WokPost — Workflow insights for builders';
    const feedLink = 'https://wokpost.wokspec.org';
    const feedDesc = 'Curated workflow tips, tools, and tutorials for indie developers, creators, and businesses.';
    const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const items_xml = paged.map(item => {
      const itemUrl = item.url.startsWith('http') ? item.url : `${feedLink}${item.url}`;
      return `
    <item>
      <title>${escape(item.title)}</title>
      <link>${escape(itemUrl)}</link>
      <guid isPermaLink="false">${escape(item.id)}</guid>
      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
      <category>${escape(item.category)}</category>
      <source url="${escape(feedLink)}">${escape(item.sourceName)}</source>
      ${item.summary ? `<description>${escape(item.summary.slice(0, 500))}</description>` : ''}
      ${item.thumbnail ? `<enclosure url="${escape(item.thumbnail)}" type="image/jpeg" length="0"/>` : ''}
    </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(feedTitle)}</title>
    <link>${escape(feedLink)}</link>
    <description>${escape(feedDesc)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escape(feedLink)}/api/feed?format=rss${category ? `&amp;category=${category}` : ''}" rel="self" type="application/rss+xml"/>
    ${items_xml}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800',
      },
    });
  }

  return NextResponse.json(
    { items: paged, total, page, hasMore: start + limit < total },
    {
      headers: {
        'X-Cache': cacheStatus,
        // Edge CDN: serve for 5 min, allow stale for 10 more while revalidating
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Vary': 'Accept-Encoding',
      },
    }
  );
}

