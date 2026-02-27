'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/feed/types';
import type { FeedItem } from '@/lib/feed/types';
import { NewsletterFormInline } from './NewsletterForm';
import { AuthButton } from './AuthButton';

/* ── SVG Icons ──────────────────────────────────────────────────────── */
export const IconBookmark = ({ filled }: { filled?: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconShare = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

export const IconRefresh = ({ spinning }: { spinning?: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={spinning ? 'spin' : undefined}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Header ─────────────────────────────────────────────────────────── */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo" aria-label="WokPost home">
          WokPost
          <span className="site-logo-dot" aria-hidden="true" />
        </Link>
        <nav className="header-nav">
          <Link href="/" className="nav-link">Feed</Link>
          <Link href="/newsletter" className="nav-link" data-hide-mobile="">Newsletter</Link>
          <a
            href="https://wokspec.org"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            data-hide-mobile=""
          >
            WokSpec
          </a>
        </nav>
        <div className="header-actions">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

/* ── Category Strip ──────────────────────────────────────────────────── */
export function CategoryStrip({ active }: { active?: string }) {
  return (
    <div className="cat-strip" role="navigation" aria-label="Browse categories">
      <Link
        href="/"
        className={`cat-pill${!active ? ' active' : ''}`}
        style={{ '--cat-color': 'var(--text-muted)' } as React.CSSProperties}
      >
        All
      </Link>
      {Object.entries(CATEGORIES).map(([id, cat]) => (
        <Link
          key={id}
          href={`/${id}`}
          className={`cat-pill${active === id ? ' active' : ''}`}
          style={{ '--cat-color': cat.color } as React.CSSProperties}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}

/* ── Feed Card ───────────────────────────────────────────────────────── */
export function FeedCard({
  item,
  bookmarked: initialBookmarked,
  onBookmark,
}: {
  item: FeedItem;
  index?: number;
  bookmarked?: boolean;
  onBookmark?: (id: string) => void;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);
  const [bookmarked, setBookmarked] = useState(!!initialBookmarked);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);

  const cat = CATEGORIES[item.category];
  const showImage = !!(item.thumbnail && !imgFailed);
  const domain = (() => {
    try { return new URL(item.url).hostname.replace(/^www\./, ''); }
    catch { return ''; }
  })();
  const isRepo = item.contentType === 'repo';
  const isPaper = item.contentType === 'paper';
  const internalHref = `/post/${encodeURIComponent(item.id)}`;
  const readingTime = isRepo ? null : Math.max(1, Math.ceil((item.summary?.length ?? 0) / 200 + item.title.length / 100));
  const catColor = cat?.color ?? 'var(--accent)';

  // Whole-card click: navigate to post page
  const handleCardClick = useCallback(() => {
    router.push(internalHref);
  }, [router, internalHref]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (saving) return;
    setSaving(true);
    if (bookmarked) {
      const res = await fetch(`/api/bookmarks?item_id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      if (res.ok) { setBookmarked(false); onBookmark?.(item.id); }
    } else {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id, item_title: item.title, item_url: item.url,
          item_category: item.category, item_source: item.sourceName,
          item_source_tier: item.sourceTier, item_thumbnail: item.thumbnail,
          item_ai_score: item.aiScore, item_ai_tagged: item.aiTagged,
        }),
      });
      if (res.ok) { setBookmarked(true); onBookmark?.(item.id); }
    }
    setSaving(false);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url: item.url });
      } else {
        await navigator.clipboard.writeText(item.url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch { /* user cancelled */ }
  };

  return (
    <div
      className={`card${showImage ? ' card-with-image' : ''}`}
      style={{ '--card-color': catColor, cursor: 'pointer' } as React.CSSProperties}
      onClick={handleCardClick}
      role="article"
    >
      {showImage && (
        <Link href={internalHref} className="card-image-link" tabIndex={-1} onClick={e => e.stopPropagation()}>
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
        </Link>
      )}
      <div className="card-body">
        <div className="card-header-row">
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="card-tag" style={{ color: catColor }}>{cat?.label ?? item.category}</span>
            {item.sourceTier === 1 && <span className="tier1-badge">T1</span>}
            {isRepo && <span className="source-type-badge source-type-repo">Repo</span>}
            {isPaper && <span className="source-type-badge source-type-paper">Paper</span>}
          </div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
            {item.aiTagged && (
              <span className="ai-badge">AI {item.aiScore}/10</span>
            )}
            <button
              className="share-btn"
              onClick={handleShare}
              title={shared ? 'Copied' : 'Share'}
              aria-label="Share story"
            >
              {shared
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                : <IconShare />}
            </button>
            <button
              className={`bookmark-btn${bookmarked ? ' active' : ''}`}
              onClick={handleBookmark}
              title={session ? (bookmarked ? 'Remove bookmark' : 'Save story') : 'Sign in to save'}
              aria-label={bookmarked ? 'Remove bookmark' : 'Save story'}
              style={{ opacity: saving ? 0.4 : undefined }}
            >
              <IconBookmark filled={bookmarked} />
            </button>
          </div>
        </div>

        <Link href={internalHref} style={{ display: 'block' }} onClick={e => e.stopPropagation()}>
          <div className="card-title">{item.title}</div>
        </Link>

        {item.summary && !showImage && (
          <div className="card-summary">
            {item.summary.slice(0, 120)}{item.summary.length > 120 ? '\u2026' : ''}
          </div>
        )}

        <div className="card-meta">
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
          <span style={{ fontWeight: item.sourceTier === 1 ? 600 : undefined, color: item.sourceTier === 1 ? 'var(--text-muted)' : undefined }}>
            {item.sourceName}
          </span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span>{timeAgo(item.publishedAt)}</span>
          {readingTime && <span className="reading-time">{readingTime}m read</span>}
          {isRepo && item.repoLanguage && <span className="reading-time">{item.repoLanguage}</span>}
          {item.score !== undefined && !isRepo && (
            <><span style={{ color: 'var(--border-strong)' }}>·</span><span>{item.score} pts</span></>
          )}
          {isRepo && item.score !== undefined && (
            <><span style={{ color: 'var(--border-strong)' }}>·</span><span>{item.score.toLocaleString()} stars</span></>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Newsletter Bar ──────────────────────────────────────────────────── */
export function NewsletterBar() {
  return (
    <section className="newsletter-bar">
      <div className="site-container">
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              WokPost Digest
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              Stay in the loop
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 320 }}>
              Two summaries a month, curated from verified sources. No spam.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <NewsletterFormInline />
            <Link href="/newsletter" style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Customize topics first
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Site Footer ─────────────────────────────────────────────────────── */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-grid">
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', marginBottom: 4 }}>
              WokPost
            </div>
            <p className="footer-brand-desc">
              Open source, unbiased news. No algorithms deciding your feed. No sponsored content.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Read</div>
            <Link href="/" className="footer-link">All Stories</Link>
            <Link href="/ai" className="footer-link">AI &amp; Research</Link>
            <Link href="/science" className="footer-link">Science</Link>
            <Link href="/business" className="footer-link">Business</Link>
          </div>
          <div>
            <div className="footer-col-title">Account</div>
            <Link href="/newsletter" className="footer-link">Newsletter</Link>
            <Link href="/profile" className="footer-link">Profile</Link>
            <Link href="/profile#bookmarks" className="footer-link">Bookmarks</Link>
          </div>
          <div>
            <div className="footer-col-title">Project</div>
            <a href="https://github.com/WokSpec/WokPost" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            <a href="/api/feed?format=rss" className="footer-link">RSS Feed</a>
            <a href="https://wokspec.org" target="_blank" rel="noopener noreferrer" className="footer-link">WokSpec</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-bottom-text">
            &copy; {new Date().getFullYear()} WokPost — Open source, unbiased.
          </span>
          <span className="footer-bottom-text" style={{ color: 'var(--text-faint)' }}>
            Built by <a href="https://wokspec.org" style={{ color: 'var(--text-faint)' }} target="_blank" rel="noopener noreferrer">Wok Specialists</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ── Utility ─────────────────────────────────────────────────────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
