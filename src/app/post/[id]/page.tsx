import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import { CommentsSection } from '@/components/CommentsSection';
import { NewsletterBar } from '@/components/FeedComponents';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 1800;

function readingTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const items = await fetchAllSources(FEED_SOURCES.slice(0, 40)).catch(() => []);
  const item = items.find(i => i.id === decodeURIComponent(id));
  if (!item) return { title: 'Story Not Found' };
  return {
    title: item.title,
    description: item.summary?.slice(0, 160) || undefined,
    openGraph: item.thumbnail ? { images: [{ url: item.thumbnail }] } : undefined,
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);

  const items = await fetchAllSources(FEED_SOURCES.slice(0, 40)).catch(() => []);
  const item = items.find(i => i.id === decoded || Buffer.from(i.id).toString('base64url').startsWith(decoded.slice(0, 8)));

  if (!item) notFound();

  const cat = CATEGORIES[item.category];
  const rt = readingTime((item.summary ?? '') + item.title);
  const domain = (() => { try { return new URL(item.url).hostname.replace(/^www\./, ''); } catch { return item.sourceName; } })();

  return (
    <>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '44px 24px 40px' }}>
        <div className="site-container" style={{ maxWidth: 780 }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <a href={`/${item.category}`} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat?.color, fontFamily: 'var(--font-mono)' }}>
              {cat?.label}
            </a>
            {item.aiTagged && <span className="ai-badge">AI {item.aiScore}/10</span>}
            {item.sourceTier === 1 && <span className="tier1-badge">Tier 1 Source</span>}
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2, maxWidth: 700 }}>
            {item.title}
          </h1>

          {/* Summary */}
          {item.summary && (
            <p style={{ marginTop: 16, fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 660 }}>
              {item.summary}
            </p>
          )}

          {/* Meta bar */}
          <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.02em', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{item.sourceName}</span>
            <span>·</span>
            <span>{domain}</span>
            <span>·</span>
            <span>{new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>·</span>
            <span>{rt} min read</span>
            {item.score !== undefined && <><span>·</span><span>{item.score} pts</span></>}
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: 12 }}>
              Read original at {domain}
            </a>
            <a href={`/${item.category}`} className="btn btn-ghost" style={{ fontSize: 12 }}>
              More {cat?.label}
            </a>
          </div>

          {/* Source credibility note */}
          {item.sourceTier === 1 && (
            <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--yellow)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>T1 SOURCE</span>
              {' '}This article is from a Tier 1 publication — a peer-reviewed journal, major wire service, or established research institution.
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="site-container" style={{ maxWidth: 780, paddingTop: 24, paddingBottom: 60 }}>
        <CommentsSection postId={item.id} />
      </div>

      <NewsletterBar />
    </>
  );
}
