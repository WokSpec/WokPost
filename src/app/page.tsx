import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CategoryStrip, NewsletterBar } from '@/components/FeedComponents';
import { InteractiveFeed } from '@/components/InteractiveFeed';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WokPost — AI in Everything',
  description: 'News, insights, and stories across 20 categories through the AI lens.',
};

export const revalidate = 1800; // 30 min ISR

export default async function HomePage() {
  let items: Awaited<ReturnType<typeof fetchAllSources>> = [];
  try {
    items = await fetchAllSources(FEED_SOURCES.slice(0, 40)); // sample first 40 sources for SSR
  } catch { /* build-time: show empty */ }

  const featured = items[0];
  const topAI = items.filter(i => i.aiTagged).slice(0, 6);
  const feedItems = items.slice(1, 61);

  return (
    <>
      {/* Breaking news ticker */}
      {topAI.length > 0 && (
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...topAI, ...topAI].map((item, i) => (
              <a
                key={`${item.id}-${i}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ticker-item"
              >
                <span className="ticker-label">AI</span>
                {item.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Category strip */}
      <div className="site-container" style={{ padding: '0 20px' }}>
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
                  <span className="ai-badge" style={{ marginLeft: 10 }}>AI Impact {featured.aiScore}/10</span>
                )}
              </div>
              <div className="hero-title">{featured.title}</div>
              {featured.summary && (
                <div className="hero-summary">{featured.summary.slice(0, 200)}</div>
              )}
              <div className="hero-meta">
                <span>{featured.sourceName}</span>
                <span>·</span>
                <span>Read full story →</span>
              </div>
            </div>
          </div>
        </a>
      )}

      {/* Main layout */}
      <div className="site-container" style={{ paddingTop: 20, paddingBottom: 20 }}>
        <div className="layout-cols">
          {/* Feed */}
          <div>
            <div className="section-header">
              <span className="section-title">Latest Stories</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{items.length} sources</span>
            </div>
            <InteractiveFeed initialItems={feedItems} initialTotal={items.length} />
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Trending now */}
            <div className="sidebar-widget">
              <div className="section-title" style={{ marginBottom: 14 }}>🔥 Trending Now</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...items].sort((a, b) => ((b.score ?? 0) + (b.commentCount ?? 0)) - ((a.score ?? 0) + (a.commentCount ?? 0))).slice(0, 6).map((item, i) => {
                  const cat = CATEGORIES[item.category];
                  return (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="sidebar-story">
                      <span className="sidebar-rank">{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: cat?.color, marginBottom: 2 }}>{cat?.label}</div>
                        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{item.title}</div>
                        {item.score !== undefined && (
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>↑ {item.score} · {item.sourceName}</div>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Top AI stories */}
            <div className="sidebar-widget">
              <div className="section-title" style={{ marginBottom: 14 }}>🤖 Top AI Stories</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topAI.map(item => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="sidebar-story">
                    <span className="ai-badge" style={{ flexShrink: 0 }}>{item.aiScore}/10</span>
                    <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{item.title}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="sidebar-widget">
              <div className="section-title" style={{ marginBottom: 14 }}>Browse Categories</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Object.entries(CATEGORIES).map(([id, cat]) => (
                  <a
                    key={id}
                    href={`/${id}`}
                    className="sidebar-cat-link"
                  >
                    <span style={{ color: cat.color, fontWeight: 600, fontSize: 13 }}>{cat.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{items.filter(i => i.category === id).length}</span>
                  </a>
                ))}
              </div>
            </div>


          </aside>
        </div>
      </div>

      <NewsletterBar />
    </>
  );
}

