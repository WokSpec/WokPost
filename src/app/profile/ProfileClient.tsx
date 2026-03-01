'use client';

import { useState } from 'react';
import Link from 'next/link';

type BookmarkRow = {
  id: string; item_id: string; item_title: string; item_url: string;
  item_category: string | null; item_source: string | null; item_source_tier: number;
  item_thumbnail: string | null; item_ai_score: number; item_ai_tagged: number;
  bookmarked_at: string;
};
type SavedFeedRow = {
  id: string; name: string; category: string | null; keywords: string | null;
  sort: string; created_at: string;
};
type HistoryRow = {
  id: string; item_id: string; item_title: string; item_url: string;
  item_category: string | null; item_thumbnail: string | null; read_at: string;
};
type CatInfo = { label: string; color: string };

export default function ProfileClient({
  initialBookmarks,
  initialSavedFeeds,
  initialHistory = [],
  categories,
}: {
  initialBookmarks: BookmarkRow[];
  initialSavedFeeds: SavedFeedRow[];
  initialHistory?: HistoryRow[];
  categories: Record<string, CatInfo>;
}) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [savedFeeds, setSavedFeeds] = useState(initialSavedFeeds);
  const [history, setHistory] = useState(initialHistory);

  const removeBookmark = async (itemId: string) => {
    const res = await fetch(`/api/bookmarks?item_id=${encodeURIComponent(itemId)}`, { method: 'DELETE' });
    if (res.ok) setBookmarks(prev => prev.filter(b => b.item_id !== itemId));
  };

  const removeFeed = async (id: string) => {
    const res = await fetch(`/api/saved-feeds?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) setSavedFeeds(prev => prev.filter(f => f.id !== id));
  };

  return (
    <>
      {/* Saved Feeds */}
      <section style={{ marginBottom: '3rem' }} id="saved-feeds">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
            My Feeds
          </h2>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            {savedFeeds.length} saved
          </span>
        </div>

        {savedFeeds.length === 0 ? (
          <div className="feed-empty" style={{ textAlign: 'left' }}>
            No saved feeds yet. Use the <strong style={{ color: 'var(--text-muted)' }}>Save Feed</strong> button while browsing to capture your current filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {savedFeeds.map(feed => {
              const cat = feed.category ? categories[feed.category] : null;
              const params = new URLSearchParams();
              if (feed.keywords) params.set('q', feed.keywords);
              if (feed.sort) params.set('sort', feed.sort);
              const href = feed.category
                ? `/${feed.category}${params.size ? `?${params}` : ''}`
                : `/${params.size ? `?${params}` : ''}`;
              return (
                <div key={feed.id} className="profile-card">
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>
                    {feed.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'flex', gap: 6, flexWrap: 'wrap', fontFamily: 'var(--font-mono)' }}>
                    {cat && <span style={{ color: cat.color }}>{cat.label}</span>}
                    {feed.keywords && <span>&ldquo;{feed.keywords}&rdquo;</span>}
                    <span>· {feed.sort}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Link
                      href={href}
                      style={{ flex: 1, textAlign: 'center', background: 'var(--accent)', color: '#020c14', fontSize: '0.72rem', fontWeight: 700, padding: '7px 0', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => removeFeed(feed.id)}
                      style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: '0.72rem', padding: '7px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                      title="Delete feed"
                      aria-label="Delete feed"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bookmarks */}
      <section id="bookmarks">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
            Bookmarks
          </h2>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            {bookmarks.length} saved
          </span>
        </div>

        {bookmarks.length === 0 ? (
          <div className="feed-empty" style={{ textAlign: 'left' }}>
            No bookmarks yet. Tap the bookmark icon on any story to save it here.
          </div>
        ) : (
          <div>
            {bookmarks.map(bm => {
              const cat = bm.item_category ? categories[bm.item_category] : null;
              return (
                <div
                  key={bm.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '1rem 0', borderBottom: '1px solid var(--border)' }}
                >
                  {bm.item_thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bm.item_thumbnail}
                      alt=""
                      width={80}
                      height={54}
                      style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                      {cat && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: cat.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                          {cat.label}
                        </span>
                      )}
                      {bm.item_ai_tagged === 1 && (
                        <span className="ai-badge">AI {bm.item_ai_score}/10</span>
                      )}
                      {bm.item_source_tier === 1 && <span className="tier1-badge">T1</span>}
                    </div>
                    <a
                      href={bm.item_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.45, display: 'block', transition: 'color 0.15s' }}
                    >
                      {bm.item_title}
                    </a>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: 4, display: 'flex', gap: 8, fontFamily: 'var(--font-mono)' }}>
                      {bm.item_source && <span>{bm.item_source}</span>}
                      <span>·</span>
                      <span>{new Date(bm.bookmarked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBookmark(bm.item_id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}
                    title="Remove bookmark"
                    aria-label="Remove bookmark"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reading history */}
      <section style={{ marginBottom: '3rem' }} id="history">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
            Recently Read
          </h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              {history.length} items
            </span>
            {history.length > 0 && (
              <button
                onClick={async () => {
                  const res = await fetch('/api/history', { method: 'DELETE' });
                  if (res.ok) setHistory([]);
                }}
                style={{ fontSize: '0.68rem', color: 'var(--text-faint)', background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {history.length === 0 ? (
          <div className="feed-empty" style={{ textAlign: 'left' }}>
            No reading history yet. Stories you open will appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.map(h => {
              const cat = h.item_category ? categories[h.item_category] : null;
              const ago = (() => {
                const diff = Date.now() - new Date(h.read_at).getTime();
                const hr = Math.floor(diff / 3_600_000);
                if (hr < 1) return `${Math.floor(diff / 60_000)}m ago`;
                if (hr < 24) return `${hr}h ago`;
                return `${Math.floor(hr / 24)}d ago`;
              })();
              return (
                <a
                  key={h.id}
                  href={h.item_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 10, textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s' }}
                  className="history-row"
                >
                  {h.item_thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.item_thumbnail} alt="" width={48} height={36} style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 48, height: 36, borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.item_title}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                      {cat && <span style={{ color: cat.color }}>{cat.label}</span>}
                      <span>{ago}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
