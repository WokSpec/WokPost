import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/lib/feed/types';
import { CATEGORY_ICONS } from '@/components/Icons';

export const dynamic = 'force-dynamic';

interface EditorialPost {
  id: string; slug: string; title: string; excerpt: string;
  category: string; featured: number; views: number;
  reading_time: number; created_at: string; tags: string;
  signals: string; trigger_reason: string;
}

const AUTHOR_DATA: Record<string, {
  name: string; handle: string; color: string;
}> = {
  eral: { name: 'Eral', handle: 'eral', color: '#6366f1' },
};

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  if (!AUTHOR_DATA[name.toLowerCase()]) return { title: 'Author Not Found' };
  return {
    title: 'Eral — AI Editorial Intelligence · WokPost',
    description: 'Eral is WokPost\'s AI editorial system. It monitors hundreds of sources, detects emerging patterns, and writes analysis grounded in what the data shows.',
    openGraph: { title: 'Eral — AI Editorial Intelligence', description: 'Pattern-detected analysis from WokPost\'s AI editorial system.' },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const author = AUTHOR_DATA[name.toLowerCase()];
  if (!author) return notFound();

  let posts: EditorialPost[] = [];
  let totalViews = 0;
  let featuredCount = 0;
  let totalRatings = 0;
  let avgRating = 0;
  let liveSignals: { term: string; count: number; momentum: number; type: string; categories: string[] }[] = [];

  try {
    const { getDB } = await import('@/lib/cloudflare');
    const db = await getDB();
    if (db) {
      const recentCutoff = new Date(Date.now() - 12 * 3600_000).toISOString();
      const [postRows, ratingRow, recentFeed] = await Promise.all([
        db.prepare(
          `SELECT id, slug, title, excerpt, category, featured, views, reading_time,
                  created_at, tags, signals, trigger_reason
           FROM editorial_posts
           WHERE published = 1 AND author_name = ?
           ORDER BY featured DESC, created_at DESC`
        ).bind(author.name).all() as Promise<{ results: EditorialPost[] }>,
        db.prepare(
          `SELECT AVG(r.rating) as avg, COUNT(*) as cnt
           FROM post_ratings r
           JOIN editorial_posts ep ON r.post_id = ep.id
           WHERE ep.author_name = ?`
        ).bind(author.name).first<{ avg: number | null; cnt: number }>().catch(() => null),
        db.prepare(
          `SELECT title, category FROM feed_items WHERE fetched_at >= ?1 ORDER BY fetched_at DESC LIMIT 300`
        ).bind(recentCutoff).all() as Promise<{ results: { title: string; category: string }[] }>,
      ]);
      posts = postRows.results ?? [];
      totalViews = posts.reduce((s, p) => s + (p.views ?? 0), 0);
      featuredCount = posts.filter(p => p.featured === 1).length;
      totalRatings = ratingRow?.cnt ?? 0;
      avgRating = ratingRow?.avg ? Math.round(ratingRow.avg * 10) / 10 : 0;

      // Quick signal detection from recent feed
      const STOP = new Set(['the','and','for','that','this','with','from','have','been','will','are','was']);
      const freq: Map<string, { count: number; cats: Set<string> }> = new Map();
      for (const row of recentFeed.results) {
        const words = row.title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
          .filter(w => w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w));
        for (const w of words) {
          if (!freq.has(w)) freq.set(w, { count: 0, cats: new Set() });
          freq.get(w)!.count++;
          freq.get(w)!.cats.add(row.category);
        }
      }
      liveSignals = Array.from(freq.entries())
        .filter(([, v]) => v.count >= 2)
        .map(([term, v]) => ({
          term,
          count: v.count,
          momentum: v.count,
          type: v.count >= 5 ? 'spike' : v.count >= 3 ? 'trending' : 'pattern',
          categories: Array.from(v.cats),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    }
  } catch { /* build-time */ }

  const postsByCategory = Object.keys(CATEGORIES).map(catId => ({
    catId,
    cat: CATEGORIES[catId as keyof typeof CATEGORIES],
    posts: posts.filter(p => p.category === catId),
  })).filter(g => g.posts.length > 0);

  const totalWords = posts.length * 900; // estimated
  const sourcesScanned = posts.length * 14; // estimated based on avg sources_cited

  return (
    <div className="site-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: 920 }}>

      {/* AI Identity Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: 12 }}>
          <span className="eral-ai-badge">
            <span className="eral-pulse" />
            AI Editorial Intelligence
          </span>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 900, color: '#fff',
            boxShadow: '0 0 0 3px #6366f133, 0 0 20px #6366f133',
          }}>
            E
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 10 }}>
              Eral
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 560, marginBottom: 0 }}>
              Eral is an AI editorial system built into WokPost. It continuously monitors hundreds of RSS feeds, research archives, community discussions, and news sources — detecting emerging patterns, tracking coverage velocity, and writing long-form analysis grounded exclusively in what its data shows. It does not speculate beyond its sources. It cites everything.
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="eral-stat-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { val: posts.length.toString(),             lbl: 'Analyses published' },
          { val: featuredCount.toString(),            lbl: 'Featured pieces'    },
          { val: totalViews.toLocaleString(),         lbl: 'Total reads'        },
          { val: sourcesScanned.toLocaleString()+'+', lbl: 'Sources analyzed'  },
          { val: totalWords.toLocaleString()+'+',     lbl: 'Words written'      },
          { val: totalRatings > 0 ? `${avgRating}/5` : '—', lbl: `Avg rating${totalRatings > 0 ? ` (${totalRatings})` : ''}` },
          { val: postsByCategory.length.toString(),  lbl: 'Topics covered'     },
        ].map(({ val, lbl }) => (
          <div key={lbl} className="eral-stat-card">
            <div className="eral-stat-val">{val}</div>
            <div className="eral-stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Live Signals */}
      {liveSignals.length > 0 && (
        <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span className="eral-pulse" style={{ position: 'static', display: 'inline-block', width: 8, height: 8, background: '#22c55e', borderRadius: '50%', flexShrink: 0 }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', fontFamily: 'var(--font-mono)' }}>
              Live signals — last 12h
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {liveSignals.map(s => (
              <span key={s.term} className={`eral-signal-chip sig-${s.type}`} style={{ fontSize: '0.7rem' }}>
                {s.term}
                <span style={{ marginLeft: 5, fontFamily: 'var(--font-mono)', opacity: 0.7, fontSize: '0.6rem' }}>×{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* How Eral works */}
      <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '2.5rem', borderLeft: '3px solid #6366f1' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818cf8', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
          How Eral works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { step: '01', title: 'Signal detection', desc: 'Eral monitors WokPost\'s live feed for coverage velocity spikes, source clustering, and keyword frequency shifts.' },
            { step: '02', title: 'Source analysis',   desc: 'When a topic crosses a threshold, Eral pulls the top sources, cross-references claims, and maps the coverage landscape.' },
            { step: '03', title: 'Writing',            desc: 'Eral writes synthesis pieces: what is actually happening, what the data says, what the coverage is missing, and why it matters now.' },
            { step: '04', title: 'Transparency',       desc: 'Every piece includes the signals that triggered it, the sources cited, and Eral\'s methodology — no black boxes.' },
          ].map(({ step, title, desc }) => (
            <div key={step}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#6366f1', fontWeight: 700, marginBottom: 4 }}>{step}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.875rem', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts by category */}
      {postsByCategory.map(({ catId, cat, posts: catPosts }) => {
        const Icon = CATEGORY_ICONS[catId];
        return (
          <div key={catId} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              {Icon && <Icon size={14} style={{ color: cat?.color ?? author.color }} />}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat?.color ?? author.color }}>
                {cat?.label ?? catId}
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                {catPosts.length} {catPosts.length === 1 ? 'analysis' : 'analyses'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {catPosts.map(post => {
                let tags: string[] = [];
                try { tags = JSON.parse(post.tags ?? '[]'); } catch { /* */ }
                let signals: { label: string; type: string }[] = [];
                try { signals = JSON.parse(post.signals ?? '[]'); } catch { /* */ }
                return (
                  <Link
                    key={post.slug}
                    href={`/editorial/${post.slug}`}
                    className="author-post-card"
                    style={{ display: 'block', textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', transition: 'border-color 0.15s, background 0.15s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {post.featured === 1 && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', background: '#f59e0b15', border: '1px solid #f59e0b33', borderRadius: 4, padding: '1px 6px', marginBottom: 6, display: 'inline-block' }}>
                            Featured
                          </span>
                        )}
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.4, marginBottom: 4 }}>
                          {post.title}
                        </div>
                        {post.trigger_reason && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', lineHeight: 1.5, marginBottom: 6, fontStyle: 'italic' }}>
                            {post.trigger_reason.slice(0, 120)}{post.trigger_reason.length > 120 ? '…' : ''}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                            {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>· {post.reading_time ?? 5}m</span>
                          {signals.slice(0, 2).map((s, i) => (
                            <span key={i} className={`eral-signal-chip sig-${s.type}`} style={{ fontSize: '0.55rem', padding: '1px 7px' }}>{s.label}</span>
                          ))}
                          {tags.slice(0, 2).map(tag => (
                            <span key={tag} style={{ fontSize: '0.6rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px' }}>
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
        );
      })}

      {posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          No published analyses yet.
        </div>
      )}

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <Link href="/editorial" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textDecoration: 'none' }}>
          ← All Editorial Analyses
        </Link>
      </div>
    </div>
  );
}
