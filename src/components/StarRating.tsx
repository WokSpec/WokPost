'use client';
import { useState, useEffect, useCallback } from 'react';

interface RatingData {
  avg: number;
  count: number;
  distribution: Record<number, number>;
  myRating: number | null;
}

interface StarRatingProps {
  postId: string;
  postType?: string;
  compact?: boolean;
}

export function StarRating({ postId, postType = 'editorial', compact = false }: StarRatingProps) {
  const [data, setData] = useState<RatingData | null>(null);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/ratings?post_id=${encodeURIComponent(postId)}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, [postId]);

  const submitRating = useCallback(async (value: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, post_type: postType, rating: value }),
      });
      const updated = await res.json();
      setData(prev => ({ ...prev!, ...updated }));
      setSubmitted(true);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [postId, postType, loading]);

  const active = hover || data?.myRating || 0;

  if (compact) {
    return (
      <span className="star-rating-compact" title={data ? `${data.avg}/5 from ${data.count} ratings` : 'Rate this'}>
        {[1,2,3,4,5].map(s => (
          <svg key={s} viewBox="0 0 16 16" width="12" height="12" style={{ fill: s <= (data?.avg ?? 0) ? '#f59e0b' : 'var(--border)', display: 'inline-block' }}>
            <path d="M8 1l1.9 3.9L14 5.8l-3 2.9.7 4.1L8 10.6l-3.7 2.2.7-4.1-3-2.9 4.1-.9z"/>
          </svg>
        ))}
        {data && data.count > 0 && (
          <span style={{ marginLeft: 4, fontSize: '0.7rem', color: 'var(--text-faint)' }}>{data.avg} ({data.count})</span>
        )}
      </span>
    );
  }

  return (
    <div className="star-rating-block">
      <div className="star-rating-label">
        {submitted || data?.myRating
          ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Your rating: {data?.myRating ?? '–'}/5</span>
          : <span>Rate this article</span>
        }
      </div>

      <div className="star-rating-stars"
        onMouseLeave={() => setHover(0)}
        aria-label="Rate this article"
        role="group"
      >
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            className={`star-btn ${s <= active ? 'star-active' : ''}`}
            onMouseEnter={() => !submitted && setHover(s)}
            onClick={() => submitRating(s)}
            disabled={loading}
            aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="M12 2l2.9 5.9L22 8.7l-5 4.9 1.2 6.9L12 17.3l-6.2 3.2 1.2-6.9-5-4.9 7.1-0.8z"/>
            </svg>
          </button>
        ))}
      </div>

      {data && data.count > 0 && (
        <div className="star-rating-summary">
          <span className="star-rating-avg">{data.avg}</span>
          <span className="star-rating-count">/ 5 &middot; {data.count} {data.count === 1 ? 'rating' : 'ratings'}</span>
          <div className="star-dist">
            {[5,4,3,2,1].map(s => {
              const n = data.distribution[s] ?? 0;
              const pct = data.count > 0 ? Math.round((n / data.count) * 100) : 0;
              return (
                <div key={s} className="star-dist-row">
                  <span className="star-dist-label">{s}</span>
                  <div className="star-dist-bar-bg">
                    <div className="star-dist-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="star-dist-pct">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
