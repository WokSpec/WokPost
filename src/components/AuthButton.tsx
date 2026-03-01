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

  if (status === 'loading') {
    return <span style={{ width: 28, height: 28, display: 'inline-block' }} />;
  }

  if (!session) {
    return (
      <Link href="/login" className="sign-in-btn">
        Sign in
      </Link>
    );
  }

  const initials = session.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : (session.user?.email?.[0]?.toUpperCase() ?? 'U');

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-avatar"
        onClick={() => setOpen(v => !v)}
        aria-label="Account menu"
        aria-expanded={open}
      >
        {session.user?.image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={session.user.image} alt="" width={28} height={28} />
          : initials}
      </button>
      {open && (
        <div className="dropdown">
          <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)', lineHeight: 1.3 }}>
              {session.user?.name ?? 'Account'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              {session.user?.email}
            </div>
          </div>
          <Link href="/profile" className="dropdown-item" onClick={() => setOpen(false)}>
            Profile &amp; Feeds
          </Link>
          <Link href="/profile#bookmarks" className="dropdown-item" onClick={() => setOpen(false)}>
            Bookmarks
          </Link>
          <Link href="/write" className="dropdown-item" onClick={() => setOpen(false)}>
            Write a post
          </Link>
          <Link href="/newsletter" className="dropdown-item" onClick={() => setOpen(false)}>
            Newsletter Prefs
          </Link>
          <button
            className="dropdown-item danger"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
