import { NextResponse } from 'next/server';
import { getDB } from '@/lib/cloudflare';

export const dynamic = 'force-dynamic';

// Term blacklist — overly common words that aren't useful as signals
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by',
  'from','is','are','was','were','be','been','being','have','has','had','do',
  'does','did','will','would','could','should','may','might','can','that','this',
  'these','those','it','its','he','she','they','we','you','i','me','him','her',
  'us','them','who','what','which','when','where','how','why','not','no','if',
  'as','up','out','about','into','over','after','more','new','also','just',
  'use','used','using','year','years','time','times','way','ways','says','said',
  'show','shows','report','reports','via','now','one','two','three','first',
  'week','month','day','days','than','then','their','there','here','between',
  'while','through','across','including','following','according','based',
  'making','made','take','takes','get','gets','need','needs','want','wants',
]);

function extractTerms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

interface FeedRow {
  title: string;
  category: string;
  published_at: string;
  ai_tagged: number;
  source_name: string;
}

interface SignalEntry {
  term: string;
  count: number;
  categories: string[];
  sources: string[];
  recentCount: number;
  momentum: number; // recent vs older ratio
  type: 'spike' | 'trending' | 'pattern';
}

// GET /api/eral/signals — analyse recent feed_items for emerging topic signals
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10', 10));
  const hours = Math.min(168, parseInt(searchParams.get('hours') ?? '48', 10));

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const cutoff = new Date(Date.now() - hours * 3600_000).toISOString();
  const recentCutoff = new Date(Date.now() - 12 * 3600_000).toISOString();

  const [recentRows, olderRows] = await Promise.all([
    db.prepare(
      `SELECT title, category, published_at, ai_tagged, source_name
       FROM feed_items
       WHERE fetched_at >= ?1
       ORDER BY fetched_at DESC LIMIT 500`
    ).bind(recentCutoff).all() as Promise<{ results: FeedRow[] }>,
    db.prepare(
      `SELECT title, category, published_at, ai_tagged, source_name
       FROM feed_items
       WHERE fetched_at >= ?1 AND fetched_at < ?2
       ORDER BY fetched_at DESC LIMIT 1000`
    ).bind(cutoff, recentCutoff).all() as Promise<{ results: FeedRow[] }>,
  ]);

  // Frequency maps
  const recent: Map<string, { count: number; cats: Set<string>; sources: Set<string> }> = new Map();
  const older: Map<string, number> = new Map();

  for (const row of recentRows.results) {
    const terms = extractTerms(row.title);
    for (const t of terms) {
      if (!recent.has(t)) recent.set(t, { count: 0, cats: new Set(), sources: new Set() });
      const e = recent.get(t)!;
      e.count++;
      e.cats.add(row.category);
      e.sources.add(row.source_name);
    }
  }
  for (const row of olderRows.results) {
    const terms = extractTerms(row.title);
    for (const t of terms) {
      older.set(t, (older.get(t) ?? 0) + 1);
    }
  }

  // Score signals
  const signals: SignalEntry[] = [];
  const olderTotal = Math.max(1, olderRows.results.length);
  const recentTotal = Math.max(1, recentRows.results.length);

  for (const [term, data] of recent) {
    if (data.count < 2) continue;
    const olderCount = older.get(term) ?? 0;
    // Normalize to per-100-stories
    const recentRate = (data.count / recentTotal) * 100;
    const olderRate = (olderCount / olderTotal) * 100;
    const momentum = olderRate === 0 ? recentRate * 2 : recentRate / olderRate;

    let type: SignalEntry['type'] = 'pattern';
    if (momentum > 3 && data.count >= 3) type = 'spike';
    else if (momentum > 1.5 && data.count >= 4) type = 'trending';

    signals.push({
      term,
      count: data.count,
      categories: Array.from(data.cats),
      sources: Array.from(data.sources).slice(0, 5),
      recentCount: data.count,
      momentum: Math.round(momentum * 10) / 10,
      type,
    });
  }

  // Sort by spike score (momentum × count)
  signals.sort((a, b) => (b.momentum * b.count) - (a.momentum * a.count));

  return NextResponse.json(
    {
      signals: signals.slice(0, limit),
      meta: {
        recentItems: recentRows.results.length,
        olderItems: olderRows.results.length,
        windowHours: hours,
        generatedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}
