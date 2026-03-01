'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/feed/types';
import type { FeedItem } from '@/lib/feed/types';
import { NewsletterFormInline } from './NewsletterForm';
import { AuthButton } from './AuthButton';
import { useToast } from './ToastProvider';
import { VoteButton } from './VoteButton';
import { CATEGORY_ICONS, IcoChevronLeft, IcoChevronRight } from './Icons';
import { ThemeToggle } from './ThemeToggle';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo" aria-label="WokPost home">
          WokPost
          <span className="site-logo-dot" aria-hidden="true" />
        </Link>
        <nav className="header-nav">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/editorial" className="nav-link" data-hide-mobile="">Editorial</Link>
          <Link href="/trending" className="nav-link" data-hide-mobile="">Trending</Link>
          <Link href="/discover" className="nav-link" data-hide-mobile="">Discover</Link>
          <Link href="/newsletter" className="nav-link" data-hide-mobile="">Newsletter</Link>
        </nav>
        <div className="header-actions">
          <Link href="/search" className="header-search-btn" aria-label="Search">
            <IconSearch />
          </Link>
          <ThemeToggle />
          <button
            className="header-search-btn mobile-menu-btn"
            aria-label="Open menu"
            onClick={() => setMobileOpen(o => !o)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
          <AuthButton />
        </div>
      </div>
      {mobileOpen && (
        <div className="mobile-menu" onClick={() => setMobileOpen(false)}>
          <Link href="/" className="mobile-menu-link">Home</Link>
          <Link href="/editorial" className="mobile-menu-link">Editorial</Link>
          <Link href="/trending" className="mobile-menu-link">Trending</Link>
          <Link href="/discover" className="mobile-menu-link">Discover</Link>
          <Link href="/bookmarks" className="mobile-menu-link">Bookmarks</Link>
          <Link href="/newsletter" className="mobile-menu-link">Newsletter</Link>
          <Link href="/stats" className="mobile-menu-link">Stats</Link>
          <Link href="/search" className="mobile-menu-link">Search</Link>
        </div>
      )}
    </header>
  );
}

