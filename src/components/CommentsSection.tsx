'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type Comment = { id: string; author_name: string; content: string; created_at: string };

export function CommentsSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill name from session
  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name]);

  useEffect(() => {
    fetch(`/api/comments?post_id=${encodeURIComponent(postId)}`)
      .then(r => r.json() as Promise<{ comments?: Comment[] }>)
      .then(d => setComments(d.comments ?? []));
  }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, author_name: name.trim(), content: content.trim() }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? 'Failed to post comment');
        return;
      }
      const d = await res.json() as Comment;
      setComments(prev => [...prev, d]);
      setContent('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3_600_000);
    if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div style={{ marginTop: 48 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
          textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
          color: 'var(--text-faint)',
        }}>
          Discussion
        </span>
        {comments.length > 0 && (
          <span style={{
            fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
            background: 'var(--surface-raised)', border: '1px solid var(--border)',
            padding: '1px 7px', borderRadius: 999, color: 'var(--text-muted)',
          }}>
            {comments.length}
          </span>
        )}
      </div>

      {/* Comment list */}
      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `hsl(${(c.author_name.charCodeAt(0) * 47) % 360} 55% 40%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  fontFamily: 'var(--font-heading)',
                }}>
                  {c.author_name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)' }}>
                  {c.author_name}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  {timeAgo(c.created_at)}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: 38 }}>
                {c.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div style={{
        background: 'var(--surface-raised)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1.25rem',
      }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
          color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', marginBottom: 14,
        }}>
          {session ? `Commenting as ${session.user?.name ?? 'you'}` : 'Leave a comment'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            required
            maxLength={60}
            readOnly={!!session?.user?.name}
            style={session?.user?.name ? { opacity: 0.7, cursor: 'default' } : undefined}
          />
          <textarea
            className="form-input"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What are your thoughts?"
            required
            minLength={2}
            maxLength={2000}
            rows={4}
            style={{ resize: 'vertical', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ fontSize: '0.78rem', padding: '8px 18px', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
            {error && (
              <span style={{ fontSize: '0.72rem', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                {error}
              </span>
            )}
            {success && (
              <span style={{ fontSize: '0.72rem', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
            Comment posted
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
