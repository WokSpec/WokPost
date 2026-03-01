'use client';

import { useState, useEffect } from 'react';
import { IcoX } from './Icons';

const SHORTCUTS = [
  { key: '?', desc: 'Toggle this help overlay' },
  { key: 'j / ↓', desc: 'Move to next story' },
  { key: 'k / ↑', desc: 'Move to previous story' },
  { key: 'Enter / o', desc: 'Open selected story' },
  { key: '/', desc: 'Focus search bar' },
  { key: 'Esc', desc: 'Clear search / close overlay' },
  { key: 'b', desc: 'Bookmark selected story' },
  { key: 'r', desc: 'Refresh feed' },
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '?') { e.preventDefault(); setOpen(v => !v); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) {
    return (
      <button
        className="kbd-help-trigger"
        onClick={() => setOpen(true)}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', lineHeight: 1 }}>?</span>
      </button>
    );
  }

  return (
    <>
      <div className="kbd-overlay-backdrop" onClick={() => setOpen(false)} />
      <div className="kbd-overlay" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <div className="kbd-overlay-header">
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em' }}>Keyboard shortcuts</span>
          <button className="kbd-close" onClick={() => setOpen(false)} aria-label="Close"><IcoX size={14} /></button>
        </div>
        <div className="kbd-list">
          {SHORTCUTS.map(s => (
            <div className="kbd-row" key={s.key}>
              <kbd className="kbd">{s.key}</kbd>
              <span className="kbd-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
