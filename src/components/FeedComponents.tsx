import Link from 'next/link';
import { CATEGORIES } from '@/lib/feed/types';
import type { FeedItem } from '@/lib/feed/types';
import { AdSlot } from './AdSlot';
import { NewsletterFormInline } from './NewsletterForm';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">Wok<span>Post</span></Link>
        <nav style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-2)' }}>
          <Link href="/" style={{ color: 'inherit' }}>Feed</Link>
          <Link href="/ai" style={{ color: 'var(--c-ai)', fontWeight: 600 }}>AI</Link>
          <a href="https://wokspec.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>WokSpec ↗</a>
        </nav>
      </div>
    </header>
  );
}

export function CategoryStrip({ active }: { active?: string }) {
  return (
    <div className="cat-strip">
      {Object.entries(CATEGORIES).map(([id, cat]) => (
        <Link key={id} href={`/${id}`} className={`cat-pill${active === id ? ' active' : ''}`} style={{ color: cat.color }}>
          {cat.label}
        </Link>
      ))}
    </div>
  );
}

export function FeedCard({ item, index }: { item: FeedItem; index: number }) {
  const cat = CATEGORIES[item.category];
  if ((index + 1) % 8 === 0) return <AdSlot variant="native" />;

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="card-tag" style={{ color: cat?.color }}>{cat?.label ?? item.category}</span>
        {item.aiTagged && <span className="ai-badge">AI {item.aiScore}/10</span>}
      </div>
      <div className="card-title">{item.title}</div>
      {item.summary && (
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
          {item.summary.slice(0, 120)}{item.summary.length > 120 ? '…' : ''}
        </div>
      )}
      <div className="card-meta">
        <span>{item.sourceName}</span>
        <span>·</span>
        <span>{timeAgo(item.publishedAt)}</span>
        {item.score !== undefined && <><span>·</span><span>↑ {item.score}</span></>}
      </div>
    </a>
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
