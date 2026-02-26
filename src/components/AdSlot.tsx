'use client';
import { useState } from 'react';

export function AdSlot({ variant }: { variant: 'leaderboard' | 'rectangle' | 'sticky' | 'native' }) {
  const [dismissed, setDismissed] = useState(false);

  if (variant === 'native') {
    return (
      <div className="card" style={{ background: 'var(--bg-3)' }}>
        <span className="sponsored-badge">Sponsored</span>
        <div className="card-title" style={{ fontSize: 14 }}>
          {/* AdSense or house ad placeholder */}
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-format="fluid"
            data-ad-layout="in-article"
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID ?? ''}
            data-ad-slot="native-feed"
          />
        </div>
      </div>
    );
  }

  if (variant === 'leaderboard') {
    return (
      <div className="ad-leaderboard">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: 90 }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID ?? ''}
          data-ad-slot="leaderboard"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <span style={{ color: 'var(--text-3)', fontSize: 11 }}>Advertisement</span>
      </div>
    );
  }

  if (variant === 'rectangle') {
    return (
      <div className="ad-rectangle">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: 250 }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID ?? ''}
          data-ad-slot="sidebar-rect"
          data-ad-format="auto"
        />
      </div>
    );
  }

  // sticky mobile
  if (dismissed) return null;
  return (
    <div className="ad-sticky-mobile">
      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Sponsored</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: 320, height: 50 }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID ?? ''}
        data-ad-slot="mobile-sticky"
      />
      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
        aria-label="Dismiss ad"
      >×</button>
    </div>
  );
}
