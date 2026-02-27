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
      {/* Category header */}
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '2.5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient orb */}
        <div
          className="orb orb-blue"
          style={{
            width: 400,
            height: 400,
            top: -200,
            right: -100,
            opacity: 0.25,
          }}
          aria-hidden="true"
        />
        <div className="site-container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: cat.color,
                boxShadow: `0 0 12px ${cat.color}66`,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat.color, fontFamily: 'var(--font-mono)' }}>
              {cat.label}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.375rem, 3.5vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 10 }}>
            {cat.label}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.7, marginBottom: 12 }}>
            {cat.description}
          </p>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            {sources.length} source{sources.length !== 1 ? 's' : ''} &middot; {items.length} stories
          </div>
        </div>
      </div>

      {/* Category strip */}
      <div className="site-container">
        <CategoryStrip active={category} />
      </div>

      {/* Feed */}
      <div className="site-container" style={{ paddingTop: 8, paddingBottom: 48 }}>
        {items.length === 0 ? (
          <div className="feed-empty">
            No stories found for this topic. Check back soon.
          </div>
        ) : (
          <InteractiveFeed initialItems={items.slice(0, 60)} category={category} initialTotal={items.length} />
        )}
      </div>

      <NewsletterBar />
    </>
  );
}
