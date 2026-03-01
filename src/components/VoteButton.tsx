'use client';

import { useState, useEffect } from 'react';

export function VoteButton({ postId }: { postId: string }) {
  const [count, setCount] = useState(0);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/votes?post_id=${encodeURIComponent(postId)}`)
      .then(r => r.json() as Promise<{ count: number; voted: boolean }>)
      .then(d => { setCount(d.count); setVoted(d.voted); })
      .catch(() => {});
  }, [postId]);

  const handleVote = async () => {
    if (loading) return;
    setLoading(true);
    // Optimistic update
    setVoted(v => !v);
    setCount(c => voted ? c - 1 : c + 1);
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });
      const d = await res.json() as { ok: boolean; voted: boolean; count: number };
      if (d.ok) { setVoted(d.voted); setCount(d.count); }
    } catch {
      // Revert on error
      setVoted(v => !v);
      setCount(c => voted ? c + 1 : c - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={`vote-btn${voted ? ' voted' : ''}`}
      title={voted ? 'Remove upvote' : 'Upvote this story'}
      aria-label={voted ? 'Remove upvote' : 'Upvote this story'}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={voted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
      <span>{count > 0 ? count : 'Upvote'}</span>
    </button>
  );
}
