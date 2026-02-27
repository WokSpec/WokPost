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
type CatInfo = { label: string; color: string };

export default function ProfileClient({
  initialBookmarks,
  initialSavedFeeds,
  categories,
}: {
  initialBookmarks: BookmarkRow[];
  initialSavedFeeds: SavedFeedRow[];
  categories: Record<string, CatInfo>;
}) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [savedFeeds, setSavedFeeds] = useState(initialSavedFeeds);

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
      {/* ── Saved Feeds ── */}
      <section style={{ marginBottom: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>My Feeds</h2>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{savedFeeds.length} saved</span>
        </div>

        {savedFeeds.length === 0 ? (
          <div style={{ padding: '28px 20px', background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.7 }}>
            No saved feeds yet.<br />
            Use the <strong style={{ color: 'var(--text-2)' }}>Save Feed</strong> button while browsing to capture your current filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {savedFeeds.map(feed => {
              const cat = feed.category ? categories[feed.category] : null;
              const params = new URLSearchParams();
              if (feed.keywords) params.set('q', feed.keywords);
              if (feed.sort) params.set('sort', feed.sort);
              const href = feed.category
                ? `/${feed.category}${params.size ? `?${params}` : ''}`
                : `/${params.size ? `?${params}` : ''}`;
              return (
                <div key={feed.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{feed.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {cat && <span style={{ color: cat.color }}>{cat.label}</span>}
                    {feed.keywords && <span>"{feed.keywords}"</span>}
                    <span>· {feed.sort}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Link href={href} style={{ flex: 1, textAlign: 'center', background: 'var(--accent)', color: '#000', fontSize: 12, fontWeight: 700, padding: '7px 0', borderRadius: 6, textDecoration: 'none' }}>
                      Open →
                    </Link>
                    <button
                      onClick={() => removeFeed(feed.id)}
                      style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: 13, padding: '7px 12px', borderRadius: 6, cursor: 'pointer' }}
                      title="Delete feed"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Bookmarks ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Bookmarks</h2>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{bookmarks.length} saved</span>
        </div>

        {bookmarks.length === 0 ? (
          <div style={{ padding: '28px 20px', background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.7 }}>
            No bookmarks yet.<br />
            Hit <strong style={{ color: 'var(--text-2)' }}>🔖</strong> on any story to save it here.
          </div>
        ) : (
          <div>
            {bookmarks.map(bm => {
              const cat = bm.item_category ? categories[bm.item_category] : null;
              return (
                <div key={bm.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  {bm.item_thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bm.item_thumbnail} alt="" width={80} height={54} style={{ objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                      {cat && <span style={{ fontSize: 11, fontWeight: 700, color: cat.color }}>{cat.label}</span>}
                      {bm.item_ai_tagged === 1 && (
                        <span className="ai-badge" style={{ fontSize: 10 }}>AI {bm.item_ai_score}/10</span>
                      )}
                      {bm.item_source_tier === 1 && (
                        <span style={{ color: '#f59e0b', fontSize: 11 }}>◆</span>
                      )}
                    </div>
                    <a href={bm.item_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.45, display: 'block' }}>
                      {bm.item_title}
                    </a>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'flex', gap: 8 }}>
                      {bm.item_source && <span>{bm.item_source}</span>}
                      <span>·</span>
                      <span>{new Date(bm.bookmarked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBookmark(bm.item_id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: '4px 6px', flexShrink: 0, lineHeight: 1 }}
                    title="Remove bookmark"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
