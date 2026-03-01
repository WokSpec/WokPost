'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/feed/types';
import { IcoBookmark } from '@/components/Icons';

export const dynamic = 'force-dynamic';

interface Bookmark {
  id: string;
  item_id: string;
  item_title: string;
  item_url: string;
  item_category: string;
  item_source: string;
  item_thumbnail: string | null;
  item_ai_score: number | null;
  item_ai_tagged: number;
  bookmarked_at: string;
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { setLoading(false); return; }
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then((d: { bookmarks?: Bookmark[] }) => {
        setBookmarks(d.bookmarks ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, status]);

  const removeBookmark = async (itemId: string) => {
    const res = await fetch(`/api/bookmarks?item_id=${encodeURIComponent(itemId)}`, { method: 'DELETE' });
    if (res.ok) setBookmarks(prev => prev.filter(b => b.item_id !== itemId));
  };

  const categories = ['all', ...Array.from(new Set(bookmarks.map(b => b.item_category)))];
  const filtered = filter === 'all' ? bookmarks : bookmarks.filter(b => b.item_category === filter);

  if (status === 'loading' || loading) {
    return (
      <main className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 10 }} />)}
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <IcoBookmark size={40} style={{ color: 'var(--text-muted)', display: 'block', margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Your Bookmarks</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Sign in to save and view your bookmarks.</p>
        <Link href="/login?callbackUrl=/bookmarks" className="btn-primary">Sign in</Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '2rem 1rem', maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <IcoBookmark size={28} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Saved Stories</h1>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
          {bookmarks.length} saved
        </span>
      </div>

      {/* Category filter pills */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {categories.map(c => {
            const cat = CATEGORIES[c as keyof typeof CATEGORIES];
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                  border: '1px solid var(--border)', cursor: 'pointer',
                  background: filter === c ? (cat?.color ?? 'var(--accent)') : 'var(--surface)',
                  color: filter === c ? '#fff' : 'var(--text)',
                  transition: 'all 0.15s',
                }}
              >
                {c === 'all' ? 'All' : (cat?.label ?? c)}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          {filter === 'all'
            ? <><p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No saved stories yet.</p><p style={{ fontSize: '0.85rem' }}>Tap the bookmark icon on any story to save it here.</p></>
            : <p>No saved stories in this category.</p>
          }
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(b => {
          const cat = CATEGORIES[b.item_category as keyof typeof CATEGORIES];
          const catColor = cat?.color ?? 'var(--accent)';
          const isEditorial = b.item_url.startsWith('/editorial/');
          const href = b.item_url;
          const saved = new Date(b.bookmarked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return (
            <div
              key={b.id}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 14px 12px',
                borderLeft: `3px solid ${catColor}`,
              }}
            >
              {b.item_thumbnail && (
                <Link href={href} style={{ flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.item_thumbnail}
                    alt=""
                    style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                  />
                </Link>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: catColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {cat?.label ?? b.item_category}
                  </span>
                  {isEditorial && (
                    <span className="source-type-badge source-type-editorial">Editorial</span>
                  )}
                  {b.item_ai_tagged === 1 && b.item_ai_score != null && (
                    <span className="ai-badge">AI {b.item_ai_score}/10</span>
                  )}
                </div>
                <Link href={href} style={{ textDecoration: 'none' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.35, color: 'var(--text)', marginBottom: 4 }}>
                    {b.item_title}
                  </p>
                </Link>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.item_source}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Saved {saved}</span>
                </div>
              </div>
              <button
                onClick={() => removeBookmark(b.item_id)}
                title="Remove bookmark"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                  color: 'var(--text-muted)', flexShrink: 0, opacity: 0.7,
                }}
                aria-label="Remove bookmark"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
