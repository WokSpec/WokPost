'use client';
import { useState } from 'react';

interface Props {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => { /* ignore */ });
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&via=WokSpec`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        title="Share on X"
        style={{ fontSize: 12, color: 'var(--text-3)', padding: '2px 6px', border: '1px solid var(--border-2)', borderRadius: 3, lineHeight: 1.5, transition: 'color .12s, border-color .12s', textDecoration: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#1d9bf0'; e.currentTarget.style.borderColor = '#1d9bf0'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border-2)'; }}
      >𝕏</a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        title="Share on LinkedIn"
        style={{ fontSize: 11, color: 'var(--text-3)', padding: '2px 6px', border: '1px solid var(--border-2)', borderRadius: 3, lineHeight: 1.5, transition: 'color .12s, border-color .12s', textDecoration: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#0a66c2'; e.currentTarget.style.borderColor = '#0a66c2'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border-2)'; }}
      >in</a>
      <button
        onClick={copy}
        title="Copy link"
        style={{ fontSize: 11, color: copied ? 'var(--accent)' : 'var(--text-3)', padding: '2px 6px', border: `1px solid ${copied ? 'var(--accent)' : 'var(--border-2)'}`, borderRadius: 3, lineHeight: 1.5, background: 'transparent', cursor: 'pointer', transition: 'all .12s' }}
      >{copied ? '✓ Copied' : '⧉ Copy'}</button>
    </div>
  );
}
