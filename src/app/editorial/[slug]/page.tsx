import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/lib/feed/types';
import { CommentsSection } from '@/components/CommentsSection';
import { ReadingProgress } from '@/components/ReadingProgress';
import { VoteButton } from '@/components/VoteButton';
import { ShareButtons } from '@/components/ShareButtons';
import { TableOfContents } from '@/components/TableOfContents';
import { StarRating } from '@/components/StarRating';
import Link from 'next/link';
import type { Metadata } from 'next';
import { IcoPen, CATEGORY_ICONS } from '@/components/Icons';

export const dynamic = 'force-dynamic';

interface Signal { label: string; type: 'trending' | 'spike' | 'pattern' | 'editorial' | 'source'; }
interface SourceCited { name: string; url?: string; note?: string; }

interface PostRow {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover_image: string | null; category: string; tags: string; author_name: string;
  author_avatar: string | null; published: number; featured: number; views: number;
  reading_time: number | null; created_at: string; updated_at: string;
  signals: string; sources_cited: string; trigger_reason: string; methodology: string;
}

async function getPost(slug: string): Promise<PostRow | null> {
  try {
    const db = await (async () => { try { const { getDB } = await import('@/lib/cloudflare'); return await getDB(); } catch { return undefined; } })();
    if (!db) return null;
    const row = await db.prepare(
      'SELECT * FROM editorial_posts WHERE (slug = ?1 OR id = ?1) AND published = 1'
    ).bind(slug).first() as PostRow | null;
    if (row) {
      db.prepare('UPDATE editorial_posts SET views = views + 1 WHERE id = ?1').bind(row.id).run().catch(() => {});
    }
    return row;
  } catch { return null; }
}

async function getRatings(postId: string): Promise<{ avg: number; count: number }> {
  try {
    const db = await (async () => { try { const { getDB } = await import('@/lib/cloudflare'); return await getDB(); } catch { return undefined; } })();
    if (!db) return { avg: 0, count: 0 };
    const row = await db.prepare(
      'SELECT AVG(CAST(rating AS REAL)) as avg, COUNT(*) as count FROM post_ratings WHERE post_id = ?1'
    ).bind(postId).first() as { avg: number | null; count: number } | null;
    return { avg: Math.round((row?.avg ?? 0) * 10) / 10, count: row?.count ?? 0 };
  } catch { return { avg: 0, count: 0 }; }
}

