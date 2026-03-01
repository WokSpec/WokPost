import { NextResponse } from 'next/server';
import { getDB } from '@/lib/cloudflare';


function getIP(req: Request) {
  return req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown';
}

function hashIP(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = Math.imul(31, h) + ip.charCodeAt(i) | 0;
  }
  return (h >>> 0).toString(36);
}

function nanoid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('post_id');
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const db = await getDB();
  if (!db) return NextResponse.json({ comments: [] });

  const { results } = await db.prepare(
    'SELECT id, author_name, content, created_at FROM comments WHERE post_id = ? AND flagged = 0 ORDER BY created_at ASC LIMIT 100'
  ).bind(postId).all();

  return NextResponse.json({ comments: results });
}

export async function POST(req: Request) {
  const raw = await req.text().catch(() => '');
  if (raw.length > 4000) return NextResponse.json({ error: 'Too large' }, { status: 413 });

  let body: Record<string, unknown> = {};
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const postId = String(body.post_id ?? '').trim().slice(0, 200);
  const authorName = String(body.author_name ?? '').trim().slice(0, 60);
  const content = String(body.content ?? '').trim().slice(0, 2000);

  if (!postId || !authorName || !content || content.length < 2) {
    return NextResponse.json({ error: 'post_id, author_name, and content required' }, { status: 400 });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  // Rate limit: 5 comments per IP per hour
  const ipHash = hashIP(getIP(req));
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const rateRow = await db.prepare(
    'SELECT COUNT(*) as cnt FROM comments WHERE ip_hash = ? AND created_at > ?'
  ).bind(ipHash, since).first();
  if ((rateRow?.cnt as number) >= 5) {
    return NextResponse.json({ error: 'Rate limited — try again later' }, { status: 429 });
  }

  const id = nanoid();
  await db.prepare(
    'INSERT INTO comments (id, post_id, author_name, content, ip_hash) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, postId, authorName, content, ipHash).run();

  return NextResponse.json({ ok: true, id, author_name: authorName, content, created_at: new Date().toISOString() });
}
