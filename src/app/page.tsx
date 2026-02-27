import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CategoryStrip, NewsletterBar } from '@/components/FeedComponents';
import { InteractiveFeed } from '@/components/InteractiveFeed';
import { StockTicker } from '@/components/StockTicker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WokPost — Open Source Unbiased News',
  description: 'Verified, unbiased news across 20 categories. No algorithms. No sponsored content.',
  openGraph: {
    type: 'website',
    siteName: 'WokPost',
    url: 'https://wokpost.wokspec.org',
    title: 'WokPost — Open Source Unbiased News',
    description: 'Verified, unbiased news across 20 categories.',
    images: [{ url: '/og.png' }],
  },
};

export const revalidate = 1800;

export default async function HomePage() {
  let items: Awaited<ReturnType<typeof fetchAllSources>> = [];
  try { items = await fetchAllSources(FEED_SOURCES.slice(0, 40)); } catch { /* build-time */ }

  const featured = items[0];
  const trending = [...items]
    .sort((a, b) => ((b.score ?? 0) + (b.commentCount ?? 0)) - ((a.score ?? 0) + (a.commentCount ?? 0)))
    .slice(0, 6);
  const topAI = items.filter(i => i.aiTagged).slice(0, 6);
  const feedItems = items.slice(1, 61);

  return (
    <>
      <StockTicker />

      <div className="site-container">
        <CategoryStrip />
      </div>

      {/* Featured hero */}
      {featured && (
        <a
          href={featured.url}
          target="_blank"
          rel="noopener noreferrer"
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
              </div>
              <div className="hero-title">{featured.title}</div>
              {featured.summary && (
                <div className="hero-summary">{featured.summary.slice(0, 200)}</div>
              )}
              <div className="hero-meta">
                <span>{featured.sourceName}</span>
                <span>·</span>
                <span className="hero-cta">Read story</span>
              </div>
            </div>
          </div>
        </a>
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
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="sidebar-story">
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
                          {item.score} pts · {item.sourceName}
                        </div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* AI Signal */}
            {topAI.length > 0 && (
              <div className="sidebar-widget">
                <div className="section-title" style={{ marginBottom: 12 }}>AI Signal</div>
                {topAI.map(item => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="sidebar-story">
                    <span className="ai-badge" style={{ flexShrink: 0 }}>{item.aiScore}/10</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.45, fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                      {item.title}
                    </span>
                  </a>
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
          </aside>
        </div>
      </div>

      <NewsletterBar />
    </>
  );
}