/* ── Category Strip ──────────────────────────────────────────────────── */
export function CategoryStrip({ active, counts }: { active?: string; counts?: Record<string, number> }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };

  const cats = Object.entries(CATEGORIES);

  return (
    <div className="cat-bar" role="navigation" aria-label="Browse categories">
      {/* Scroll left */}
      {canLeft && (
        <button className="cat-scroll-btn cat-scroll-left" onClick={() => scroll(-1)} aria-label="Scroll left">
          <IcoChevronLeft size={14} />
        </button>
      )}

      <div className="cat-strip" ref={scrollRef}>
        {/* All */}
        <Link
          href="/"
          className={`cat-pill${!active ? ' active' : ''}`}
          style={{ '--cat-color': 'var(--text-muted)' } as React.CSSProperties}
        >
          <span className="cat-pill-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </span>
          <span className="cat-pill-label">All</span>
          {counts && (
            <span className="cat-pill-count">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
          )}
        </Link>

        {cats.map(([id, cat]) => {
          const Icon = CATEGORY_ICONS[id];
          const count = counts?.[id];
          return (
            <Link
              key={id}
              href={`/${id}`}
              className={`cat-pill${active === id ? ' active' : ''}`}
              style={{ '--cat-color': cat.color } as React.CSSProperties}
            >
              {Icon && (
                <span className="cat-pill-icon">
                  <Icon size={13} />
                </span>
              )}
              <span className="cat-pill-label">{cat.label}</span>
              {count !== undefined && count > 0 && (
                <span className="cat-pill-count">{count}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Scroll right */}
      {canRight && (
        <button className="cat-scroll-btn cat-scroll-right" onClick={() => scroll(1)} aria-label="Scroll right">
          <IcoChevronRight size={14} />
        </button>
      )}
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
  const { toast } = useToast();
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
  const isEditorial = item.contentType === 'editorial';
  // Editorial posts route to /editorial/[slug], everything else to /post/[id]
  const internalHref = isEditorial && item.editorialSlug
    ? `/editorial/${item.editorialSlug}`
    : `/post/${encodeURIComponent(item.id)}`;
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
      if (res.ok) { setBookmarked(false); onBookmark?.(item.id); toast('Bookmark removed', 'info'); }
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
      if (res.ok) { setBookmarked(true); onBookmark?.(item.id); toast('Bookmarked!'); }
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
        toast('Link copied!');
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
            {item.sourceTier === 1 && !isEditorial && <span className="tier1-badge">T1</span>}
            {isRepo && <span className="source-type-badge source-type-repo">Repo</span>}
            {isPaper && <span className="source-type-badge source-type-paper">Paper</span>}
            {isEditorial && <span className="source-type-badge source-type-editorial">Editorial</span>}
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

        {item.summary && (
          <div className="card-summary">
            {item.summary.slice(0, showImage ? 100 : 160)}{item.summary.length > (showImage ? 100 : 160) ? '\u2026' : ''}
          </div>
        )}

        {/* Editorial author pill */}
        {isEditorial && item.authorName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            {item.authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.authorAvatar} alt="" width={16} height={16} style={{ borderRadius: '50%', border: '1px solid var(--border)' }} />
            ) : (
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: catColor + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 800, color: catColor }}>
                {item.authorName.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.authorName}</span>
          </div>
        )}

        <div className="card-meta">
          {!isEditorial && domain && (
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
          {isEditorial ? (
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>WokPost</span>
          ) : (
            <span style={{ fontWeight: item.sourceTier === 1 ? 600 : undefined, color: item.sourceTier === 1 ? 'var(--text-muted)' : undefined }}>
              {item.sourceName}
            </span>
          )}
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span><time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time></span>
          {readingTime && <span className="reading-time">{readingTime}m read</span>}
          {isRepo && item.repoLanguage && <span className="reading-time">{item.repoLanguage}</span>}
          {item.score !== undefined && !isRepo && !isEditorial && (
            <><span style={{ color: 'var(--border-strong)' }}>·</span><span>{item.score} pts</span></>
          )}
          {isRepo && item.score !== undefined && (
            <><span style={{ color: 'var(--border-strong)' }}>·</span><span>{item.score.toLocaleString()} stars</span></>
          )}
          {item.commentCount !== undefined && item.commentCount > 0 && (
            <><span style={{ color: 'var(--border-strong)' }}>·</span><span>{item.commentCount} comments</span></>
          )}
        </div>
        {isEditorial && (
          <div style={{ marginTop: 8 }} onClick={e => e.stopPropagation()}>
            <VoteButton postId={item.id} />
          </div>
        )}
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
              Workflow insights, delivered
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 320 }}>
              Curated tips, tools, and tutorials for builders — twice a month, no spam.
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
              Workflow insights for builders. Curated tips, tools, and tutorials for indie developers, creators, and businesses.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Read</div>
            <Link href="/" className="footer-link">All Stories</Link>
            <Link href="/editorial" className="footer-link">Editorial</Link>
            <Link href="/trending" className="footer-link">Trending</Link>
            <Link href="/ai" className="footer-link">AI &amp; Research</Link>
            <Link href="/science" className="footer-link">Science</Link>
            <Link href="/business" className="footer-link">Business</Link>
          </div>
          <div>
            <div className="footer-col-title">Explore</div>
            <Link href="/discover" className="footer-link">Discover</Link>
            <Link href="/stats" className="footer-link">Stats</Link>
            <Link href="/newsletter" className="footer-link">Newsletter</Link>
            <Link href="/search" className="footer-link">Search</Link>
            <Link href="/author/eral" className="footer-link">Author: Eral</Link>
            <Link href="/profile" className="footer-link">Profile</Link>
            <Link href="/bookmarks" className="footer-link">Bookmarks</Link>
          </div>
          <div>
            <div className="footer-col-title">Project</div>
            <Link href="/about" className="footer-link">About</Link>
            <Link href="/privacy" className="footer-link">Privacy</Link>
            <a href="https://github.com/WokSpec/WokPost" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            <a href="/api/feed?format=rss" className="footer-link">RSS Feed</a>
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
