import { NextResponse } from 'next/server';
import { auth } from '@/auth';

function getDB() {
  // @ts-expect-error — Cloudflare D1 injected at runtime
  return globalThis.__env__?.DB as D1Database | undefined;
}

// GET /api/bookmarks — list current user's bookmarks
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDB();
  if (!db) return NextResponse.json({ bookmarks: [] });

  const { results } = await db
    .prepare(`SELECT * FROM bookmarks WHERE user_id = ?1 ORDER BY bookmarked_at DESC`)
    .bind(session.user.id)
    .all();

  return NextResponse.json({ bookmarks: results });
}

// POST /api/bookmarks — add a bookmark
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    item_id: string;
    item_title: string;
    item_url: string;
    item_category?: string;
    item_source?: string;
    item_source_tier?: number;
    item_thumbnail?: string;
    item_ai_score?: number;
    item_ai_tagged?: boolean;
  };

  if (!body.item_id || !body.item_title || !body.item_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO bookmarks
         (id, user_id, item_id, item_title, item_url, item_category, item_source,
          item_source_tier, item_thumbnail, item_ai_score, item_ai_tagged)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)
       ON CONFLICT(user_id, item_id) DO NOTHING`
    )
    .bind(
      id,
      session.user.id,
      body.item_id,
      body.item_title,
      body.item_url,
      body.item_category ?? null,
      body.item_source ?? null,
      body.item_source_tier ?? 3,
      body.item_thumbnail ?? null,
      body.item_ai_score ?? 0,
      body.item_ai_tagged ? 1 : 0
    )
    .run();

  return NextResponse.json({ ok: true });
}

// DELETE /api/bookmarks?item_id=xxx — remove a bookmark
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('item_id');
  if (!itemId) return NextResponse.json({ error: 'Missing item_id' }, { status: 400 });

  const db = getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  await db
    .prepare(`DELETE FROM bookmarks WHERE user_id = ?1 AND item_id = ?2`)
    .bind(session.user.id, itemId)
    .run();

  return NextResponse.json({ ok: true });
}
