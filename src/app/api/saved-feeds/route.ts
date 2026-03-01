import { NextResponse } from 'next/server';
import { getDB } from '@/lib/cloudflare';

async function getSession(): Promise<Record<string, unknown> | null> {
  try {
    const { auth } = await import('@/auth');
    return await getSession();
  } catch { return null; }
}

// GET /api/saved-feeds
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDB();
  if (!db) return NextResponse.json({ feeds: [] });

  const { results } = await db
    .prepare(`SELECT * FROM saved_feeds WHERE user_id = ?1 ORDER BY created_at DESC`)
    .bind(session.user.id)
    .all();

  return NextResponse.json({ feeds: results });
}

// POST /api/saved-feeds — create a saved feed
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    name: string;
    category?: string;
    keywords?: string;
    sort?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO saved_feeds (id, user_id, name, category, keywords, sort)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
    .bind(id, session.user.id, body.name.trim(), body.category ?? null, body.keywords ?? null, body.sort ?? 'latest')
    .run();

  return NextResponse.json({ ok: true, id });
}

// DELETE /api/saved-feeds?id=xxx
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  await db
    .prepare(`DELETE FROM saved_feeds WHERE id = ?1 AND user_id = ?2`)
    .bind(id, session.user.id)
    .run();

  return NextResponse.json({ ok: true });
}
