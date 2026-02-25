'use client';
import { useState } from 'react';

type Comment = { id: string; author_name: string; content: string; created_at: string };

export function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch(`/api/comments?post_id=${encodeURIComponent(postId)}`);
    const d = await res.json() as { comments?: Comment[] };
    setComments(d.comments ?? []);
    setLoaded(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: postId, author_name: name, content }) });
      if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? 'Failed'); return; }
      const d = await res.json() as Comment;
      setComments(prev => [...prev, d]);
      setContent('');
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        Discussion
      </div>
      {!loaded ? (
        <button onClick={load} style={{ background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-2)', padding: '8px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 3 }}>Load comments</button>
      ) : (
        <>
          {comments.map(c => (
            <div key={c.id} style={{ padding: 16, background: 'var(--bg-2)', border: '1px solid var(--border)', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{c.author_name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{c.content}</div>
            </div>
          ))}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Leave a comment</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required maxLength={60} style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text)', padding: '10px 14px', fontSize: 14, borderRadius: 4, outline: 'none' }} />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What do you think?" required minLength={2} maxLength={2000} rows={4} style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text)', padding: '10px 14px', fontSize: 14, borderRadius: 4, outline: 'none', resize: 'vertical' }} />
            {error && <div style={{ color: 'var(--red)', fontSize: 12 }}>{error}</div>}
            <button type="submit" disabled={submitting} style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '10px 20px', fontSize: 13, fontWeight: 700, borderRadius: 4, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .6 : 1, alignSelf: 'flex-start' }}>
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
