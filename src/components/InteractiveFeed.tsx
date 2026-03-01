'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { FeedItem, ContentType } from '@/lib/feed/types';
import { FeedCard, IconRefresh, IconSearch, IconClose } from './FeedComponents';

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
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialTotal > initialItems.length || initialItems.length >= 20);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSaveFeed, setShowSaveFeed] = useState(false);
  const [saveFeedName, setSaveFeedName] = useState('');
  const [saveFeedLoading, setSaveFeedLoading] = useState(false);
  const [saveFeedMsg, setSaveFeedMsg] = useState('');
  const saveFeedRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load bookmarks
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/bookmarks')
        .then(r => r.json())
        .then((data: unknown) => {
          const d = data as { bookmarks?: { item_id: string }[] };
          if (d.bookmarks) setBookmarks(new Set(d.bookmarks.map(b => b.item_id)));
        })
        .catch(() => {});
    } else {
      try {
        const saved = localStorage.getItem('wokpost-bookmarks');
        if (saved) setBookmarks(new Set(JSON.parse(saved) as string[]));
      } catch { /* ignore */ }
    }
  }, [session?.user?.id]);

  // Close save-feed popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (saveFeedRef.current && !saveFeedRef.current.contains(e.target as Node)) {
        setShowSaveFeed(false);
      }
    };
    if (showSaveFeed) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSaveFeed]);

  // Keyboard shortcuts: j/k navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches('input, textarea')) return;
      if (e.key === 'j' || e.key === 'k') {
        const cards = document.querySelectorAll<HTMLElement>('.card');
        const focused = document.querySelector<HTMLElement>('.card[data-focused]');
        let idx = Array.from(cards).indexOf(focused!);
        idx = e.key === 'j' ? Math.min(idx + 1, cards.length - 1) : Math.max(idx - 1, 0);
        focused?.removeAttribute('data-focused');
        const next = cards[idx];
        if (next) { next.setAttribute('data-focused', '1'); next.scrollIntoView({ block: 'nearest' }); }
      }
      if (e.key === 'Enter') {
        const focused = document.querySelector<HTMLAnchorElement>('.card[data-focused] a');
        focused?.click();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const loadMore = useCallback(async () => {
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
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch { /* ignore */ }
    setLoading(false);
  }, [loading, hasMore, page, sort, category]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && !loading && hasMore && !showBookmarks && !search) {
        loadMore();
      }
    }, { rootMargin: '200px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, loading, hasMore, showBookmarks, search]);

  const toggleBookmark = useCallback((id: string) => {
    if (!session) {
      setBookmarks(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        try { localStorage.setItem('wokpost-bookmarks', JSON.stringify([...next])); } catch { /* ignore */ }
        return next;
      });
      return;
    }
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, [session]);

  const displayItems = (() => {
    let result = allItems;
    if (showBookmarks) result = result.filter(i => bookmarks.has(i.id));
    if (typeFilter !== 'all') result = result.filter(i => i.contentType === typeFilter);
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

  const handleRefresh = async () => {
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

  const handleSaveFeed = async () => {
    if (!session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (!saveFeedName.trim() || saveFeedLoading) return;
    setSaveFeedLoading(true);
    const res = await fetch('/api/saved-feeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: saveFeedName.trim(), category, search, sort }),
    });
    setSaveFeedLoading(false);
    setSaveFeedMsg(res.ok ? 'Saved' : 'Error saving');
    if (res.ok) {
      setSaveFeedName('');
      setTimeout(() => { setShowSaveFeed(false); setSaveFeedMsg(''); }, 1000);
    }
  };

  // Content type counts
  const storiesCount = allItems.filter(i => i.contentType === 'story').length;
  const papersCount  = allItems.filter(i => i.contentType === 'paper').length;
  const reposCount   = allItems.filter(i => i.contentType === 'repo').length;

  return (
    <div>
      {/* Controls */}
      <div className="feed-controls">
        <div className="search-wrap">
          <span className="search-icon-wrap"><IconSearch /></span>
          <input
            type="search"
            className="search-input"
            placeholder="Search stories, sources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search stories"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              <IconClose />
            </button>
          )}
        </div>

        <div className="sort-tabs">
          {(['latest', 'trending', 'impact'] as const).map(s => (
            <button
              key={s}
              className={`sort-tab${sort === s ? ' active' : ''}`}
              onClick={() => setSort(s)}
            >
              {s === 'latest' ? 'Latest' : s === 'trending' ? 'Trending' : 'AI Impact'}
            </button>
          ))}
        </div>

        <button
          className={`sort-tab${showBookmarks ? ' active' : ''}`}
          onClick={() => setShowBookmarks(v => !v)}
          title="Saved stories"
        >
          Saved{bookmarks.size > 0 ? ` (${bookmarks.size})` : ''}
        </button>

        <div ref={saveFeedRef} style={{ position: 'relative' }}>
          <button className="sort-tab" onClick={() => setShowSaveFeed(v => !v)} title="Save current feed as preset">
            Save Feed
          </button>
          {showSaveFeed && (
            <div className="save-feed-popover">
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-faint)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Save Feed Preset
              </div>
              <input
                autoFocus
                placeholder="Name this feed..."
                value={saveFeedName}
                onChange={e => setSaveFeedName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveFeed()}
              />
              {saveFeedMsg && (
                <div style={{ fontSize: '0.7rem', color: saveFeedMsg === 'Saved' ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                  {saveFeedMsg}
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={handleSaveFeed}
                disabled={saveFeedLoading || !saveFeedName.trim()}
                style={{ fontSize: '0.72rem', padding: '6px 14px' }}
              >
                {saveFeedLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh feed"
          title="Refresh"
        >
          <IconRefresh spinning={refreshing} />
        </button>
      </div>

      {/* Content-type filter */}
      {(papersCount > 0 || reposCount > 0) && (
        <div className="type-filter">
          {([
            ['all',   'All',     allItems.length],
            ['story', 'Stories', storiesCount],
            ['paper', 'Papers',  papersCount],
            ['repo',  'Repos',   reposCount],
          ] as [ContentType | 'all', string, number][]).filter(([id, , count]) => id === 'all' || count > 0).map(([id, label, count]) => (
            <button
              key={id}
              className={`type-pill${typeFilter === id ? ' active' : ''}`}
              onClick={() => setTypeFilter(id)}
            >
              {label}
              <span className="type-pill-count">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="feed-stats">
        <span>
          {showBookmarks
            ? `${displayItems.length} saved stor${displayItems.length !== 1 ? 'ies' : 'y'}`
            : search
              ? `${displayItems.length} result${displayItems.length !== 1 ? 's' : ''}`
              : `${allItems.length} stories`}
        </span>
        {search && (
          <button className="clear-search-btn" onClick={() => setSearch('')}>
            Clear
          </button>
        )}
      </div>

      {/* Grid or Empty */}
      {displayItems.length === 0 ? (
        <div className="feed-empty">
          {showBookmarks ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-heading)' }}>No saved stories yet</div>
              Sign in and bookmark articles to build your reading list.
            </>
          ) : search ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>No results for &ldquo;{search}&rdquo;</div>
              <button className="clear-search-btn" onClick={() => setSearch('')}>Clear search</button>
            </>
          ) : typeFilter !== 'all' ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>No {typeFilter}s in this feed</div>
              <button className="clear-search-btn" onClick={() => setTypeFilter('all')}>Show all types</button>
            </>
          ) : (
            'No stories yet. Check back soon.'
          )}
        </div>
      ) : (
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
      )}

      {/* Infinite scroll sentinel */}
      {!showBookmarks && !search && (
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
      )}

      {/* Skeleton loading cards */}
      {loading && (
        <div style={{ display: 'contents' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-image" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-meta" />
            </div>
          ))}
        </div>
      )}

      {/* End of feed */}
      {!hasMore && allItems.length > 0 && !showBookmarks && !search && (
        <div style={{ textAlign: 'center', padding: '1.5rem 0', fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--border)', marginTop: 8 }}>
          You&apos;ve reached the end · {allItems.length} stories
        </div>
      )}
    </div>
  );
}
