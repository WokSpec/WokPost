import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CommentsSection } from '@/components/CommentsSection';
import { NewsletterBar } from '@/components/FeedComponents';
import { ShareButtons } from '@/components/ShareButtons';
import { BookmarkButton } from '@/components/BookmarkButton';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 1800;

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const items = await fetchAllSources(FEED_SOURCES.slice(0, 40)).catch(() => []);
  const item = items.find(i => i.id === decoded);
  if (!item) notFound();
  const cat = CATEGORIES[item.category];
  const readMin = item.summary ? Math.max(1, Math.round(item.summary.split(' ').length / 60)) : null;

  return (
    <>
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '36px 20px' }}>
        <div className="site-container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <a href={`/${item.category}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: cat?.color }}>{cat?.label}</a>
            {item.aiTagged && <span className="ai-badge">AI Impact {item.aiScore}/10</span>}
            {readMin && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{readMin} min read</span>}
          </div>
          <h1 style={{ fontSize: 'clamp(20px,4vw,30px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.2 }}>{item.title}</h1>
          {item.summary && <p style={{ marginTop: 14, fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 660 }}>{item.summary}</p>}
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-3)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{item.sourceName}</span><span>·</span>
            <span>{new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {item.score !== undefined && <><span>·</span><span>↑ {item.score}</span></>}
          </div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              style={{ background: 'var(--accent)', color: '#000', padding: '10px 22px', fontSize: 13, fontWeight: 700, borderRadius: 4 }}>
              Read Full Story →
            </a>
            <BookmarkButton id={item.id} title={item.title} url={item.url} category={item.category} />
            <ShareButtons title={item.title} url={`https://wokpost.wokspec.org/post/${encodeURIComponent(item.id)}`} />
          </div>
        </div>
      </div>
      <div className="site-container" style={{ maxWidth: 760, paddingTop: 20, paddingBottom: 60 }}>
        <CommentsSection postId={item.id} />
      </div>
      <NewsletterBar />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const items = await fetchAllSources(FEED_SOURCES.slice(0, 40)).catch(() => []);
  const item = items.find(i => i.id === decoded);
  if (!item) return { title: 'Not Found' };
  return { title: item.title, description: item.summary?.slice(0, 160) };
}
