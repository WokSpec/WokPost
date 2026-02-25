'use client';
import { useState, useEffect } from 'react';
import { CATEGORIES, type Category } from '@/lib/feed/types';
import Link from 'next/link';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const data = JSON.parse(localStorage.getItem('wp_bookmarks_data') ?? '[]') as Bookmark[];
        setBookmarks(data.slice().reverse());
      } catch { /* ignore */ }
    });
  }, []);

  function remove(id: string) {
    try {
      const ids = JSON.parse(localStorage.getItem('wp_bookmarks') ?? '[]') as string[];
      localStorage.setItem('wp_bookmarks', JSON.stringify(ids.filter(x => x !== id)));
      const data = JSON.parse(localStorage.getItem('wp_bookmarks_data') ?? '[]') as Bookmark[];
      const next = data.filter(x => x.id !== id);
      localStorage.setItem('wp_bookmarks_data', JSON.stringify(next));
      setBookmarks(next.slice().reverse());
    } catch { /* ignore */ }
  }

  return (
    <div className="site-container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ marginBottom: 28 }}>
        <Link href="/" style={{ fontSize: 12, color: 'var(--text-3)' }}>← Back to Feed</Link>
        <h1 style={{ marginTop: 12, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Saved Stories</h1>
        {bookmarks.length > 0 && (
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-3)' }}>{bookmarks.length} saved · stored locally in your browser</p>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>☆</div>
          <p>No saved stories yet. Click ☆ on any card to save it here.</p>
        </div>
      ) : (
        <div className="feed-grid">
          {bookmarks.map(b => {
            const cat = CATEGORIES[b.category as Category];
            return (
              <div key={b.id} className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-tag" style={{ color: cat?.color }}>{cat?.label ?? b.category}</span>
                  <button
                    onClick={() => remove(b.id)}
                    title="Remove"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 14, lineHeight: 1 }}
                  >★</button>
                </div>
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="card-title" style={{ display: 'block', marginTop: 4 }}>{b.title}</a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
