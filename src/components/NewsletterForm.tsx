'use client';

import { useState } from 'react';

export function NewsletterFormInline() {
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? 'ok' : 'err');
    if (res.ok) (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value = '';
  };

  if (status === 'ok') {
    return (
      <div style={{ fontSize: 13, color: 'var(--green)', padding: '9px 0' }}>
        Subscribed. Check your inbox.
      </div>
    );
  }

  return (
    <form className="newsletter-inline" onSubmit={submit}>
      <input type="email" name="email" required placeholder="you@example.com" autoComplete="email" />
      <button type="submit">Subscribe</button>
      {status === 'err' && (
        <span style={{ color: 'var(--red)', fontSize: 11, alignSelf: 'center' }}>Try again</span>
      )}
    </form>
  );
}
