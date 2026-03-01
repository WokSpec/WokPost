import { CATEGORIES } from '@/lib/feed/types';
import { FeedCard, NewsletterBar } from '@/components/FeedComponents';
import type { Metadata } from 'next';
import type { FeedItem } from '@/lib/feed/types';

export const metadata: Metadata = {
  title: 'Trending — WokPost',
  description: 'The top stories trending across all categories right now.',
};

export const revalidate = 900; // 15 min

async function getTrending(): Promise<FeedItem[]> {
  // Try KV cache first (same data the main feed uses)
  try {
    const kv = await (async () => { try { const { getKV } = await import('@/lib/cloudflare'); return await getKV(); } catch { return undefined; } })();
    if (kv) {
      const cached = await kv.get('feed:all', 'json') as FeedItem[] | null;
      if (cached && cached.length > 0) return cached;
    }
  } catch { /* no KV */ }

  // Try D1 as fallback
  try {
    const db = await (async () => { try { const { getDB } = await import('@/lib/cloudflare'); return await getDB(); } catch { return undefined; } })();
    if (db) {
      const { results } = await db.prepare(
        `SELECT id,title,url,source_id,source_name,source_type,source_tier,content_type,
                category,ai_tagged,ai_score,published_at,summary,tags,thumbnail,score
         FROM feed_items ORDER BY fetched_at DESC LIMIT 200`
      ).all();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (results as any[]).map(r => ({
        id: r.id, title: r.title, url: r.url,
        sourceId: r.source_id, sourceName: r.source_name,
        sourceType: r.source_type, sourceTier: r.source_tier,
        contentType: r.content_type ?? 'story',
        category: r.category, aiTagged: !!r.ai_tagged,
        aiScore: r.ai_score ?? 5, publishedAt: r.published_at,
        summary: r.summary ?? '', tags: [],
        thumbnail: r.thumbnail ?? undefined, score: r.score ?? undefined,
      }));
    }
  } catch { /* D1 unavailable */ }

  return [];
}

export default async function TrendingPage() {
  const items = await getTrending();

  // Score = (score ?? 0) * 2 + (aiScore * 3) + (commentCount ?? 0)
  const sorted = [...items]
    .sort((a, b) =>
      ((b.score ?? 0) * 2 + b.aiScore * 3 + (b.commentCount ?? 0)) -
      ((a.score ?? 0) * 2 + a.aiScore * 3 + (a.commentCount ?? 0))
    )
    .slice(0, 60);

  const hero = sorted[0];
  const rest = sorted.slice(1);

  return (
    <>
      {/* Page header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '2.5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-blue" style={{ width: 500, height: 500, top: -250, right: -150, opacity: 0.18 }} aria-hidden="true" />
        <div className="site-container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>🔥</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Trending now</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 10 }}>
            What everyone&apos;s reading
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 520, lineHeight: 1.7 }}>
            Top stories ranked by engagement score, AI relevance, and community signal across all {Object.keys(CATEGORIES).length} categories.
          </p>
        </div>
      </div>

      <div className="site-container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>

        {/* Hero — #1 trending story */}
        {hero && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
              #1 trending
            </div>
            <a
              href={`/post/${encodeURIComponent(hero.id)}`}
              style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s' }}
              className="trending-hero"
            >
              <div style={{ display: 'grid', gridTemplateColumns: hero.thumbnail ? '1fr 380px' : '1fr', gap: 0 }}>
                <div style={{ padding: '2rem 2.25rem' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
                    {hero.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`https://www.google.com/s2/favicons?domain=${new URL(hero.url).hostname}&sz=16`} alt="" width={14} height={14} style={{ borderRadius: 3, opacity: 0.8 }} />
                    )}
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: CATEGORIES[hero.category as keyof typeof CATEGORIES]?.color ?? 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                      {CATEGORIES[hero.category as keyof typeof CATEGORIES]?.label ?? hero.category}
                    </span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{hero.sourceName}</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.125rem, 2.5vw, 1.6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 14 }}>
                    {hero.title}
                  </h2>
                  {hero.summary && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 560, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {hero.summary}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 16, marginTop: 18, fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                    {hero.score && <span>↑ {hero.score}</span>}
                    {hero.aiScore > 0 && <span>AI {Math.round(hero.aiScore * 100)}%</span>}
                    <span>🔥 Trending</span>
                  </div>
                </div>
                {hero.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hero.thumbnail} alt="" style={{ width: '100%', height: '100%', minHeight: 220, objectFit: 'cover', display: 'block' }} />
                )}
              </div>
            </a>
          </div>
        )}

        {/* Rest of trending grid */}
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
          More trending
        </div>
        <div className="feed-grid">
          {rest.map((item, i) => (
            <div key={item.id} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-faint)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.04em' }}>
                #{i + 2}
              </div>
              <FeedCard item={item} bookmarked={false} onBookmark={() => {}} />
            </div>
          ))}
        </div>

        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            No trending items at the moment — check back soon.
          </div>
        )}
      </div>

      <NewsletterBar />
    </>
  );
}
