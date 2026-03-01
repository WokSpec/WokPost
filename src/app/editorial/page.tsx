import Link from 'next/link';
import { CATEGORIES } from '@/lib/feed/types';
import type { Metadata } from 'next';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editorial',
  description: 'Long-form articles, analysis, and perspectives from WokPost editors — covering AI, crypto, science, markets, and technology.',
};

type EditorialPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  tags: string | null;
  cover_image: string | null;
  author_name: string;
  author_avatar: string | null;
  featured: number;
  published: number;
  views: number;
  reading_time: number | null;
  created_at: string;
};

function readMins(post: EditorialPost) {
  if (post.reading_time) return post.reading_time;
  return Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function EditorialIndex() {
  let posts: EditorialPost[] = [];
  let categories: string[] = [];
  let totalViews = 0;

  try {
    const { getDB } = await import('@/lib/cloudflare');
    const db = await getDB();
    if (db) {
      const { results } = await db.prepare(
        'SELECT * FROM editorial_posts WHERE published = 1 ORDER BY featured DESC, created_at DESC'
      ).all() as { results: EditorialPost[] };
      posts = results;
      categories = [...new Set(posts.map(p => p.category))];
      totalViews = posts.reduce((sum, p) => sum + (p.views ?? 0), 0);
    }
  } catch { /* no D1 at build */ }

  const featured = posts.filter(p => p.featured === 1);
  const rest = posts.filter(p => p.featured !== 1);

  return (
    <div className="site-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', marginBottom: 10 }}>
          WokPost
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1.05, marginBottom: '0.75rem' }}>
          Editorial
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.7 }}>
          Long-form analysis, perspectives, and deep dives from our editors — on AI, crypto, science, markets, and the technologies shaping how we work.
        </p>

        {/* Stats row */}
        {posts.length > 0 && (
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Posts', value: posts.length.toString() },
              { label: 'Categories', value: categories.length.toString() },
              { label: 'Total reads', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews.toString() },
              { label: 'Featured', value: featured.length.toString() },
            ].map(s => (
              <div key={s.label} style={{ fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Category filter pills */}
        {categories.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {categories.map(cat => {
              const info = CATEGORIES[cat as keyof typeof CATEGORIES];
              return (
                <a key={cat} href={`#cat-${cat}`} style={{ padding: '5px 14px', borderRadius: 20, background: 'var(--surface-raised)', border: `1px solid ${info?.color ?? 'var(--border)'}33`, fontSize: '0.72rem', fontWeight: 600, color: info?.color ?? 'var(--text-muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none', cursor: 'pointer' }}>
                  {info?.label ?? cat}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-faint)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✍️</div>
          <p>No editorial posts yet. Check back soon.</p>
        </div>
      )}

      {/* Featured posts grid */}
      {featured.length > 0 && (
        <section style={{ marginBottom: '3.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <span className="section-title">Featured</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {featured.map(post => (
              <EditorialCard key={post.id} post={post} large />
            ))}
          </div>
        </section>
      )}

      {/* Rest by category */}
      {categories.map(cat => {
        const catPosts = rest.filter(p => p.category === cat);
        if (catPosts.length === 0) return null;
        const info = CATEGORIES[cat as keyof typeof CATEGORIES];
        return (
          <section key={cat} id={`cat-${cat}`} style={{ marginBottom: '3rem' }}>
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <span className="section-title" style={{ color: info?.color }}>{info?.label ?? cat}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{catPosts.length} post{catPosts.length > 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {catPosts.map(post => (
                <EditorialCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        );
      })}

      {/* "From All Categories" — all remaining uncategorized */}
      {rest.filter(p => !categories.includes(p.category)).length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <span className="section-title">More</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {rest.filter(p => !categories.includes(p.category)).map(post => (
              <EditorialCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* About the Editor */}
      {posts.length > 0 && (
        <section style={{ marginTop: '4rem', padding: '2.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 18, display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
            E
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
              About the editor
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Eral
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.25rem', maxWidth: 560 }}>
              Eral writes about technology, science, business, and culture from the premise that most things are more complicated than we pretend. A recovering academic with opinions about AI interpretability, urban policy, and the video game as art form. Based somewhere with good Wi-Fi.
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{posts.length}</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', marginLeft: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>essays</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{categories.length}</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', marginLeft: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>topics</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', marginLeft: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>reads</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function EditorialCard({ post, large = false }: { post: EditorialPost; large?: boolean }) {
  const cat = CATEGORIES[post.category as keyof typeof CATEGORIES];
  const catColor = cat?.color ?? '#818cf8';
  const tags: string[] = post.tags ? JSON.parse(post.tags) : [];

  return (
    <Link
      href={`/editorial/${post.slug}`}
      className="editorial-index-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        cursor: 'pointer',
      }}
    >
      {/* Cover image */}
      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt=""
          style={{ width: '100%', height: large ? 200 : 160, objectFit: 'cover', display: 'block' }}
        />
      )}
      {!post.cover_image && (
        <div style={{ height: large ? 120 : 80, background: `linear-gradient(135deg, ${catColor}22 0%, ${catColor}08 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: large ? '2.5rem' : '1.75rem' }}>
            {cat?.emoji ?? '✍️'}
          </span>
        </div>
      )}

      <div style={{ padding: large ? '1.5rem' : '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Category + featured badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: catColor, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            {cat?.label ?? post.category}
          </span>
          {post.featured === 1 && (
            <span className="tier1-badge" style={{ fontSize: '0.55rem', padding: '2px 7px' }}>Featured</span>
          )}
        </div>

        {/* Title */}
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: large ? '1.2rem' : '1rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.3, color: 'var(--text)', margin: 0 }}>
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, flex: 1 }}>
            {post.excerpt.slice(0, large ? 160 : 120)}{post.excerpt.length > (large ? 160 : 120) ? '…' : ''}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map(t => (
              <span key={t} style={{ fontSize: '0.6rem', padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Footer meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          {post.author_avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author_avatar} alt="" width={20} height={20} style={{ borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: catColor + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: catColor, flexShrink: 0 }}>
              {post.author_name.charAt(0)}
            </div>
          )}
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>{post.author_name}</span>
          <span style={{ color: 'var(--border-strong)', fontSize: '0.65rem' }}>·</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{timeAgo(post.created_at)}</span>
          <span style={{ color: 'var(--border-strong)', fontSize: '0.65rem' }}>·</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{readMins(post)}m read</span>
          {post.views > 0 && (
            <>
              <span style={{ color: 'var(--border-strong)', fontSize: '0.65rem' }}>·</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{post.views} views</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
