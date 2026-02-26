import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CommentsSection } from '@/components/CommentsSection';
import { NewsletterBar } from '@/components/FeedComponents';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 1800;

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);

  // Rebuild the item from live feed
  const items = await fetchAllSources(FEED_SOURCES.slice(0, 40)).catch(() => []);
  const item = items.find(i => i.id === decoded || Buffer.from(i.id).toString('base64url').startsWith(decoded.slice(0, 8)));

  if (!item) notFound();

  const cat = CATEGORIES[item.category];

  return (
    <>
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '36px 20px' }}>
        <div className="site-container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <a href={`/${item.category}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat?.color }}>
              {cat?.label}
            </a>
            {item.aiTagged && (
              <span className="ai-badge">AI Impact {item.aiScore}/10</span>
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {item.title}
          </h1>
          {item.summary && (
            <p style={{ marginTop: 14, fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 660 }}>
              {item.summary}
            </p>
          )}
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-3)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span>{item.sourceName}</span>
            <span>·</span>
            <span>{new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {item.score !== undefined && <><span>·</span><span>↑ {item.score}</span></>}
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 20, background: 'var(--accent)', color: '#000', padding: '10px 22px', fontSize: 13, fontWeight: 700, borderRadius: 4 }}
          >
            Read Full Story →
          </a>
        </div>
      </div>

      <div className="site-container" style={{ maxWidth: 760, paddingTop: 20, paddingBottom: 60 }}>
        <CommentsSection postId={item.id} />
      </div>

      <NewsletterBar />
    </>
  );
}
