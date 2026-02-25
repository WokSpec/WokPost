import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CategoryStrip, FeedCard, NewsletterBar } from '@/components/FeedComponents';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Category } from '@/lib/feed/types';

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES[category as Category];
  if (!cat) return { title: 'Not Found' };
  return { title: `${cat.label} — WokPost`, description: cat.description };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(c => ({ category: c }));
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string>> }) {
  const { category } = await params;
  const sp = await searchParams;
  const sort = sp.sort ?? 'latest';
  const aiOnly = sp.filter === 'ai';

  if (!CATEGORIES[category as Category]) notFound();
  const cat = CATEGORIES[category as Category];
  const sources = FEED_SOURCES.filter(s => s.defaultCategory === category);

  let items = await fetchAllSources(sources).catch(() => []);
  if (sort === 'trending') items = [...items].sort((a, b) => ((b.score ?? 0) + (b.commentCount ?? 0)) - ((a.score ?? 0) + (a.commentCount ?? 0)));
  else if (sort === 'impact') items = [...items].sort((a, b) => b.aiScore - a.aiScore);
  if (aiOnly) items = items.filter(i => i.aiTagged);

  return (
    <>
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '32px 20px' }}>
        <div className="site-container">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: cat.color, marginBottom: 6 }}>{cat.label}</div>
          <h1 style={{ fontSize: 'clamp(20px,4vw,32px)', fontWeight: 800, letterSpacing: '-.02em' }}>AI in {cat.label}</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-2)', maxWidth: 600 }}>{cat.description}</p>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-3)' }}>{sources.length} source{sources.length !== 1 ? 's' : ''} · {items.length} stories</div>
        </div>
      </div>

      <div className="site-container" style={{ paddingTop: 16 }}><CategoryStrip active={category} /></div>

      <div className="site-container" style={{ paddingTop: 8, paddingBottom: 40 }}>
        <div className="filter-bar">
          <a href={`/${category}`} className={`filter-btn${sort === 'latest' && !aiOnly ? ' active' : ''}`}>Latest</a>
          <a href={`/${category}?sort=trending`} className={`filter-btn${sort === 'trending' ? ' active' : ''}`}>Trending</a>
          <a href={`/${category}?sort=impact`} className={`filter-btn${sort === 'impact' ? ' active' : ''}`}>AI Impact</a>
          <a href={`/${category}?filter=ai`} className={`filter-btn${aiOnly ? ' active' : ''}`}>AI Only</a>
        </div>
        {items.length === 0 ? (
          <div style={{ padding: '40px 0', color: 'var(--text-3)', fontSize: 14 }}>No stories yet. Check back soon.</div>
        ) : (
          <div className="feed-grid">
            {items.slice(0, 60).map((item, i) => <FeedCard key={item.id} item={item} index={i} />)}
          </div>
        )}
      </div>

      <NewsletterBar />
    </>
  );
}
