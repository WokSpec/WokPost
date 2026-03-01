'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FeedCard } from '@/components/FeedComponents';
import { CATEGORIES } from '@/lib/feed/types';
import type { FeedItem, Category } from '@/lib/feed/types';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  source_name: string;
  category: string;
  summary: string | null;
  thumbnail: string | null;
  published_at: string;
  score: number | null;
  result_type: 'story' | 'editorial';
  slug: string | null;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Run search when q param changes
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setQuery(q);
    if (q.trim().length < 2) { setItems([]); setTotal(0); setSearched(false); return; }

    setLoading(true);
    setSearched(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}&limit=40`)
      .then(r => r.json())
      .then((data: unknown) => {
        const d = data as { results?: SearchResult[]; total?: number };
        const mapped: FeedItem[] = (d.results ?? []).map(r => ({
          id: r.id,
          title: r.title,
          url: r.result_type === 'editorial' ? `/editorial/${r.slug ?? r.id}` : r.url,
          sourceId: r.source_name,
          sourceName: r.source_name,
          sourceType: r.result_type === 'editorial' ? 'editorial' : 'rss',
          sourceTier: 1,
          contentType: (r.result_type === 'editorial' ? 'editorial' : 'story') as FeedItem['contentType'],
          category: (Object.keys(CATEGORIES).includes(r.category) ? r.category : 'ai') as Category,
          aiTagged: false,
          aiScore: r.score ?? 5,
          publishedAt: r.published_at,
          summary: r.summary ?? '',
          tags: [],
          thumbnail: r.thumbnail ?? undefined,
          editorialSlug: r.result_type === 'editorial' ? (r.slug ?? r.id) : undefined,
        }));
        setItems(mapped);
        setTotal(mapped.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: '2.5rem' }}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search stories, papers, repos…"
          autoFocus
          className="search-page-input"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {/* Results */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          Searching…
        </div>
      )}

      {!loading && searched && (
        <div style={{ marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          {total === 0
            ? `No results for "${searchParams.get('q')}"`
            : `${total.toLocaleString()} result${total !== 1 ? 's' : ''} for "${searchParams.get('q')}"`}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="feed-grid">
          {items.map(item => (
            <FeedCard key={item.id} item={item} bookmarked={false} onBookmark={() => {}} />
          ))}
        </div>
      )}

      {!loading && !searched && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-faint)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            Search across all categories — AI research, business, science, and more.
          </p>
          <div className="search-suggestions">
            {['AI breakthroughs', 'climate change', 'startup funding', 'CRISPR', 'quantum computing'].map(s => (
              <button
                key={s}
                className="search-suggestion-pill"
                onClick={() => {
                  setQuery(s);
                  router.push(`/search?q=${encodeURIComponent(s)}`);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="site-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Search
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Find anything
        </h1>
      </div>
      <Suspense fallback={<div style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Loading…</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
