'use client';

export default function TrendingError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>
        Something went wrong
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        {error.message}
      </p>
      {error.digest && (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          digest: {error.digest}
        </p>
      )}
    </div>
  );
}
