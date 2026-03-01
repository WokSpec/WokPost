import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <div className="site-container" style={{ paddingTop: '8rem', paddingBottom: '8rem', textAlign: 'center', maxWidth: 560 }}>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1 }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
        Page not found
      </h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
        This page doesn&apos;t exist or may have been removed. Try browsing topics below, or head back to the homepage.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/"
          style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-heading)' }}
        >
          Back to homepage
        </Link>
        <Link
          href="/editorial"
          style={{ padding: '10px 24px', background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font-heading)' }}
        >
          Browse Editorial
        </Link>
      </div>

      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginBottom: '1rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Popular Topics
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['ai', 'crypto', 'science', 'tech', 'markets', 'health'].map(cat => (
            <Link
              key={cat}
              href={`/${cat}`}
              style={{ padding: '6px 14px', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
