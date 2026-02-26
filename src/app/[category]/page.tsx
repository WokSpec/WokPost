import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CategoryStrip, NewsletterBar } from '@/components/FeedComponents';
import { InteractiveFeed } from '@/components/InteractiveFeed';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Category } from '@/lib/feed/types';

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES[category as Category];
  if (!cat) return { title: 'Not Found' };
  return {
    title: `${cat.label} — WokPost`,
    description: cat.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(c => ({ category: c }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  if (!CATEGORIES[category as Category]) notFound();

  const cat = CATEGORIES[category as Category];
  const sources = FEED_SOURCES.filter(s => s.defaultCategory === category);

  const items = await fetchAllSources(sources).catch(() => []);

  return (
    <>
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '32px 20px' }}>
        <div className="site-container">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat.color, marginBottom: 6 }}>
            {cat.label}
          </div>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            AI in {cat.label}
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-2)', maxWidth: 600 }}>{cat.description}</p>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-3)' }}>
            {sources.length} source{sources.length !== 1 ? 's' : ''} · {items.length} stories
          </div>
        </div>
      </div>

      <div className="site-container" style={{ paddingTop: 16 }}>
        <CategoryStrip active={category} />
      </div>

      <div className="site-container" style={{ paddingTop: 8, paddingBottom: 40 }}>
        {items.length === 0 ? (
          <div style={{ padding: '40px 0', color: 'var(--text-3)', fontSize: 14 }}>No stories found. Check back soon.</div>
        ) : (
          <InteractiveFeed initialItems={items.slice(0, 60)} category={category} initialTotal={items.length} />
        )}
      </div>

      <NewsletterBar />
    </>
  );
}
