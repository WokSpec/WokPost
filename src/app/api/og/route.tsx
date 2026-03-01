import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') ?? 'WokPost').slice(0, 120);
  const category = searchParams.get('category') ?? '';
  const source = searchParams.get('source') ?? '';
  const score = searchParams.get('score') ?? '';

  // Category color map (subset — edge runtime can't import full CATEGORIES)
  const COLOR_MAP: Record<string, string> = {
    ai: '#38bdf8', business: '#4ade80', sports: '#fb923c', science: '#a78bfa',
    health: '#f472b6', nutrition: '#86efac', farming: '#fde047',
    entertainment: '#f87171', education: '#67e8f9', law: '#cbd5e1',
    gaming: '#c084fc', space: '#60a5fa', art: '#fb7185', robotics: '#34d399',
    climate: '#6ee7b7', cybersecurity: '#fca5a5', crypto: '#fbbf24',
    politics: '#94a3b8', energy: '#facc15', ethics: '#e879f9',
  };
  const accent = COLOR_MAP[category] ?? '#6366f1';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d0d0d',
          padding: '52px 60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          }}
        />

        {/* WokPost brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto' }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: '#0d0d0d' }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>WokPost</span>
        </div>

        {/* Category pill */}
        {category && (
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <div style={{ background: `${accent}22`, border: `1px solid ${accent}55`, borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 700, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {category.replace(/-/g, ' ')}
            </div>
          </div>
        )}

        {/* Title */}
        <div style={{ fontSize: title.length > 80 ? 32 : title.length > 50 ? 38 : 46, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.04em', marginBottom: 24, maxWidth: 860 }}>
          {title}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {source && (
            <span style={{ fontSize: 15, color: '#888' }}>{source}</span>
          )}
          {score && (
            <span style={{ fontSize: 15, color: '#888' }}>↑ {score} pts</span>
          )}
          <div style={{ marginLeft: 'auto', width: 40, height: 2, background: accent, borderRadius: 2 }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
