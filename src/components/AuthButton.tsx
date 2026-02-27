'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === 'loading') {
    return <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-3)' }} />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn(undefined, { callbackUrl: '/' })}
        style={{
          background: 'var(--accent)',
          color: '#000',
          border: 'none',
          borderRadius: 6,
          padding: '7px 14px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '-0.01em',
        }}
      >
        Sign in
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}
        aria-label="User menu"
      >
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            width={30}
            height={30}
            style={{ borderRadius: '50%', border: '2px solid var(--border)' }}
          />
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000' }}>
            {session.user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'none' }} className="auth-name">
          {session.user?.name?.split(' ')[0]}
        </span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
          {/* Dropdown */}
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50,
            background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10,
            minWidth: 200, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{session.user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{session.user?.email}</div>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '11px 16px', fontSize: 13, color: 'var(--text)', textDecoration: 'none' }}
            >
              🔖 My Bookmarks
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '11px 16px', fontSize: 13, color: 'var(--text)', textDecoration: 'none', borderTop: '1px solid var(--border)' }}
            >
              📌 My Feeds
            </Link>
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
              style={{ width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, color: 'var(--text-3)', background: 'none', border: 'none', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
