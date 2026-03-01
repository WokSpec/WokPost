import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIES } from '@/lib/feed/types';
import { IcoNewspaper, IcoPen, IcoChat, IcoThumbUp, IcoTag, IcoGlobe } from '@/components/Icons';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Stats — WokPost',
  description: 'Real-time stats on WokPost content, sources, categories, and editorial coverage.',
};

interface CategoryStat { category: string; count: number; avg_score: number; }
interface SourceStat { source_name: string; count: number; source_tier: string; }
interface DayStat { day: string; count: number; }
interface EditorialStat { category: string; count: number; total_views: number; }

export default async function StatsPage() {
  let totalFeedItems = 0;
  let totalEditorial = 0;
  let totalComments = 0;
  let totalVotes = 0;
  let categoryCounts: CategoryStat[] = [];
  let topSources: SourceStat[] = [];
  let recentDays: DayStat[] = [];
  let editorialStats: EditorialStat[] = [];

  try {
    const db = await (async () => { try { const { getDB } = await import('@/lib/cloudflare'); return await getDB(); } catch { return undefined; } })();
    if (db) {
      const [feedCount, editCount, commentCount, voteCount, catRows, srcRows, dayRows, editRows] = await Promise.all([
        db.prepare('SELECT COUNT(*) as c FROM feed_items').first<{ c: number }>(),
        db.prepare('SELECT COUNT(*) as c FROM editorial_posts WHERE published=1').first<{ c: number }>(),
        db.prepare('SELECT COUNT(*) as c FROM comments').first<{ c: number }>().catch(() => null),
        db.prepare('SELECT COUNT(*) as c FROM votes').first<{ c: number }>().catch(() => null),
        db.prepare('SELECT category, COUNT(*) as count, AVG(ai_score) as avg_score FROM feed_items GROUP BY category ORDER BY count DESC LIMIT 20').all<CategoryStat>(),
        db.prepare('SELECT source_name, COUNT(*) as count, source_tier FROM feed_items GROUP BY source_name ORDER BY count DESC LIMIT 10').all<SourceStat>(),
        db.prepare("SELECT date(fetched_at) as day, COUNT(*) as count FROM feed_items WHERE fetched_at > datetime('now', '-14 days') GROUP BY day ORDER BY day ASC").all<DayStat>(),
        db.prepare('SELECT category, COUNT(*) as count, SUM(views) as total_views FROM editorial_posts WHERE published=1 GROUP BY category ORDER BY count DESC').all<EditorialStat>(),
      ]);
      totalFeedItems = feedCount?.c ?? 0;
      totalEditorial = editCount?.c ?? 0;
      totalComments = commentCount?.c ?? 0;
      totalVotes = voteCount?.c ?? 0;
      categoryCounts = catRows.results;
      topSources = srcRows.results;
      recentDays = dayRows.results;
      editorialStats = editRows.results;
    }
  } catch { /* no D1 */ }

  const maxCatCount = Math.max(...categoryCounts.map(c => c.count), 1);
  const maxDayCount = Math.max(...recentDays.map(d => d.count), 1);

  return (
    <div className="site-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          WokPost
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>
          Site Statistics
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Live metrics on content coverage, sources, and community activity.
        </p>
      </div>

      {/* Top-level metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {[
          { label: 'Feed Items', value: totalFeedItems.toLocaleString(), icon: <IcoNewspaper size={18} />, color: '#6366f1' },
          { label: 'Editorial Posts', value: totalEditorial.toString(), icon: <IcoPen size={18} />, color: '#a855f7' },
          { label: 'Comments', value: totalComments.toLocaleString(), icon: <IcoChat size={18} />, color: '#22d3ee' },
          { label: 'Votes Cast', value: totalVotes.toLocaleString(), icon: <IcoThumbUp size={18} />, color: '#10b981' },
          { label: 'Categories', value: categoryCounts.length.toString(), icon: <IcoTag size={18} />, color: '#f59e0b' },
          { label: 'Sources', value: topSources.length + '+', icon: <IcoGlobe size={18} />, color: '#f43f5e' },
        ].map(m => (
          <div key={m.label} style={{ padding: '1.25rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.04em', color: m.color, lineHeight: 1 }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Category breakdown */}
        <div style={{ padding: '1.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
            Feed by category
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categoryCounts.slice(0, 12).map(c => {
              const info = CATEGORIES[c.category as keyof typeof CATEGORIES];
              const pct = Math.round((c.count / maxCatCount) * 100);
              return (
                <div key={c.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <Link href={`/${c.category}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: info?.color ?? 'var(--text-muted)', textDecoration: 'none' }}>
                      {info?.label ?? c.category}
                    </Link>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{c.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: info?.color ?? 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity chart */}
        <div style={{ padding: '1.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
            Items indexed (last 14 days)
          </div>
          {recentDays.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
              {recentDays.map(d => {
                const h = Math.max(4, Math.round((d.count / maxDayCount) * 100));
                const date = new Date(d.day);
                const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={d.day} title={`${label}: ${d.count} items`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'default' }}>
                    <div style={{ width: '100%', height: `${h}%`, background: 'var(--accent)', borderRadius: '3px 3px 0 0', opacity: 0.8, minHeight: 4 }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
              No data yet
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {recentDays.length > 0 && (
              <>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(recentDays[0].day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(recentDays[recentDays.length - 1].day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Sources */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
          Top sources
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {topSources.map((s, i) => (
            <div key={s.source_name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', width: 18, flexShrink: 0 }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.source_name}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{s.count} items · Tier {s.source_tier}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial Stats */}
      {editorialStats.length > 0 && (
        <div style={{ padding: '1.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              Editorial by category
            </div>
            <Link href="/editorial" style={{ fontSize: '0.72rem', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
              All posts →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {editorialStats.map(e => {
              const info = CATEGORIES[e.category as keyof typeof CATEGORIES];
              return (
                <Link key={e.category} href={`/editorial#cat-${e.category}`} style={{ textDecoration: 'none', padding: '1rem', background: 'var(--surface)', border: `1px solid ${info?.color ?? 'var(--border)'}44`, borderRadius: 10 }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: info?.color ?? 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                    {info?.label ?? e.category}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>
                    {e.count}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {(e.total_views ?? 0).toLocaleString()} views
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
