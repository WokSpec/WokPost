'use client';

import { useState } from 'react';

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => (typeof window !== 'undefined' ? window.location.href : '');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const shareX = () => {
    const u = encodeURIComponent(getUrl());
    const t = encodeURIComponent(title);
    window.open(`https://x.com/intent/tweet?text=${t}&url=${u}`, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const shareLinkedIn = () => {
    const u = encodeURIComponent(getUrl());
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${u}&title=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Share</span>
      <button
        onClick={copyLink}
        className="share-action-btn"
        title="Copy link"
        aria-label="Copy link"
      >
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        )}
        <span>{copied ? 'Copied!' : 'Copy link'}</span>
      </button>
      <button onClick={shareX} className="share-action-btn" title="Share on X" aria-label="Share on X">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        <span>X</span>
      </button>
      <button onClick={shareLinkedIn} className="share-action-btn" title="Share on LinkedIn" aria-label="Share on LinkedIn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
        <span>LinkedIn</span>
      </button>
    </div>
  );
}
