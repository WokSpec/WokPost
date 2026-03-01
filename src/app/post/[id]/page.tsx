import { FEED_SOURCES } from '@/lib/feed/sources';
import { fetchAllSources } from '@/lib/feed/aggregator';
import { CATEGORIES } from '@/lib/feed/types';
import type { FeedItem, ContentType, Category } from '@/lib/feed/types';
import { CommentsSection } from '@/components/CommentsSection';
import { NewsletterBar } from '@/components/FeedComponents';
import { ReadingProgress } from '@/components/ReadingProgress';
import { VoteButton } from '@/components/VoteButton';
import { HistoryTracker } from '@/components/HistoryTracker';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

// Dynamic — item lookup depends on D1/KV at request time
export const revalidate = 0;
export const dynamic = 'force-dynamic';

function readingTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

// ── D1 row → FeedItem ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToItem(row: Record<string, any>): FeedItem {
  return {
    id: row.id as string,
    title: row.title as string,
    url: row.url as string,
    sourceId: row.source_id as string,
    sourceName: row.source_name as string,
    sourceType: row.source_type as 'rss' | 'reddit' | 'hn' | 'github',
    sourceTier: (row.source_tier as 1 | 2 | 3) ?? 3,
    contentType: (row.content_type as ContentType) ?? 'story',
    category: row.category as Category,
    aiTagged: !!(row.ai_tagged as number),
    aiScore: (row.ai_score as number) ?? 1,
    publishedAt: row.published_at as string,
    summary: row.summary as string ?? '',
    tags: row.tags ? (JSON.parse(row.tags as string) as string[]) : [],
    thumbnail: row.thumbnail as string | undefined,
    score: row.score as number | undefined,
    repoLanguage: row.repo_language as string | undefined,
    repoTopics: row.repo_topics ? (JSON.parse(row.repo_topics as string) as string[]) : undefined,
  };
}

// ── Resolve an item by ID — D1 → KV → full fetch ────────────────────────────
async function resolveItem(decoded: string): Promise<FeedItem | undefined> {
  // 1. Try D1 (persistent, always works for items seen before)
  try {
    const db = await (async () => { try { const { getDB } = await import('@/lib/cloudflare'); return await getDB(); } catch { return undefined; } })();
    if (db) {
      const row = await db.prepare('SELECT * FROM feed_items WHERE id = ?').bind(decoded).first();
      if (row) return rowToItem(row as Record<string, unknown>);
    }
  } catch { /* D1 unavailable */ }

  // 2. Try KV full feed cache
  try {
    const kv = await (async () => { try { const { getKV } = await import('@/lib/cloudflare'); return await getKV(); } catch { return undefined; } })();
    if (kv) {
      const cached = await kv.get('feed:all', 'json') as FeedItem[] | null;
      if (cached) {
        const found = cached.find(i => i.id === decoded);
        if (found) return found;
      }
    }
  } catch { /* KV unavailable */ }

  // 3. Full source fetch as last resort
  const items = await fetchAllSources(FEED_SOURCES).catch(() => [] as FeedItem[]);
  return items.find(i => i.id === decoded);
}

// ── Related stories ─────────────────────────────────────────────────────────
async function getRelatedItems(category: Category, excludeId: string): Promise<FeedItem[]> {
  // 1. Try D1 for recent same-category items
  try {
    const db = await (async () => { try { const { getDB } = await import('@/lib/cloudflare'); return await getDB(); } catch { return undefined; } })();
    if (db) {
      const { results } = await db
        .prepare(`SELECT * FROM feed_items WHERE category = ? AND id != ? ORDER BY published_at DESC LIMIT 6`)
        .bind(category, excludeId)
        .all();
      if (results && results.length > 0) return results.map(r => rowToItem(r as Record<string, unknown>));
    }
  } catch { /* D1 unavailable */ }

  // 2. Fallback: KV full feed
  try {
    const kv = await (async () => { try { const { getKV } = await import('@/lib/cloudflare'); return await getKV(); } catch { return undefined; } })();
    if (kv) {
      const cached = await kv.get('feed:all', 'json') as FeedItem[] | null;
      if (cached) return cached.filter(i => i.category === category && i.id !== excludeId).slice(0, 6);
    }
  } catch { /* KV unavailable */ }

  return [];
}

