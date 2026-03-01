import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIES } from '@/lib/feed/types';

export const metadata: Metadata = {
  title: 'About WokPost',
  description: 'WokPost is a curated AI-powered news aggregator covering 20 categories — from AI research to climate science. Built by Wok Specialists.',
};

const TIERS = [
  { name: 'Tier 1 — Top Publications', desc: 'Peer-reviewed journals, established broadsheets, and wire services (Nature, Reuters, WSJ, arXiv).' },
  { name: 'Tier 2 — Quality Indie Media', desc: 'Newsletters, specialist outlets, and reputable industry publications (Ars Technica, The Verge, TechCrunch).' },
  { name: 'Tier 3 — Community Signal', desc: 'High-karma community posts, conference papers, and verified practitioner blogs with strong engagement.' },
];

export default function AboutPage() {
  const categories = Object.values(CATEGORIES);

  return (
    <div className="site-container" style={{ maxWidth: 860, paddingTop: '3rem', paddingBottom: '5rem' }}>

      {/* Hero */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
          About
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
          Signal over noise.
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
          WokPost surfaces the stories that matter from 20 categories, filtered by quality and ranked by relevance — so you spend your time reading, not searching.
        </p>
      </div>

      {/* Mission */}
      <div className="about-section">
        <h2>Our Mission</h2>
        <p>
          The internet has too much content and too little curation. WokPost is a daily reading companion for curious people who want to stay current across AI, science, business, health, policy, and beyond — without doomscrolling or paywalled surprises.
        </p>
        <p>
          We aggregate, score, and surface the top stories each day. AI scoring surfaces high-signal items, but every link goes directly to the original publisher — we never claim authorship and always credit sources.
        </p>
      </div>

      {/* How it works */}
      <div className="about-section">
        <h2>How It Works</h2>
        <div className="about-steps">
          {[
            { n: '01', title: 'Aggregation', body: 'Hundreds of RSS feeds, APIs, and community sources are crawled continuously across all 20 topic categories.' },
            { n: '02', title: 'Quality Scoring', body: 'An AI scoring layer ranks items by engagement signals, source tier, recency, and semantic relevance to the category.' },
            { n: '03', title: 'Deduplication', body: 'Near-duplicate stories are clustered and the best-sourced version surfaces, preventing repetition.' },
            { n: '04', title: 'Delivery', body: 'Results land on the feed in real time. Subscribe to the weekly digest to get the top 5 from each category in your inbox.' },
          ].map(s => (
            <div className="about-step" key={s.n}>
              <div className="about-step-n">{s.n}</div>
              <div>
                <strong>{s.title}</strong>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source tiers */}
      <div className="about-section">
        <h2>Source Tiers</h2>
        <p>Not all sources are equal. WokPost weights stories by the tier of their origin:</p>
        <div className="about-tiers">
          {TIERS.map(t => (
            <div className="about-tier" key={t.name}>
              <strong>{t.name}</strong>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="about-section">
        <h2>Categories</h2>
        <p style={{ marginBottom: '1.25rem' }}>We cover {categories.length} categories, updated throughout the day:</p>
        <div className="about-cats">
          {categories.map(c => (
            <div className="about-cat" key={c.label} style={{ borderColor: c.color + '44', background: c.accent }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c.color, marginRight: 7, flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: c.color }}>{c.label}</strong>
                <p>{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Built by */}
      <div className="about-section">
        <h2>Built by Wok Specialists</h2>
        <p>
          WokPost is a project by <a href="https://wokspec.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Wok Specialists</a> — a small software team building tools for the curious and productive.
        </p>
        <p>
          Questions, feedback, or source suggestions? Reach us at{' '}
          <a href="mailto:hello@wokspec.org" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>hello@wokspec.org</a>.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">Explore the feed</Link>
          <Link href="/newsletter" className="btn btn-secondary">Subscribe to digest</Link>
          <Link href="/privacy" className="btn btn-secondary">Privacy policy</Link>
        </div>
      </div>
    </div>
  );
}
