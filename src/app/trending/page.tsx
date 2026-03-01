import { CATEGORIES } from '@/lib/feed/types';
import { FeedCard, NewsletterBar } from '@/components/FeedComponents';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { FeedItem } from '@/lib/feed/types';
import { IcoFire, IcoPen } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Trending',
  description: 'The top stories trending across all categories right now.',
};

export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getTrending(): Promise<FeedItem[]> {
  // Try KV cache first (same data the main feed uses)
  try {
    const kv = await (async () => { try { const { getKV } = await import('@/lib/cloudflare'); return await getKV(); } catch { return undefined; } })();
    if (kv) {
      // Try new feed2: key format first (stale-while-revalidate format)
      const entry = await kv.get('feed2:all', 'json') as { items: FeedItem[]; fetchedAt: number } | null;
      if (entry?.items && entry.items.length > 0) return entry.items;
      // Fall back to old key format
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

  // Fetch popular editorial posts (most viewed)
  type EditorialPost = { id: string; slug: string; title: string; excerpt: string; category: string; views: number; author_name: string; created_at: string; };
  let popularEditorial: EditorialPost[] = [];
  try {
    const db = await (async () => { try { const { getDB } = await import('@/lib/cloudflare'); return await getDB(); } catch { return undefined; } })();
    if (db) {
      const { results } = await db.prepare(
        'SELECT id, slug, title, excerpt, category, views, author_name, created_at FROM editorial_posts WHERE published = 1 ORDER BY views DESC, created_at DESC LIMIT 4'
      ).all() as { results: EditorialPost[] };
      popularEditorial = results;
    }
  } catch { /* no D1 */ }

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
            <IcoFire size={18} />
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
                    {hero.thumbnail && (() => { try { return new URL(hero.url).hostname; } catch { return null; } })() && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(hero.url).hostname; } catch { return ''; } })()}&sz=16`} alt="" width={14} height={14} style={{ borderRadius: 3, opacity: 0.8 }} />
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
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IcoFire size={12} /> Trending</span>
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

        {/* Editorial Picks */}
        {popularEditorial.length > 0 && (
          <div style={{ marginBottom: '3rem', padding: '1.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <IcoPen size={11} /> Editor picks
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.025em' }}>
                  From the Editor
                </div>
              </div>
              <Link href="/editorial" style={{ fontSize: '0.72rem', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                All posts →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {popularEditorial.map(ep => {
                const cat = CATEGORIES[ep.category as keyof typeof CATEGORIES];
                return (
                  <Link key={ep.id} href={`/editorial/${ep.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 6, padding: '0.875rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, transition: 'border-color 0.15s' }} className="related-post-card">
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: cat?.color ?? '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      {cat?.label ?? ep.category}
                    </span>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
                      {ep.title}
                    </div>
                    {ep.excerpt && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                        {ep.excerpt.slice(0, 90)}{ep.excerpt.length > 90 ? '…' : ''}
                      </div>
                    )}
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      {ep.author_name} · {ep.views} views
                    </div>
                  </Link>
                );
              })}
            </div>
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
              <FeedCard item={item} bookmarked={false} />
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