async function getRelatedPosts(category: string, excludeId: string): Promise<PostRow[]> {
  try {
    const db = await (async () => { try { const { getDB } = await import('@/lib/cloudflare'); return await getDB(); } catch { return undefined; } })();
    if (!db) return [];
    const { results } = await db.prepare(
      'SELECT * FROM editorial_posts WHERE published = 1 AND category = ?1 AND id != ?2 ORDER BY featured DESC, created_at DESC LIMIT 3'
    ).bind(category, excludeId).all() as { results: PostRow[] };
    return results;
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not Found' };
  const ogUrl = `https://wokpost.wokspec.org/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}&source=${encodeURIComponent(post.author_name)}`;
  return {
    title: `${post.title}`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
  };
}

export default async function EditorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [relatedPosts, ratings] = await Promise.all([
    getRelatedPosts(post.category, post.id),
    getRatings(post.id),
  ]);

  const cat = CATEGORIES[post.category as keyof typeof CATEGORIES];
  const catColor = cat?.color ?? 'var(--accent)';
  const tags: string[] = (() => { try { return JSON.parse(post.tags); } catch { return []; } })();
  const wordCount = post.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readMins = post.reading_time ?? Math.max(1, Math.ceil(wordCount / 200));
  const publishDate = new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <ReadingProgress />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          author: { '@type': 'Person', name: post.author_name, url: `https://wokpost.wokspec.org/author/${post.author_name.toLowerCase()}` },
          publisher: { '@type': 'Organization', name: 'WokPost', url: 'https://wokpost.wokspec.org' },
          datePublished: post.created_at,
          image: post.cover_image ?? `https://wokpost.wokspec.org/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`,
          url: `https://wokpost.wokspec.org/editorial/${post.slug}`,
          keywords: tags.join(', '),
          ...(ratings.count > 0 ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: ratings.avg,
              ratingCount: ratings.count,
              bestRating: 5,
              worstRating: 1,
            }
          } : {}),
        }) }}
      />

      {/* Hero */}
      {post.cover_image && (
        <div style={{ width: '100%', maxHeight: 480, overflow: 'hidden', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_image} alt="" style={{ width: '100%', height: 480, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(13,13,13,0.85))' }} />
        </div>
      )}

      <div className="site-container" style={{ maxWidth: 1100, paddingTop: post.cover_image ? 0 : '3rem', paddingBottom: '5rem' }}>

        {/* Eyebrow nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem', paddingTop: post.cover_image ? '1.5rem' : 0, flexWrap: 'wrap' }}>
          <Link href="/" style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>Home</Link>
          <span style={{ color: 'var(--border-strong)', fontSize: '0.7rem' }}>›</span>
          <Link href={`/${post.category}`} style={{ fontSize: '0.72rem', color: catColor, textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            {cat?.label ?? post.category}
          </Link>
          <span style={{ color: 'var(--border-strong)', fontSize: '0.7rem' }}>›</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>Editorial</span>
        </div>

        {/* Content + ToC sidebar layout */}
        <div className="editorial-layout" style={{ marginTop: '0' }}>
          <div>
            {/* Title block */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="card-tag" style={{ color: catColor, fontSize: '0.68rem' }}>{cat?.label ?? post.category}</span>
                <span className="source-type-badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>Editorial</span>
                {post.featured === 1 && <span className="tier1-badge">Featured</span>}
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem' }}>
                {post.title}
              </h1>
              {post.excerpt && (
                <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  {post.excerpt}
                </p>
              )}
              {/* Author + meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                {post.author_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author_avatar} alt="" width={38} height={38} style={{ borderRadius: '50%', border: '2px solid var(--border)' }} />
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: catColor + '33', border: `2px solid ${catColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.875rem', color: catColor, flexShrink: 0 }}>
                    {post.author_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{post.author_name}</span>
                    <span className="eral-ai-badge" style={{ fontSize: '0.58rem', padding: '2px 7px' }}>
                      <span className="eral-pulse" style={{ width: 5, height: 5 }} />
                      AI Editorial
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {publishDate} · {readMins} min read · {post.views} views
                  </div>
                </div>
              </div>

              {/* Eral — Why this was written */}
              {post.trigger_reason && (
                <div className="eral-why-block" style={{ marginTop: '1.5rem' }}>
                  <div className="eral-why-label">Why Eral wrote this</div>
                  <p className="eral-why-text">{post.trigger_reason}</p>
                </div>
              )}

              {/* Signals detected */}
              {(() => {
                const sigs: Signal[] = (() => { try { return JSON.parse(post.signals); } catch { return []; } })();
                if (!sigs.length) return null;
                return (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Signals detected</div>
                    <div className="eral-signal-bar">
                      {sigs.map((s, i) => (
                        <span key={i} className={`eral-signal-chip sig-${s.type}`}>{s.label}</span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div
              className="editorial-content prose-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Sources analyzed */}
            {(() => {
              const cited: SourceCited[] = (() => { try { return JSON.parse(post.sources_cited); } catch { return []; } })();
              if (!cited.length) return null;
              return (
                <div className="eral-sources-block" style={{ marginTop: '2rem' }}>
                  <div className="eral-sources-title">Sources analyzed by Eral ({cited.length})</div>
                  <div className="eral-sources-list">
                    {cited.map((src, i) => (
                      <div key={i} className="eral-source-row">
                        <span className="eral-source-dot" />
                        {src.url ? (
                          <a href={src.url} target="_blank" rel="noopener noreferrer" className="eral-source-link">{src.name}</a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>{src.name}</span>
                        )}
                        {src.note && <span className="eral-source-meta">{src.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Methodology */}
            {post.methodology && (
              <div className="eral-methodology-block" style={{ marginTop: '1.5rem' }}>
                <span className="eral-methodology-label">Eral&apos;s methodology</span>
                {post.methodology}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                {tags.map(t => (
                  <Link
                    key={t}
                    href={`/search?q=${encodeURIComponent(t)}`}
                    style={{ padding: '4px 12px', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
                    className="tag-link"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Star Rating */}
            <div style={{ marginTop: '2rem' }}>
              <StarRating postId={post.id} />
            </div>

            {/* Vote + share row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <VoteButton postId={post.id} />
              <ShareButtons title={post.title} />
            </div>

            {/* About Eral */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                {post.author_name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                  Analysis by
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.025em' }}>
                    {post.author_name}
                  </span>
                  <span className="eral-ai-badge">
                    <span className="eral-pulse" />
                    AI Editorial Intelligence
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 10px' }}>
                  Eral is an AI editorial system built by WokPost. It continuously monitors hundreds of sources across technology, science, culture, and business — detecting emerging patterns, surfacing overlooked angles, and writing analysis grounded in what the data actually shows. Eral does not speculate beyond its sources and cites everything it draws from.
                </p>
                <Link href={`/author/${post.author_name.toLowerCase()}`} style={{ fontSize: '0.72rem', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
                  View all Eral analyses →
                </Link>
              </div>
            </div>

            {/* Comments */}
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <CommentsSection postId={post.id} />
            </div>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <div className="section-header" style={{ marginBottom: '1.25rem' }}>
                  <span className="section-title">More in {cat?.label ?? post.category}</span>
                  <Link href="/editorial" style={{ fontSize: '0.65rem', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>View all →</Link>
                </div>
                <div className="related-posts-grid">
                  {relatedPosts.map(rp => {
                    const rpCat = CATEGORIES[rp.category as keyof typeof CATEGORIES];
                    const rpColor = rpCat?.color ?? '#818cf8';
                    const rpMins = Math.max(1, Math.ceil(rp.content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200));
                    return (
                      <Link key={rp.id} href={`/editorial/${rp.slug}`} className="related-post-card">
                        {rp.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={rp.cover_image} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{ height: 80, background: `linear-gradient(135deg, ${rpColor}22 0%, ${rpColor}08 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rpColor }}>
                            {(() => { const Icon = CATEGORY_ICONS[rp.category]; return Icon ? <Icon size={22} /> : <IcoPen size={20} />; })()}
                          </div>
                        )}
                        <div className="related-post-card-body">
                          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: rpColor, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                            {rpCat?.label ?? rp.category}
                          </span>
                          <div className="related-post-card-title">{rp.title}</div>
                          <div className="related-post-card-meta">{rpMins}m read · {rp.views} views</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <TableOfContents />
        </div>
      </div>
    </>
  );
}
