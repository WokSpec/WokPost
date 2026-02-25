import { NextResponse } from 'next/server';
import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import type { Category } from '@/lib/feed/types';


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as Category | null;
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const sort = searchParams.get('sort') ?? 'latest';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = 20;

  // KV cache
  let items: Awaited<ReturnType<typeof fetchAllSources>> = [];
  try {
    // @ts-expect-error — CF env
    const kv = globalThis.__env__?.FEED_CACHE;
    const cacheKey = `feed:${category ?? 'all'}`;
    if (kv) {
      const cached = await kv.get(cacheKey, 'json') as typeof items | null;
      if (cached) items = cached;
    }
  } catch { /* no KV in dev */ }

  if (!items.length) {
    const sources = category ? FEED_SOURCES.filter(s => s.defaultCategory === category) : FEED_SOURCES;
    items = await fetchAllSources(sources);
    try {
      // @ts-expect-error — Cloudflare env injected at runtime
      const kv = globalThis.__env__?.FEED_CACHE;
      if (kv) await kv.put(`feed:${category ?? 'all'}`, JSON.stringify(items), { expirationTtl: 1800 });
    } catch { /* no KV in dev */ }
  }

  if (category) items = items.filter(i => i.category === category);
  if (q) items = items.filter(i => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q));
  if (sort === 'trending') items = [...items].sort((a, b) => ((b.score ?? 0) + (b.commentCount ?? 0)) - ((a.score ?? 0) + (a.commentCount ?? 0)));
  else if (sort === 'impact') items = [...items].sort((a, b) => b.aiScore - a.aiScore);

  const total = items.length;
  const start = (page - 1) * limit;
  return NextResponse.json({ items: items.slice(start, start + limit), total, page, hasMore: start + limit < total });
}
