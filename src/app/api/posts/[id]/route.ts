import { NextResponse } from 'next/server';

function getDB() {
  try {
    // @ts-expect-error — Cloudflare D1 injected at runtime
    return globalThis.__env__?.DB as D1Database | undefined;
  } catch { return undefined; }
}

async function getSession(): Promise<Record<string, unknown> | null> {
  try {
    const { auth } = await import('@/auth');
    return await auth();
  } catch { return null; }
}

// GET /api/posts/[id] — get a single post by id or slug
// Add ?edit=1 to bypass published filter (author only)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const url = new URL(req.url);
  const editMode = url.searchParams.get('edit') === '1';

  // In edit mode, bypass published filter but verify ownership
  if (editMode) {
    const session = await getSession();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const post = await db.prepare('SELECT * FROM editorial_posts WHERE id = ?1 OR slug = ?1').bind(id, id).first();
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (post.author_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ post });
  }

  const post = await db.prepare(
    'SELECT * FROM editorial_posts WHERE (id = ?1 OR slug = ?1) AND published = 1'
  ).bind(id, id).first();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Increment view count (fire-and-forget)
  db.prepare('UPDATE editorial_posts SET views = views + 1 WHERE id = ?1').bind(post.id).run().catch(() => {});

  return NextResponse.json({ post });
}

// PATCH /api/posts/[id] — update a post (author only)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  // Verify ownership
  const existing = await db.prepare('SELECT author_id FROM editorial_posts WHERE id = ?1').bind(id).first();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.author_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as Record<string, unknown>;
  const allowed = ['title', 'content', 'excerpt', 'cover_image', 'category', 'tags', 'published', 'featured'];
  const updates: string[] = [];
  const binds: (string | number | null)[] = [];

  for (const key of allowed) {
    if (key in body) {
      updates.push(`${key} = ?${binds.length + 1}`);
      if (key === 'tags') binds.push(JSON.stringify(body[key]));
      else if (key === 'published' || key === 'featured') binds.push(body[key] ? 1 : 0);
      else binds.push(body[key] as string | null);
    }
  }

  if (updates.length === 0) return NextResponse.json({ ok: true });

  updates.push(`updated_at = ?${binds.length + 1}`);
  binds.push(new Date().toISOString());
  binds.push(id); // for WHERE

  await db.prepare(`UPDATE editorial_posts SET ${updates.join(', ')} WHERE id = ?${binds.length}`).bind(...binds).run();
  return NextResponse.json({ ok: true });
}

// DELETE /api/posts/[id] — delete a post (author only)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const existing = await db.prepare('SELECT author_id FROM editorial_posts WHERE id = ?1').bind(id).first();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.author_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.prepare('DELETE FROM editorial_posts WHERE id = ?1').bind(id).run();
  return NextResponse.json({ ok: true });
}
