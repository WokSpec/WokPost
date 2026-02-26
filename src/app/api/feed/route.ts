import { NextResponse } from 'next/server';
import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import type { Category } from '@/lib/feed/types';


function rateKey(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as Category | null;
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const sort = searchParams.get('sort') ?? 'latest';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = 20;

  // Try KV cache
  let items;
  try {
    // @ts-expect-error — Cloudflare env injected at runtime
    const kv = process.env.FEED_CACHE ?? globalThis.__env__?.FEED_CACHE;
    const cacheKey = `feed:${category ?? 'all'}`;
    if (kv) {
      const cached = await kv.get(cacheKey, 'json');
      if (cached) {
        items = cached;
      }
    }
  } catch { /* no KV in local dev */ }

  if (!items) {
    const sources = category ? FEED_SOURCES.filter(s => s.defaultCategory === category) : FEED_SOURCES;
    items = await fetchAllSources(sources);

    // Store in KV for 30 min
    try {
      // @ts-expect-error
      const kv = process.env.FEED_CACHE ?? globalThis.__env__?.FEED_CACHE;
      if (kv) await kv.put(`feed:${category ?? 'all'}`, JSON.stringify(items), { expirationTtl: 1800 });
    } catch { /* no KV in local dev */ }
  }

  // Filter
  if (category) items = items.filter((i: { category: Category }) => i.category === category);
  if (q) items = items.filter((i: { title: string; summary: string }) =>
    i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q)
  );

  // Sort
  if (sort === 'trending') {
    items = [...items].sort((a: { score?: number; commentCount?: number }, b: { score?: number; commentCount?: number }) =>
      ((b.score ?? 0) + (b.commentCount ?? 0)) - ((a.score ?? 0) + (a.commentCount ?? 0))
    );
  } else if (sort === 'impact') {
    items = [...items].sort((a: { aiScore: number }, b: { aiScore: number }) => b.aiScore - a.aiScore);
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return NextResponse.json({ items: paged, total, page, hasMore: start + limit < total });
}
