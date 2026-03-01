import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIES } from '@/lib/feed/types';
import { IcoAI, IcoClimate, IcoHealth, IcoCrypto, IcoScience, IcoBusiness, IcoEthics, IcoPolitics, CATEGORY_ICONS } from '@/components/Icons';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Discover — WokPost',
  description: 'Explore curated topic collections — find the stories that matter most across AI, science, health, business, and more.',
};

const COLLECTIONS = [
  {
    id: 'ai-future',
    title: 'The Future of AI',
    description: 'From interpretability research to open-source releases, the biggest questions in machine intelligence.',
    icon: <IcoAI size={22} />,
    color: '#6366f1',
    category: 'ai',
    queries: ['AI safety', 'LLM', 'machine learning', 'Anthropic', 'OpenAI'],
  },
  {
    id: 'climate-action',
    title: 'Climate & Energy',
    description: 'The transition to clean energy, climate migration, and the technologies reshaping how we power civilization.',
    icon: <IcoClimate size={22} />,
    color: '#10b981',
    category: 'climate',
    queries: ['climate', 'energy transition', 'battery', 'solar', 'carbon'],
  },
  {
    id: 'health-longevity',
    title: 'Health & Longevity',
    description: 'Mental health, longevity science, nutrition research, and the future of medicine.',
    icon: <IcoHealth size={22} />,
    color: '#f43f5e',
    category: 'health',
    queries: ['health', 'longevity', 'mental health', 'GLP-1', 'sleep'],
  },
  {
    id: 'money-markets',
    title: 'Money & Markets',
    description: 'Economics, crypto, venture capital, housing policy, and the forces shaping wealth in the 21st century.',
    icon: <IcoCrypto size={22} />,
    color: '#f59e0b',
    category: 'crypto',
    queries: ['crypto', 'bitcoin', 'economy', 'market', 'fintech'],
  },
  {
    id: 'science-discovery',
    title: 'Science & Discovery',
    description: 'Breakthroughs in materials, space, biology, and physics — the research redefining what is possible.',
    icon: <IcoScience size={22} />,
    color: '#22d3ee',
    category: 'science',
    queries: ['research', 'discovery', 'study', 'scientists', 'physics'],
  },
  {
    id: 'work-future',
    title: 'The Future of Work',
    description: 'Remote work, automation, productivity, organizational design, and what careers will look like.',
    icon: <IcoBusiness size={22} />,
    color: '#8b5cf6',
    category: 'business',
    queries: ['remote work', 'productivity', 'startup', 'automation', 'hiring'],
  },
  {
    id: 'tech-platforms',
    title: 'Tech & Platforms',
    description: 'Big Tech regulation, social media, privacy, and the software eating the world.',
    icon: <IcoEthics size={22} />,
    color: '#3b82f6',
    category: 'tech',
    queries: ['software', 'platform', 'privacy', 'regulation', 'developer'],
  },
  {
    id: 'culture-society',
    title: 'Culture & Society',
    description: 'Books, cities, art, gaming, politics, and the forces shaping how we live together.',
    icon: <IcoPolitics size={22} />,
    color: '#ec4899',
    category: 'culture',
    queries: ['culture', 'society', 'cities', 'inequality', 'politics'],
  },
];

const READING_PATHS = [
  {
    id: 'ai-primer',
    title: 'Understanding AI in 2025',
    steps: [
      { label: 'Start here', title: 'What Large Language Models Actually Are', href: '/editorial/what-is-a-large-language-model' },
      { label: 'Then read', title: 'The Alignment Problem Is Not What You Think', href: '/editorial/the-alignment-problem-is-not-what-you-think' },
      { label: 'Deep dive', title: 'We Keep Building AI We Don\'t Understand', href: '/editorial/we-keep-building-ai-we-dont-understand' },
      { label: 'Context', title: 'The Open-Source AI Arms Race', href: '/editorial/open-source-ai-arms-race' },
    ],
  },
  {
    id: 'modern-work',
    title: 'How Work Is Changing',
    steps: [
      { label: 'Start here', title: 'The Great Unbundling of Work', href: '/editorial/the-great-unbundling-of-work' },
      { label: 'Then read', title: 'Software Is Still Eating the World', href: '/editorial/software-is-still-eating-the-world' },
      { label: 'Deep dive', title: 'The Productivity Trap', href: '/editorial/the-productivity-trap' },
    ],
  },
  {
    id: 'health-crisis',
    title: 'The Hidden Health Crises',
    steps: [
      { label: 'Start here', title: 'The Sleep Debt Crisis Nobody Is Taking Seriously', href: '/editorial/the-sleep-debt-crisis-nobody-is-taking-seriously' },
      { label: 'Then read', title: 'The Loneliness Epidemic', href: '/editorial/the-loneliness-epidemic-hidden-health-crisis' },
      { label: 'Deep dive', title: 'The Attention Economy vs. Your Child', href: '/editorial/the-attention-economy-vs-your-child' },
    ],
  },
];

export default function DiscoverPage() {
  const allCategories = Object.entries(CATEGORIES);

  return (
    <div className="site-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          Explore
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>
          Discover
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: 520, lineHeight: 1.75 }}>
          Browse curated topic collections, follow reading paths through complex subjects, or explore all {allCategories.length} categories.
        </p>
      </div>

      {/* Topic collections */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <span className="section-title">Topic collections</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {COLLECTIONS.map(col => (
            <Link
              key={col.id}
              href={`/${col.category}`}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'var(--surface-raised)', border: `1px solid ${col.color}33`, borderRadius: 14, transition: 'border-color 0.15s, transform 0.15s', cursor: 'pointer' }}
              className="discover-collection-card"
            >
              <div style={{ marginBottom: '0.875rem', color: col.color }}>{col.icon}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 8 }}>
                {col.title}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.65, flex: 1, margin: 0 }}>
                {col.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: '1rem' }}>
                {col.queries.slice(0, 3).map(q => (
                  <span key={q} style={{ fontSize: '0.6rem', padding: '2px 8px', background: `${col.color}15`, border: `1px solid ${col.color}33`, borderRadius: 10, color: col.color, fontFamily: 'var(--font-mono)' }}>
                    {q}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Reading paths */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <span className="section-title">Reading paths</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>curated sequences from our editors</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {READING_PATHS.map(path => (
            <div key={path.id} style={{ padding: '1.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.025em', marginBottom: '1.25rem' }}>
                {path.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {path.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                    {/* Timeline connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 4, flexShrink: 0 }} />
                      {i < path.steps.length - 1 && (
                        <div style={{ width: 1, flex: 1, background: 'var(--border)', margin: '3px 0' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < path.steps.length - 1 ? '1rem' : 0 }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
                        {step.label}
                      </div>
                      <Link href={step.href} style={{ textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, display: 'block' }} className="editorial-link">
                        {step.title}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All categories */}
      <section>
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <span className="section-title">All categories</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{allCategories.length} topics</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {allCategories.map(([key, info]) => (
            <Link
              key={key}
              href={`/${key}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', background: 'var(--surface-raised)', border: `1px solid ${info.color}44`, borderRadius: 10, textDecoration: 'none', transition: 'border-color 0.15s, background 0.15s' }}
              className="category-pill-card"
            >
              {(() => { const Icon = CATEGORY_ICONS[key]; return Icon ? <span style={{ color: info.color }}><Icon size={16} /></span> : null; })()}
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: info.color }}>{info.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
