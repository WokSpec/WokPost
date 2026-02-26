'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FeedItem } from '@/lib/feed/types';
import { FeedCard } from './FeedComponents';

interface Props {
  initialItems: FeedItem[];
  category?: string;
  initialTotal?: number;
}

export function InteractiveFeed({ initialItems, category, initialTotal = 0 }: Props) {
  const [allItems, setAllItems] = useState<FeedItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'trending' | 'impact'>('latest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialTotal > initialItems.length || initialItems.length >= 20);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wokpost-bookmarks');
      if (saved) setBookmarks(new Set(JSON.parse(saved) as string[]));
    } catch { /* localStorage unavailable */ }
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem('wokpost-bookmarks', JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Client-side filtered/sorted view
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
    } catch { /* network error — ignore */ }
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
          >
            🔖 Saved{bookmarks.size > 0 ? ` (${bookmarks.size})` : ''}
          </button>
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
            ? <>No saved stories yet. Click 🏷️ on any card to save it for later.</>
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
