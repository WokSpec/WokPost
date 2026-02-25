import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CategoryStrip, FeedCard, NewsletterBar } from '@/components/FeedComponents';
import { AdSlot } from '@/components/AdSlot';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WokPost — AI in Everything',
  description: 'News, insights, and stories across 20 categories through the AI lens.',
};

export const revalidate = 1800;

export default async function HomePage() {
  let items: Awaited<ReturnType<typeof fetchAllSources>> = [];
  try { items = await fetchAllSources(FEED_SOURCES.slice(0, 30)); } catch { /* build-time fallback */ }

  const featured = items[0];
  const topAI = items.filter(i => i.aiTagged).slice(0, 6);
  const rest = items.slice(1, 61);

  return (
    <>
      {/* Ticker */}
      {topAI.length > 0 && (
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...topAI, ...topAI].map((item, i) => (
              <a key={`${item.id}-${i}`} href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--c-ai)', fontWeight: 700 }}>AI</span>{item.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Category strip */}
      <div className="site-container"><CategoryStrip /></div>

      {/* Featured hero */}
      {featured && (
        <a href={featured.url} target="_blank" rel="noopener noreferrer" className="featured-hero">
          <div className="site-container">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: CATEGORIES[featured.category]?.color, marginBottom: 10 }}>
              {CATEGORIES[featured.category]?.label}{featured.aiTagged && <span style={{ marginLeft: 10, color: 'var(--c-ai)' }}>AI Impact {featured.aiScore}/10</span>}
            </div>
            <div className="hero-title">{featured.title}</div>
            {featured.summary && <div style={{ marginTop: 12, fontSize: 15, color: 'var(--text-2)', maxWidth: 640, lineHeight: 1.6 }}>{featured.summary.slice(0, 220)}</div>}
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-3)' }}>{featured.sourceName} · Read story →</div>
          </div>
        </a>
      )}

      {/* Main feed + sidebar */}
      <div className="site-container" style={{ paddingTop: 20, paddingBottom: 20 }}>
        <div className="layout-cols">
          <div>
            <div className="section-header">
              <span className="section-title">Latest Stories</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{items.length} stories</span>
            </div>
            <div className="feed-grid">
              {rest.map((item, i) => <FeedCard key={item.id} item={item} index={i} />)}
            </div>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', padding: 20 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Categories</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {Object.entries(CATEGORIES).map(([id, cat]) => (
                  <a key={id} href={`/${id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{items.filter(i => i.category === id).length}</span>
                  </a>
                ))}
              </div>
            </div>

            {topAI.length > 0 && (
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', padding: 20 }}>
                <div className="section-title" style={{ marginBottom: 12 }}>Top AI Impact</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {topAI.map(item => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--text)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span className="ai-badge" style={{ flexShrink: 0, marginTop: 2 }}>{item.aiScore}</span>
                      <span style={{ lineHeight: 1.4 }}>{item.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <AdSlot variant="rectangle" />
          </aside>
        </div>
      </div>

      <NewsletterBar />
    </>
  );
}
