'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/feed/types';

const EXTRAS = [
  { id: 'wokspec', label: 'WokSpec Developments', desc: 'Product updates and announcements from WokSpec' },
  { id: 'policy', label: 'Tech Policy Digest', desc: 'Regulation, legislation, and governance covering tech' },
  { id: 'research', label: 'Research Roundup', desc: 'Notable papers and academic findings across all fields' },
];

type Step = 1 | 2 | 3 | 4;

export default function NewsletterPage() {
  const [step, setStep] = useState<Step>(1);
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [extras, setExtras] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleTopic = (id: string) => {
    setTopics(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleExtra = (id: string) => {
    setExtras(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleSubmit = async () => {
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        topics: [...topics],
        wokspec_updates: extras.has('wokspec') ? 1 : 0,
        extras: [...extras],
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setStep(4);
    } else {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setError(d.error ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-3)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            WokPost Digest
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Your news. Your terms.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 480 }}>
            Two summaries per month. Curated from verified, unbiased sources across the topics you choose. No algorithm. No filler.
          </p>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="nl-progress">
              {([1, 2, 3] as Step[]).map(s => (
                <span key={s} className={`nl-progress-dot${step >= s ? ' active' : ''}`} />
              ))}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              Step {step} of 3
            </span>
          </div>
        )}

        {/* Step 1: Topics */}
        {step === 1 && (
          <div className="nl-step fade-in">
            <div>
              <div className="nl-step-header" style={{ marginBottom: 12 }}>Choose your topics</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
                Select the categories that matter to you. We will only send articles from these areas.
              </p>
              <div className="nl-topics-grid">
                {Object.entries(CATEGORIES).map(([id, cat]) => (
                  <button
                    key={id}
                    className={`nl-topic-btn${topics.has(id) ? ' selected' : ''}`}
                    style={{ color: cat.color }}
                    onClick={() => toggleTopic(id)}
                  >
                    <span className="nl-check">
                      {topics.has(id) && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="nl-topic-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {topics.size === 0 ? 'Select at least one topic' : `${topics.size} topic${topics.size !== 1 ? 's' : ''} selected`}
              </span>
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={topics.size === 0}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Extras */}
        {step === 2 && (
          <div className="nl-step fade-in">
            <div>
              <div className="nl-step-header" style={{ marginBottom: 12 }}>Anything else?</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
                Optional additions to your digest. Toggle any that interest you.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {EXTRAS.map(ex => (
                  <button
                    key={ex.id}
                    className={`nl-topic-btn${extras.has(ex.id) ? ' selected' : ''}`}
                    style={{ color: 'var(--text-2)', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
                    onClick={() => toggleExtra(ex.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="nl-check" style={{ flexShrink: 0 }}>
                        {extras.has(ex.id) && (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="3.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="nl-topic-label" style={{ fontSize: 13 }}>{ex.label}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', paddingLeft: 22 }}>{ex.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Email */}
        {step === 3 && (
          <div className="nl-step fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="nl-step-header">Enter your email</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                Two digests per month. No spam. Unsubscribe from any email.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label" htmlFor="nl-email">Email address</label>
                <input
                  id="nl-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {error && <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>}
              <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
                  Your selection: <strong style={{ color: 'var(--text-2)' }}>{topics.size} topic{topics.size !== 1 ? 's' : ''}</strong>
                  {extras.size > 0 && <> + <strong style={{ color: 'var(--text-2)' }}>{extras.size} extra{extras.size !== 1 ? 's' : ''}</strong></>}.
                  You can update preferences anytime from your profile.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting || !email.trim()}
              >
                {submitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '32px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>You are subscribed</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>First digest in the next send window</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/" className="btn btn-ghost" style={{ fontSize: 12 }}>Back to feed</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
