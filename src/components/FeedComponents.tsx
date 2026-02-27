'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/feed/types';
import type { FeedItem } from '@/lib/feed/types';
import { NewsletterFormInline } from './NewsletterForm';
import { AuthButton } from './AuthButton';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          Wok<span>Post</span>
        </Link>
        <nav style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-2)', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'inherit' }}>Feed</Link>
          <Link href="/ai" style={{ color: 'var(--c-ai)', fontWeight: 600 }}>AI</Link>
          <a href="https://wokspec.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>WokSpec</a>
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}

export function CategoryStrip({ active }: { active?: string }) {
  return (
    <div className="cat-strip">
      {Object.entries(CATEGORIES).map(([id, cat]) => (
        <Link
          key={id}
          href={`/${id}`}
          className={`cat-pill ${active === id ? 'active' : ''}`}
          style={{ color: cat.color }}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}

export function FeedCard({ item, index, bookmarked: initialBookmarked, onBookmark }: {
  item: FeedItem;
  index: number;
  bookmarked?: boolean;
  onBookmark?: (id: string) => void;
}) {
  const { data: session } = useSession();
  const [imgFailed, setImgFailed] = useState(false);
  const [bookmarked, setBookmarked] = useState(!!initialBookmarked);
  const [saving, setSaving] = useState(false);

  const cat = CATEGORIES[item.category];
  const showImage = !!(item.thumbnail && !imgFailed);
  const domain = (() => { try { return new URL(item.url).hostname.replace(/^www\./, ''); } catch { return ''; } })();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      // Redirect to login, then back
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (saving) return;
    setSaving(true);

    if (bookmarked) {
      // Remove
      const res = await fetch(`/api/bookmarks?item_id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      if (res.ok) {
        setBookmarked(false);
        onBookmark?.(item.id);
      }
    } else {
      // Add
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          item_title: item.title,
          item_url: item.url,
          item_category: item.category,
          item_source: item.sourceName,
          item_source_tier: item.sourceTier,
          item_thumbnail: item.thumbnail,
          item_ai_score: item.aiScore,
          item_ai_tagged: item.aiTagged,
        }),
      });
      if (res.ok) {
        setBookmarked(true);
        onBookmark?.(item.id);
      }
    }

    setSaving(false);
  };

  return (
    <div className={`card${showImage ? ' card-with-image' : ''}`}>
      {showImage && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="card-image-link" tabIndex={-1}>
          <div className="card-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnail}
              alt=""
              className="card-image"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          </div>
        </a>
      )}
      <div className="card-body">
        <div className="card-header-row">
          <span className="card-tag" style={{ color: cat?.color }}>{cat?.label ?? item.category}</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {item.aiTagged && <span className="ai-badge">AI {item.aiScore}/10</span>}
            <button
              className={`bookmark-btn${bookmarked ? ' active' : ''}`}
              onClick={handleBookmark}
              title={session ? (bookmarked ? 'Remove bookmark' : 'Save story') : 'Sign in to save'}
              aria-label={bookmarked ? 'Remove bookmark' : 'Save story'}
              style={{ opacity: saving ? 0.5 : 1 }}
            >
              {bookmarked ? '🔖' : '🏷️'}
            </button>
          </div>
        </div>

        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
          <div className="card-title">{item.title}</div>
        </a>

        {item.summary && !showImage && (
          <div className="card-summary">
            {item.summary.slice(0, 120)}{item.summary.length > 120 ? '…' : ''}
          </div>
        )}

        <div className="card-meta">
          {item.sourceType === 'github' && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-2)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4, marginRight: 2 }}>REPO</span>
          )}
          {item.sourceType === 'rss' && item.sourceName.startsWith('arXiv') && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--c-ai)', background: 'rgba(56,189,248,0.1)', padding: '1px 5px', borderRadius: 4, marginRight: 2 }}>PAPER</span>
          )}
          {item.sourceName === 'Papers with Code' && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--c-ai)', background: 'rgba(56,189,248,0.1)', padding: '1px 5px', borderRadius: 4, marginRight: 2 }}>PAPER</span>
          )}
          {domain && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
              alt=""
              width={12}
              height={12}
              className="source-favicon"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <span style={{ fontWeight: item.sourceTier === 1 ? 600 : undefined }}>
            {item.sourceTier === 1 && <span style={{ color: '#f59e0b', marginRight: 2 }}>◆</span>}
            {item.sourceName}
          </span>
          <span>·</span>
          <span>{timeAgo(item.publishedAt)}</span>
          {item.score !== undefined && item.sourceType !== 'github' && <><span>·</span><span>↑ {item.score}</span></>}
          {item.sourceType === 'github' && item.score !== undefined && <><span>·</span><span>⭐ {item.score.toLocaleString()}</span></>}
          {item.commentCount !== undefined && item.commentCount > 0 && (
            <><span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>💬 {item.commentCount}</span></>
          )}
        </div>
      </div>
    </div>
  );
}

export function NewsletterBar() {
  return (
    <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '28px 20px' }}>
      <div className="site-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 500 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>WokPost Weekly</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Top AI stories across 20 topics, every Sunday.</div>
          <NewsletterFormInline />
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>© {new Date().getFullYear()} WokPost · <a href="https://wokspec.org" style={{ color: 'inherit' }}>Wok Specialists</a></span>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="https://github.com/WokSpec" target="_blank" rel="noopener noreferrer">GitHub</a>
          <Link href="/profile" style={{ color: 'inherit' }}>My Feed</Link>
          <a href="/api/rss/ai">RSS (AI)</a>
        </div>
      </div>
    </footer>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
