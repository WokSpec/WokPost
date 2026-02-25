'use client';
import { useState, useEffect } from 'react';

interface Props {
  id: string;
  title: string;
  url: string;
  category: string;
}

export function BookmarkButton({ id, title, url, category }: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Reading localStorage to init state — safe pattern (one-time sync on mount)
    Promise.resolve().then(() => {
      try {
        const list = JSON.parse(localStorage.getItem('wp_bookmarks') ?? '[]') as string[];
        setSaved(list.includes(id));
      } catch { /* ignore */ }
    });
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = localStorage.getItem('wp_bookmarks') ?? '[]';
      const list = JSON.parse(raw) as string[];
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
      localStorage.setItem('wp_bookmarks', JSON.stringify(next));
      if (!list.includes(id)) {
        const items = JSON.parse(localStorage.getItem('wp_bookmarks_data') ?? '[]') as Props[];
        localStorage.setItem('wp_bookmarks_data', JSON.stringify([...items.filter(x => x.id !== id), { id, title, url, category }]));
      } else {
        const items = JSON.parse(localStorage.getItem('wp_bookmarks_data') ?? '[]') as Props[];
        localStorage.setItem('wp_bookmarks_data', JSON.stringify(items.filter(x => x.id !== id)));
      }
      setSaved(!list.includes(id));
    } catch { /* ignore */ }
  }

  return (
    <button
      onClick={toggle}
      title={saved ? 'Remove bookmark' : 'Save for later'}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 4px',
        color: saved ? 'var(--accent)' : 'var(--text-3)',
        fontSize: 14,
        lineHeight: 1,
        transition: 'color .15s',
        flexShrink: 0,
      }}
    >
      {saved ? '★' : '☆'}
    </button>
  );
}
