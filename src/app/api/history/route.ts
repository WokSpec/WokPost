import { NextResponse } from 'next/server';

async function getSession(): Promise<Record<string, unknown> | null> {
  try {
    const { auth } = await import('@/auth');
    return await getSession();
  } catch { return null; }
}

function getDB() {
  // @ts-expect-error — Cloudflare D1 injected at runtime
  return globalThis.__env__?.DB as D1Database | undefined;
}

function nanoid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// GET /api/history — return last 50 read items for current user
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDB();
  if (!db) return NextResponse.json({ history: [] });

  const { results } = await db
    .prepare('SELECT * FROM read_history WHERE user_id = ?1 ORDER BY read_at DESC LIMIT 50')
    .bind(session.user.id)
    .all();

  return NextResponse.json({ history: results });
}

// POST /api/history — record a read event (upsert by user_id + item_id)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    item_id: string;
    item_title: string;
    item_url: string;
    item_category?: string;
    item_thumbnail?: string;
  };

  if (!body.item_id || !body.item_title || !body.item_url) {
    return NextResponse.json({ error: 'item_id, item_title, item_url required' }, { status: 400 });
  }

  const db = getDB();
  if (!db) return NextResponse.json({ ok: true }); // silently succeed

  const id = nanoid();
  await db
    .prepare(`INSERT INTO read_history (id, user_id, item_id, item_title, item_url, item_category, item_thumbnail, read_at)
              VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, datetime('now'))
              ON CONFLICT(user_id, item_id) DO UPDATE SET read_at = datetime('now')`)
    .bind(id, session.user.id, body.item_id, body.item_title, body.item_url,
          body.item_category ?? null, body.item_thumbnail ?? null)
    .run();

  return NextResponse.json({ ok: true });
}

// DELETE /api/history — clear all history for current user
export async function DELETE() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDB();
  if (!db) return NextResponse.json({ ok: true });

  await db.prepare('DELETE FROM read_history WHERE user_id = ?1').bind(session.user.id).run();
  return NextResponse.json({ ok: true });
}
