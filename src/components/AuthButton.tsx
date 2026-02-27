'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (status === 'loading') return <span style={{ width: 28, height: 28, display: 'inline-block' }} />;

  if (!session) {
    return (
      <Link href="/login" className="nav-link" style={{ border: '1px solid var(--border-2)', padding: '4px 10px', borderRadius: 2, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
        Sign in
      </Link>
    );
  }

  const initials = session.user?.name
    ? session.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : session.user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-avatar" onClick={() => setOpen(v => !v)} aria-label="Account menu" aria-expanded={open}>
        {session.user?.image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={session.user.image} alt="" width={28} height={28} style={{ display: 'block' }} />
          : initials}
      </button>
      {open && (
        <div className="dropdown fade-in">
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
              {session.user?.name ?? 'User'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, letterSpacing: '0.02em' }}>
              {session.user?.email}
            </div>
          </div>
          <Link href="/profile" className="dropdown-item" onClick={() => setOpen(false)}>Profile &amp; Feeds</Link>
          <Link href="/profile#bookmarks" className="dropdown-item" onClick={() => setOpen(false)}>Bookmarks</Link>
          <Link href="/newsletter" className="dropdown-item" onClick={() => setOpen(false)}>Newsletter Prefs</Link>
          <button className="dropdown-item danger" onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
        </div>
      )}
    </div>
  );
}
