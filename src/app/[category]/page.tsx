import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CategoryStrip, NewsletterBar } from '@/components/FeedComponents';
import { InteractiveFeed } from '@/components/InteractiveFeed';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Category } from '@/lib/feed/types';
import { CATEGORY_ICONS } from '@/components/Icons';

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES[category as Category];
  if (!cat) return { title: 'Not Found' };
  return {
    title: `${cat.label}`,
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
  let items = await fetchAllSources(sources).catch(() => []);

  // Inject editorial posts for this category from D1
  try {
    const { getDB } = await import('@/lib/cloudflare');
    const db = await getDB();
    if (db) {
      const { results: editPosts } = await db.prepare(
        'SELECT * FROM editorial_posts WHERE published = 1 AND category = ?1 ORDER BY featured DESC, created_at DESC LIMIT 10'
      ).bind(category).all() as { results: Record<string, unknown>[] };
      const editorialItems = editPosts.map(ep => ({
        id: String(ep.id),
        title: String(ep.title),
        url: `/editorial/${ep.slug}`,
        sourceId: 'wokpost-editorial',
        sourceName: 'WokPost',
        sourceType: 'editorial' as const,
        sourceTier: 1 as const,
        contentType: 'editorial' as const,
        category: String(ep.category ?? category),
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
      items = [...editorialItems, ...items];
    }
  } catch { /* no D1 at build time */ }

  // Top sources by item count
  const sourceCounts: Record<string, number> = {};
  for (const item of items) {
    if (item.sourceName) sourceCounts[item.sourceName] = (sourceCounts[item.sourceName] ?? 0) + 1;
  }
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const CatIcon = CATEGORY_ICONS[category];

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
        <div className="orb" style={{ width: 400, height: 400, top: -200, right: -100, background: cat.color, opacity: 0.15 }} aria-hidden="true" />
        <div className="site-container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            {/* Category icon badge */}
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${cat.color}18`, border: `1px solid ${cat.color}40`, color: cat.color,
            }}>
              {CatIcon ? <CatIcon size={26} /> : null}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat.color, fontFamily: 'var(--font-mono)' }}>
                  {cat.label}
                </span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.375rem, 3.5vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 8 }}>
                {cat.label}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.7, marginBottom: 14 }}>
                {cat.description}
              </p>
              {/* Stats row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: cat.color, fontWeight: 700 }}>{items.length}</span> stories
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: cat.color, fontWeight: 700 }}>{sources.length}</span> source{sources.length !== 1 ? 's' : ''}
                </div>
              </div>
              {/* Top sources */}
              {topSources.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {topSources.map(([name, count]) => (
                    <span key={name} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.62rem', fontFamily: 'var(--font-mono)', fontWeight: 600,
                      background: `${cat.color}10`, border: `1px solid ${cat.color}25`,
                      color: cat.color, borderRadius: 6, padding: '2px 8px',
                    }}>
                      {name} <span style={{ opacity: 0.7 }}>·{count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category strip — full-width sticky bar, no container wrapper */}
      <CategoryStrip active={category} />

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
