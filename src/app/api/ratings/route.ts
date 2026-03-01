import { NextResponse } from 'next/server';
import { getDB } from '@/lib/cloudflare';
import { createHash } from 'crypto';

function ipHash(req: Request): string {
  const ip = req.headers.get('cf-connecting-ip') ??
             req.headers.get('x-forwarded-for')?.split(',')[0] ??
             'unknown';
  return createHash('sha256').update(ip + process.env.RATE_SALT ?? 'wokpost-ratings').digest('hex').slice(0, 16);
}

// GET /api/ratings?post_id=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get('post_id');
  if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const db = await getDB();
  if (!db) return NextResponse.json({ avg: 0, count: 0, distribution: {} });

  try {
    const [agg, dist] = await Promise.all([
      db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM post_ratings WHERE post_id = ?1')
        .bind(post_id).first<{ avg: number | null; count: number }>(),
      db.prepare('SELECT rating, COUNT(*) as n FROM post_ratings WHERE post_id = ?1 GROUP BY rating')
        .bind(post_id).all<{ rating: number; n: number }>(),
    ]);

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of dist.results ?? []) distribution[row.rating] = row.n;

    const hash = ipHash(req);
    const myRating = await db.prepare('SELECT rating FROM post_ratings WHERE post_id = ?1 AND ip_hash = ?2')
      .bind(post_id, hash).first<{ rating: number }>();

    return NextResponse.json({
      avg: agg?.avg ? Math.round(agg.avg * 10) / 10 : 0,
      count: agg?.count ?? 0,
      distribution,
      myRating: myRating?.rating ?? null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ avg: 0, count: 0, distribution: {} });
  }
}

// POST /api/ratings  { post_id, post_type, rating }
export async function POST(req: Request) {
  let body: { post_id?: string; post_type?: string; rating?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { post_id, post_type = 'editorial', rating } = body;
  if (!post_id || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'post_id and rating (1–5) required' }, { status: 400 });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

  const hash = ipHash(req);
  const id = `${post_id}-${hash}`;

  try {
    await db.prepare(`
      INSERT INTO post_ratings (id, post_id, post_type, rating, ip_hash)
      VALUES (?1, ?2, ?3, ?4, ?5)
      ON CONFLICT(post_id, ip_hash) DO UPDATE SET rating = excluded.rating, created_at = datetime('now')
    `).bind(id, post_id, post_type, rating, hash).run();

    const agg = await db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM post_ratings WHERE post_id = ?1')
      .bind(post_id).first<{ avg: number; count: number }>();

    return NextResponse.json({
      ok: true,
      avg: agg?.avg ? Math.round(agg.avg * 10) / 10 : rating,
      count: agg?.count ?? 1,
      myRating: rating,
    });
  } catch (err) {
    console.error('[ratings] POST failed:', err);
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
  }
}
