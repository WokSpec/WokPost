import Link from 'next/link';
import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CategoryStrip, NewsletterBar } from '@/components/FeedComponents';
import { InteractiveFeed } from '@/components/InteractiveFeed';
import { StockTicker } from '@/components/StockTicker';
import type { Metadata } from 'next';
import { IcoPen, CATEGORY_ICONS } from '@/components/Icons';

export const metadata: Metadata = {
  title: {
    absolute: 'WokPost — Workflow insights for builders',
  },
  description: 'Curated workflow tips, tools, and tutorials for indie developers, creators, and businesses.',
  openGraph: {
    type: 'website',
    siteName: 'WokPost',
    url: 'https://wokpost.wokspec.org',
    title: 'WokPost — Workflow insights for builders',
    description: 'Curated workflow tips, tools, and tutorials for indie developers, creators, and businesses.',
    images: [{ url: '/og.png' }],
  },
};

export const revalidate = 1800;

export default async function HomePage() {
  let items: Awaited<ReturnType<typeof fetchAllSources>> = [];
  try { items = await fetchAllSources(FEED_SOURCES.slice(0, 40)); } catch { /* build-time */ }

  // Inject editorial posts from D1 if available
  type EditorialRaw = { id: unknown; title: unknown; slug: unknown; category: unknown; excerpt: unknown; created_at: unknown; cover_image: unknown; author_name: unknown; author_avatar: unknown; };
  let editorialSidebar: EditorialRaw[] = [];
  try {
    const { getDB } = await import('@/lib/cloudflare');
    const db = await getDB();
    if (db) {
      const { results: editPosts } = await db.prepare(
        'SELECT * FROM editorial_posts WHERE published = 1 ORDER BY featured DESC, created_at DESC LIMIT 10'
      ).all() as { results: EditorialRaw[] };
      editorialSidebar = editPosts.slice(0, 5);
      const editorialItems = editPosts.map(ep => ({
        id: String(ep.id),
        title: String(ep.title),
        url: `/editorial/${ep.slug}`,
        sourceId: 'wokpost-editorial',
        sourceName: 'WokPost',
        sourceType: 'editorial' as const,
        sourceTier: 1 as const,
        contentType: 'editorial' as const,
        category: String(ep.category ?? 'ai'),
        aiTagged: false,
        aiScore: 8,
        publishedAt: String(ep.created_at ?? new Date().toISOString()),
        summary: String(ep.excerpt ?? ''),
        tags: [],
        thumbnail: ep.cover_image ? String(ep.cover_image) : undefined,
        score: undefined,
        commentCount: undefined,
        authorName: String(ep.author_name ?? ''),
        authorAvatar: ep.author_avatar ? String(ep.author_avatar) : undefined,
        editorialSlug: String(ep.slug),
      }));
      // Prepend editorial posts so they appear first in the feed
      items = [...editorialItems, ...items];
    }
  } catch { /* no D1 at build time */ }

  // Prefer editorial or high-scoring non-repo items as hero
  const heroCandidate = items.find(i => i.contentType === 'editorial') 
    ?? items.find(i => i.contentType === 'story' && (i.aiScore ?? 0) >= 7)
    ?? items[0];
  const featured = heroCandidate;
  const trending = [...items]
    .filter(i => i.contentType !== 'editorial')
    .sort((a, b) => ((b.score ?? 0) + (b.commentCount ?? 0)) - ((a.score ?? 0) + (a.commentCount ?? 0)))
    .slice(0, 6);
  const topAI = items.filter(i => i.aiTagged).slice(0, 6);
  const feedItems = items.filter(i => i.id !== featured?.id).slice(0, 60);

  // Category counts for the strip
  const catCounts: Record<string, number> = {};
  for (const item of items) {
    catCounts[item.category] = (catCounts[item.category] ?? 0) + 1;
  }

  return (
    <>
      <StockTicker />

      <CategoryStrip counts={catCounts} />

      {/* Featured hero */}
      {featured && (
        <Link
          href={featured.contentType === 'editorial' && featured.editorialSlug
            ? `/editorial/${featured.editorialSlug}`
            : `/post/${encodeURIComponent(featured.id)}`}
          className="featured-hero"
          style={featured.thumbnail ? { backgroundImage: `url(${featured.thumbnail})` } : {}}
        >
          <div className="featured-hero-overlay">
            <div className="site-container">
              <div className="hero-eyebrow">
                <span style={{ color: CATEGORIES[featured.category]?.color }}>
                  {CATEGORIES[featured.category]?.label}
                </span>
                {featured.aiTagged && (
                  <span className="ai-badge">AI {featured.aiScore}/10</span>
                )}
                {featured.contentType === 'repo' && <span className="source-type-badge source-type-repo">Repo</span>}
                {featured.contentType === 'paper' && <span className="source-type-badge source-type-paper">Paper</span>}
              </div>
              <div className="hero-title">{featured.title}</div>
              {featured.summary && (
                <div className="hero-summary">{featured.summary.slice(0, 200)}</div>
              )}
              <div className="hero-meta">
                <span>{featured.sourceName}</span>
                <span>·</span>
                <span className="hero-cta">
                  {featured.contentType === 'repo' ? 'View repository' : featured.contentType === 'paper' ? 'Read paper' : 'Read story'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Main layout */}
      <div className="site-container" style={{ paddingTop: 24, paddingBottom: 40 }}>
        <div className="layout-cols">
          {/* Feed */}
          <div>
            <div className="section-header">
              <span className="section-title">Latest Stories</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                {items.length} stories
              </span>
            </div>
            <InteractiveFeed initialItems={feedItems} initialTotal={items.length} />
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Trending */}
            <div className="sidebar-widget">
              <div className="section-title" style={{ marginBottom: 12 }}>Trending</div>
              {trending.map((item, i) => {
                const cat = CATEGORIES[item.category];
                return (
                  <Link key={item.id} href={`/post/${encodeURIComponent(item.id)}`} className="sidebar-story">
                    <span className="sidebar-rank">{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: cat?.color, marginBottom: 2, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        {cat?.label}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.45, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                        {item.title}
                      </div>
                      {item.score !== undefined && (
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                          {item.contentType === 'repo' ? `${item.score.toLocaleString()} stars` : `${item.score} pts`} · {item.sourceName}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* AI Signal */}
            {topAI.length > 0 && (
              <div className="sidebar-widget">
                <div className="section-title" style={{ marginBottom: 12 }}>AI Signal</div>
                {topAI.map(item => (
                  <Link key={item.id} href={`/post/${encodeURIComponent(item.id)}`} className="sidebar-story">
                    <span className="ai-badge" style={{ flexShrink: 0 }}>{item.aiScore}/10</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.45, fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Browse Topics */}
            <div className="sidebar-widget">
              <div className="section-title" style={{ marginBottom: 12 }}>Browse Topics</div>
              {Object.entries(CATEGORIES).map(([id, cat]) => (
                <a key={id} href={`/${id}`} className="sidebar-cat-link">
                  <span style={{ color: cat.color, fontWeight: 600, fontSize: '0.78rem', fontFamily: 'var(--font-heading)' }}>
                    {cat.label}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                    {items.filter(i => i.category === id).length}
                  </span>
                </a>
              ))}
            </div>

            {/* From the Editor */}
            {editorialSidebar.length > 0 && (
              <div className="sidebar-widget">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="section-title">From the Editor</span>
                  <Link href="/editorial" style={{ fontSize: '0.65rem', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
                    All posts →
                  </Link>
                </div>
                {editorialSidebar.map(ep => {
                  const cat = CATEGORIES[String(ep.category) as keyof typeof CATEGORIES];
                  return (
                    <Link key={String(ep.id)} href={`/editorial/${ep.slug}`} className="editor-post-item">
                      {ep.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(ep.cover_image)} alt="" className="editor-post-thumb" />
                      ) : (
                        <div className="editor-post-thumb" style={{ background: `${cat?.color ?? '#818cf8'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat?.color ?? '#818cf8' }}>
                          {(() => { const Icon = CATEGORY_ICONS[String(ep.category)]; return Icon ? <Icon size={16} /> : <IcoPen size={14} />; })()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="editor-post-title">{String(ep.title)}</div>
                        <div className="editor-post-meta">
                          {String(ep.author_name)} · {cat?.label ?? String(ep.category)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>

      <NewsletterBar />
    </>
  );
}
