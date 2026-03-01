import { NextResponse } from 'next/server';
import { getDB } from '@/lib/cloudflare';


function hashIP(ip: string): string {
  // Simple non-cryptographic hash sufficient for rate-limiting / dedup
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = Math.imul(31, h) + ip.charCodeAt(i) | 0;
  }
  return (h >>> 0).toString(36);
}

function getClientIP(req: Request): string {
  return req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown';
}

// GET /api/votes?post_id=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('post_id');
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const db = await getDB();
  if (!db) return NextResponse.json({ count: 0, voted: false });

  const ipHash = hashIP(getClientIP(req));

  const [countRow, votedRow] = await Promise.all([
    db.prepare('SELECT COUNT(*) as cnt FROM votes WHERE post_id = ?').bind(postId).first(),
    db.prepare('SELECT 1 FROM votes WHERE post_id = ? AND ip_hash = ?').bind(postId, ipHash).first(),
  ]);

  return NextResponse.json({
    count: (countRow?.cnt as number) ?? 0,
    voted: !!votedRow,
  });
}

// POST /api/votes  { post_id: string }
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json() as Record<string, unknown>; } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const postId = String(body.post_id ?? '').trim().slice(0, 300);
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const ipHash = hashIP(getClientIP(req));

  // Check if already voted — toggle off if so
  const existing = await db
    .prepare('SELECT 1 FROM votes WHERE post_id = ? AND ip_hash = ?')
    .bind(postId, ipHash)
    .first();

  if (existing) {
    await db.prepare('DELETE FROM votes WHERE post_id = ? AND ip_hash = ?').bind(postId, ipHash).run();
  } else {
    await db
      .prepare('INSERT OR IGNORE INTO votes (post_id, ip_hash) VALUES (?, ?)')
      .bind(postId, ipHash)
      .run();
  }

  const countRow = await db
    .prepare('SELECT COUNT(*) as cnt FROM votes WHERE post_id = ?')
    .bind(postId)
    .first();

  return NextResponse.json({
    ok: true,
    voted: !existing,
    count: (countRow?.cnt as number) ?? 0,
  });
}
