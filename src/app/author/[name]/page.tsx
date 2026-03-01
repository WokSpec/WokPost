import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/lib/feed/types';

export const dynamic = 'force-dynamic';

interface EditorialPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  featured: number;
  views: number;
  reading_time: number;
  created_at: string;
  tags: string;
}

const AUTHOR_DATA: Record<string, {
  name: string;
  handle: string;
  bio: string;
  longBio: string;
  topics: string[];
  color: string;
}> = {
  eral: {
    name: 'Eral',
    handle: 'eral',
    bio: 'Independent writer covering technology, culture, and the forces shaping how we live and work.',
    longBio: `Eral writes at the intersection of technology, culture, and society. The pieces here don't belong to any single beat — they are attempts to follow an idea wherever it leads, whether that is into cognitive science, media economics, environmental infrastructure, or the philosophy of a long run.

The goal is always the same: to say something true about a complicated thing, in language that does not require specialist knowledge to read.

Eral has been writing for WokPost since the platform launched. Before that: years of reading, arguing, and trying to understand why the world works the way it does.`,
    topics: ['ai', 'tech', 'culture', 'health', 'business', 'climate', 'education'],
    color: '#6366f1',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const author = AUTHOR_DATA[name.toLowerCase()];
  if (!author) return { title: 'Author Not Found' };
  return {
    title: `${author.name} — WokPost`,
    description: author.bio,
    openGraph: {
      title: `${author.name} — WokPost Writer`,
      description: author.bio,
    },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const author = AUTHOR_DATA[name.toLowerCase()];
  if (!author) return notFound();

  let posts: EditorialPost[] = [];
  let totalViews = 0;
  let featuredCount = 0;

  try {
    const { getDB } = await import('@/lib/cloudflare');
    const db = await getDB();
    if (db) {
      const { results } = await db.prepare(
        `SELECT id, slug, title, excerpt, category, featured, views, reading_time, created_at, tags
         FROM editorial_posts
         WHERE published = 1 AND author_name = ?
         ORDER BY featured DESC, created_at DESC`
      ).bind(author.name).all() as { results: EditorialPost[] };
      posts = results ?? [];
      totalViews = posts.reduce((s, p) => s + (p.views ?? 0), 0);
      featuredCount = posts.filter(p => p.featured === 1).length;
    }
  } catch { /* build-time */ }

  const postsByCategory = author.topics.map(catId => ({
    catId,
    cat: CATEGORIES[catId as keyof typeof CATEGORIES],
    posts: posts.filter(p => p.category === catId),
  })).filter(g => g.posts.length > 0);

  return (
    <div className="site-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${author.color}55, ${author.color}22)`,
            border: `2px solid ${author.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800,
            color: author.color,
          }}
        >
          {author.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8,
          }}>
            {author.name}
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16, maxWidth: 500 }}>
            {author.bio}
          </p>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              ['Posts', posts.length],
              ['Featured', featuredCount],
              ['Total reads', totalViews.toLocaleString()],
              ['Topics', author.topics.length],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: author.color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Long bio */}
      <div style={{
        background: 'var(--surface-raised)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: 40,
        borderLeft: `3px solid ${author.color}`,
      }}>
        {author.longBio.split('\n\n').map((para, i) => (
          <p key={i} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: i < author.longBio.split('\n\n').length - 1 ? 12 : 0 }}>
            {para}
          </p>
        ))}
      </div>

      {/* Posts by category */}
      {postsByCategory.map(({ catId, cat, posts: catPosts }) => (
        <div key={catId} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: cat?.color ?? author.color,
            }}>
              {cat?.label ?? catId}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              {catPosts.length} {catPosts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {catPosts.map(post => {
              let tags: string[] = [];
              try { tags = JSON.parse(post.tags ?? '[]'); } catch { /* */ }
              return (
                <Link
                  key={post.slug}
                  href={`/editorial/${post.slug}`}
                  style={{
                    display: 'block', textDecoration: 'none',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  className="author-post-card"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {post.featured === 1 && (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: '#f59e0b', background: '#f59e0b15',
                          border: '1px solid #f59e0b33', borderRadius: 4,
                          padding: '1px 6px', marginBottom: 6, display: 'inline-block',
                        }}>
                          Featured
                        </span>
                      )}
                      <div style={{
                        fontFamily: 'var(--font-heading)', fontWeight: 700,
                        fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.4, marginBottom: 4,
                      }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                        {post.excerpt.slice(0, 140)}{post.excerpt.length > 140 ? '…' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                          · {post.reading_time ?? 5} min read
                        </span>
                        {tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            fontSize: '0.6rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)',
                            background: 'var(--surface-raised)', border: '1px solid var(--border)',
                            borderRadius: 4, padding: '1px 6px',
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-faint)', flexShrink: 0, marginTop: 2 }}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          No published posts yet.
        </div>
      )}

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <Link href="/editorial" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textDecoration: 'none' }}>
          ← All Editorial Posts
        </Link>
      </div>
    </div>
  );
}