// ── Favicon helper ──────────────────────────────────────────────────────────
function Favicon({ url, size = 14 }: { url: string; size?: number }) {
  let domain = '';
  try { domain = new URL(url).hostname; } catch { return null; }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" width={size} height={size} style={{ borderRadius: 2, flexShrink: 0 }} />;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await resolveItem(decodeURIComponent(id));
  if (!item) return { title: 'Story Not Found — WokPost' };
  const description = item.contentType === 'repo'
    ? (item.summary || `Open source repository: ${item.title}`)
    : item.summary?.slice(0, 160) || undefined;
  const ogUrl = `https://wokpost.wokspec.org/api/og?title=${encodeURIComponent(item.title)}&category=${encodeURIComponent(item.category)}&source=${encodeURIComponent(item.sourceName)}${item.score ? `&score=${item.score}` : ''}`;
  return {
    title: `${item.title} — WokPost`,
    description,
    openGraph: {
      title: item.title,
      description: description ?? undefined,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: item.title }],
    },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const item = await resolveItem(decoded);
  if (!item) notFound();

  const relatedItems = await getRelatedItems(item.category, decoded).catch(() => [] as FeedItem[]);

  const cat = CATEGORIES[item.category];
  const catColor = cat?.color ?? 'var(--accent)';
  const domain = (() => {
    try { return new URL(item.url).hostname.replace(/^www\./, ''); }
    catch { return item.sourceName; }
  })();
  const isRepo = item.contentType === 'repo';
  const isPaper = item.contentType === 'paper';
  const rt = isRepo ? null : readingTime((item.summary ?? '') + item.title);

  // ── CTA label + icon ────────────────────────────────────────────────────────
  const ctaLabel = isRepo ? 'View repository on GitHub' : isPaper ? 'Read full paper' : `Read original at ${domain}`;
  const ctaIcon = isRepo
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
    : isPaper
      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;

  return (
    <>
      <ReadingProgress />
      <HistoryTracker
        itemId={item.id}
        itemTitle={item.title}
        itemUrl={item.url}
        itemCategory={item.category}
        itemThumbnail={item.thumbnail}
      />

      {/* Page header band */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '3rem 1.5rem 2.5rem',
        background: 'var(--surface)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div
          className="orb orb-blue"
          style={{ width: 500, height: 500, top: -250, right: -150, opacity: 0.12, background: `radial-gradient(circle, ${catColor} 0%, transparent 70%)` }}
          aria-hidden="true"
        />
        <div className="site-container" style={{ maxWidth: 820, position: 'relative' }}>

          {/* Back / Eyebrow row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <Link
              href={`/${item.category}`}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: catColor, fontFamily: 'var(--font-mono)' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
              {cat?.label}
            </Link>
            {item.sourceTier === 1 && <span className="tier1-badge">T1</span>}
            {isRepo && <span className="source-type-badge source-type-repo">Open Source Repo</span>}
            {isPaper && <span className="source-type-badge source-type-paper">Research Paper</span>}
            {item.aiTagged && <span className="ai-badge">AI {item.aiScore}/10</span>}
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.35rem, 3vw, 2rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            maxWidth: 720,
            marginBottom: isRepo ? 12 : 20,
            wordBreak: 'break-word',
          }}>
            {item.title}
          </h1>

          {/* Repo stats row */}
          {isRepo && (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
              {item.score !== undefined && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {item.score.toLocaleString()} stars
                </span>
              )}
              {item.repoLanguage && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={catColor} stroke="none"><circle cx="12" cy="12" r="8"/></svg>
                  {item.repoLanguage}
                </span>
              )}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                Updated {new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}

          {/* Summary / abstract / description */}
          {item.summary && (
            <div style={{
              fontSize: '1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              maxWidth: 700,
              marginBottom: 24,
              padding: isRepo ? '14px 18px' : 0,
              background: isRepo ? 'var(--surface-raised)' : 'transparent',
              border: isRepo ? '1px solid var(--border)' : 'none',
              borderRadius: isRepo ? 'var(--radius)' : 0,
            }}>
              {isPaper && (
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                  Abstract
                </div>
              )}
              {isRepo && (
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                  About this repository
                </div>
              )}
              {item.summary}
            </div>
          )}

          {/* Repo topics */}
          {isRepo && item.repoTopics && item.repoTopics.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              {item.repoTopics.map(t => (
                <span key={t} style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-faint)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Meta bar */}
          <div style={{
            display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
            fontSize: '0.72rem', color: 'var(--text-faint)',
            letterSpacing: '0.02em', fontFamily: 'var(--font-mono)', marginBottom: 28,
          }}>
            <Favicon url={item.url} />
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{item.sourceName}</span>
            <span>·</span>
            <span>{domain}</span>
            {!isRepo && (
              <>
                <span>·</span>
                <span>{new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </>
            )}
            {rt && <><span>·</span><span>{rt} min read</span></>}
            {!isRepo && item.score !== undefined && (
              <><span>·</span><span>{item.score} pts</span></>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.82rem' }}
            >
              {ctaIcon}
              {ctaLabel}
            </a>
            <Link href={`/${item.category}`} className="btn btn-ghost" style={{ fontSize: '0.78rem' }}>
              More {cat?.label}
            </Link>
            <VoteButton postId={item.id} />
            {/* Social share */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(`https://wokpost.wokspec.org/post/${encodeURIComponent(item.id)}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost share-social-btn"
              title="Share on X (Twitter)"
              aria-label="Share on X"
              style={{ fontSize: '0.78rem', padding: '0.55rem 0.875rem', gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Tweet
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://wokpost.wokspec.org/post/${encodeURIComponent(item.id)}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost share-social-btn"
              title="Share on LinkedIn"
              aria-label="Share on LinkedIn"
              style={{ fontSize: '0.78rem', padding: '0.55rem 0.875rem', gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>

          {/* Tier 1 note */}
          {item.sourceTier === 1 && !isRepo && (
            <div style={{
              marginTop: 20, padding: '10px 14px',
              background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)',
              borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-faint)', lineHeight: 1.6,
            }}>
              <span style={{ color: '#facc15', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>T1 SOURCE</span>
              {' '}This article comes from a Tier 1 publication — a peer-reviewed journal, major wire service, or established research institution.
            </div>
          )}

          {/* WokPost summary note */}
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: `rgba(${catColor.startsWith('#') ? hexToRgb(catColor) : '56,189,248'}, 0.04)`,
            border: `1px solid rgba(${catColor.startsWith('#') ? hexToRgb(catColor) : '56,189,248'}, 0.12)`,
            borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-faint)', lineHeight: 1.6,
          }}>
            <span style={{ color: catColor, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>WOKPOST</span>
            {' '}
            {isRepo
              ? 'This is an open source repository surfaced by WokPost. The description above is from the original GitHub repo. Click "View repository" to explore the code, issues, and contributors.'
              : isPaper
                ? 'The abstract above is sourced directly from the original paper. WokPost does not modify research content. Click "Read full paper" to access the complete research.'
                : 'The excerpt above is sourced from the original publication. WokPost does not add editorial bias. Click the link below to read the full article at the source.'}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="site-container" style={{ maxWidth: 820, paddingTop: 36, paddingBottom: 48 }}>
        <CommentsSection postId={item.id} />
      </div>

      {/* Related stories */}
      {relatedItems.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '2.5rem 1.5rem' }}>
          <div className="site-container" style={{ maxWidth: 820 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                More in <span style={{ color: catColor }}>{cat?.label}</span>
              </div>
              <Link href={`/${item.category}`} style={{ fontSize: '0.72rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                View all →
              </Link>
            </div>
            <div className="related-grid">
              {relatedItems.slice(0, 4).map(rel => {
                const relCat = CATEGORIES[rel.category];
                const relDomain = (() => { try { return new URL(rel.url).hostname.replace(/^www\./, ''); } catch { return rel.sourceName; } })();
                return (
                  <Link key={rel.id} href={`/post/${encodeURIComponent(rel.id)}`} className="related-card">
                    {rel.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={rel.thumbnail} alt="" className="related-card-img" loading="lazy" />
                    )}
                    <div className="related-card-body">
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: relCat?.color ?? catColor, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>
                        {relCat?.label}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.4, color: 'var(--text)', marginBottom: 7 }}>
                        {rel.title}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 6 }}>
                        <span>{relDomain}</span>
                        {rel.aiTagged && <><span>·</span><span style={{ color: '#38bdf8' }}>AI {rel.aiScore}/10</span></>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <NewsletterBar />
    </>
  );
}

// ── Hex to RGB helper for opacity-aware backgrounds ─────────────────────────
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
