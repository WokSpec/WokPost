'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { FeedItem } from '@/lib/feed/types';
import { FeedCard } from './FeedComponents';

interface Props {
  initialItems: FeedItem[];
  category?: string;
  initialTotal?: number;
}

export function InteractiveFeed({ initialItems, category, initialTotal = 0 }: Props) {
  const { data: session } = useSession();
  const [allItems, setAllItems] = useState<FeedItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'trending' | 'impact'>('latest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialTotal > initialItems.length || initialItems.length >= 20);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Bookmarks: Set of item IDs that are bookmarked
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);
  // Save-feed modal
  const [showSaveFeed, setShowSaveFeed] = useState(false);
  const [saveFeedName, setSaveFeedName] = useState('');
  const [saveFeedLoading, setSaveFeedLoading] = useState(false);
  const [saveFeedMsg, setSaveFeedMsg] = useState('');
  const saveFeedRef = useRef<HTMLDivElement>(null);

  // Load bookmarks: cloud if logged in, localStorage otherwise
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/bookmarks')
        .then(r => r.json())
        .then((data: unknown) => {
          const d = data as { bookmarks?: { item_id: string }[] };
          if (d.bookmarks) {
            setBookmarks(new Set(d.bookmarks.map(b => b.item_id)));
          }
        })
        .catch(() => {});
    } else {
      try {
        const saved = localStorage.getItem('wokpost-bookmarks');
        if (saved) setBookmarks(new Set(JSON.parse(saved) as string[]));
      } catch { /* localStorage unavailable */ }
    }
  }, [session?.user?.id]);

  // Keep localStorage in sync for logged-out users
  const toggleBookmark = useCallback((id: string) => {
    if (!session) {
      setBookmarks(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        try { localStorage.setItem('wokpost-bookmarks', JSON.stringify([...next])); } catch { /* ignore */ }
        return next;
      });
    }
    // Logged-in: FeedCard handles the API call directly; just sync local state
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, [session]);

  const displayItems = (() => {
    let result = allItems;
    if (showBookmarks) result = result.filter(i => bookmarks.has(i.id));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        i.sourceName.toLowerCase().includes(q)
      );
    }
    if (sort === 'trending') {
      result = [...result].sort((a, b) =>
        ((b.score ?? 0) + (b.commentCount ?? 0)) - ((a.score ?? 0) + (a.commentCount ?? 0))
      );
    } else if (sort === 'impact') {
      result = [...result].sort((a, b) => b.aiScore - a.aiScore);
    }
    return result;
  })();

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({ page: String(nextPage), sort, ...(category ? { category } : {}) });
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json() as { items: FeedItem[]; hasMore: boolean };
      setAllItems(prev => {
        const ids = new Set(prev.map(i => i.id));
        return [...prev, ...data.items.filter(i => !ids.has(i.id))];
      });
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams({ page: '1', sort, ...(category ? { category } : {}) });
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json() as { items: FeedItem[]; hasMore: boolean };
      setAllItems(data.items);
      setPage(1);
      setHasMore(data.hasMore);
    } catch { /* ignore */ }
    setRefreshing(false);
  };

  const saveFeed = async () => {
    if (!session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (!saveFeedName.trim()) { setSaveFeedMsg('Enter a name.'); return; }
    setSaveFeedLoading(true);
    setSaveFeedMsg('');
    try {
      const res = await fetch('/api/saved-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveFeedName.trim(),
          category: category ?? null,
          keywords: search || null,
          sort,
        }),
      });
      if (res.ok) {
        setSaveFeedMsg('✓ Feed saved!');
        setSaveFeedName('');
        setTimeout(() => { setShowSaveFeed(false); setSaveFeedMsg(''); }, 1200);
      } else {
        setSaveFeedMsg('Failed to save. Try again.');
      }
    } catch { setSaveFeedMsg('Network error.'); }
    setSaveFeedLoading(false);
  };

  return (
    <div>
      {/* Controls bar */}
      <div className="feed-controls">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="search"
            placeholder="Search stories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>
          )}
        </div>
        <div className="sort-tabs">
          {(['latest', 'trending', 'impact'] as const).map(s => (
            <button
              key={s}
              className={`sort-tab${sort === s && !showBookmarks ? ' active' : ''}`}
              onClick={() => { setSort(s); setShowBookmarks(false); }}
            >
              {s === 'latest' ? '🕐 Latest' : s === 'trending' ? '🔥 Trending' : '🤖 AI Impact'}
            </button>
          ))}
          <button
            className={`sort-tab${showBookmarks ? ' active' : ''}`}
            onClick={() => setShowBookmarks(b => !b)}
            title="View saved bookmarks"
          >
            🔖 Saved{bookmarks.size > 0 ? ` (${bookmarks.size})` : ''}
          </button>
          {/* Save current feed as a named preset */}
          <div style={{ position: 'relative' }} ref={saveFeedRef}>
            <button
              className="sort-tab"
              onClick={() => setShowSaveFeed(s => !s)}
              title="Save this feed filter"
            >
              📌 Save Feed
            </button>
            {showSaveFeed && (
              <>
                <div onClick={() => setShowSaveFeed(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50,
                  background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10,
                  padding: 16, minWidth: 240, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Save current feed</div>
                  {!session && (
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>
                      Sign in to save feeds across devices.
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
                    {category ? `Category: ${category}` : 'All categories'}
                    {search ? ` · "${search}"` : ''}
                    {` · ${sort}`}
                  </div>
                  <input
                    type="text"
                    placeholder="Name this feed…"
                    value={saveFeedName}
                    onChange={e => setSaveFeedName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveFeed()}
                    style={{
                      width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '8px 10px', fontSize: 13, color: 'var(--text)',
                      boxSizing: 'border-box', marginBottom: 8,
                    }}
                    autoFocus
                  />
                  {saveFeedMsg && (
                    <div style={{ fontSize: 12, color: saveFeedMsg.startsWith('✓') ? '#4ade80' : '#f87171', marginBottom: 8 }}>
                      {saveFeedMsg}
                    </div>
                  )}
                  <button
                    onClick={saveFeed}
                    disabled={saveFeedLoading}
                    style={{
                      width: '100%', background: 'var(--accent)', color: '#000',
                      border: 'none', borderRadius: 6, padding: '9px 0',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {saveFeedLoading ? 'Saving…' : session ? 'Save' : 'Sign in to save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <button className="refresh-btn" onClick={refresh} disabled={refreshing} title="Refresh feed">
          <span className={refreshing ? 'spin' : ''}>↻</span>
        </button>
      </div>

      {/* Stats bar */}
      <div className="feed-stats">
        <span style={{ color: 'var(--text-3)', fontSize: 12 }}>
          {search
            ? `${displayItems.length} result${displayItems.length !== 1 ? 's' : ''} for "${search}"`
            : showBookmarks
            ? `${bookmarks.size} saved stor${bookmarks.size !== 1 ? 'ies' : 'y'}`
            : `${allItems.length} stories loaded`}
        </span>
        {search && displayItems.length > 0 && (
          <button className="clear-search-btn" onClick={() => setSearch('')}>Clear search</button>
        )}
      </div>

      {/* Feed grid */}
      <div className="feed-grid">
        {displayItems.map((item, i) => (
          <FeedCard
            key={item.id}
            item={item}
            index={i}
            bookmarked={bookmarks.has(item.id)}
            onBookmark={toggleBookmark}
          />
        ))}
      </div>

      {/* Empty state */}
      {displayItems.length === 0 && (
        <div className="feed-empty">
          {search
            ? <>No stories matching <strong>&ldquo;{search}&rdquo;</strong> — <button className="link-btn" onClick={() => setSearch('')}>clear search</button></>
            : showBookmarks
            ? <>No saved stories yet. Click 🏷️ on any card to save it.</>
            : <>No stories found. <button className="link-btn" onClick={refresh}>Refresh</button></>
          }
        </div>
      )}

      {/* Load more */}
      {!search && !showBookmarks && hasMore && (
        <button className="load-more-btn" onClick={loadMore} disabled={loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span className="spin">↻</span> Loading…
            </span>
          ) : 'Load more stories'}
        </button>
      )}

      {!search && !showBookmarks && !hasMore && allItems.length > 0 && (
        <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)', borderTop: '1px solid var(--border)' }}>
          All {allItems.length} stories loaded
        </div>
      )}
    </div>
  );
}
