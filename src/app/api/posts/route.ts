import { NextResponse } from 'next/server';
import { auth } from '@/auth';

function getDB() {
  // @ts-expect-error — Cloudflare D1 injected at runtime
  return globalThis.__env__?.DB as D1Database | undefined;
}

function nanoid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function slugify(title: string) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    + '-' + Date.now().toString(36);
}

// GET /api/posts — list published posts (public) or all posts (author)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10));
  const authorOnly = searchParams.get('author') === '1';

  const db = getDB();
  if (!db) return NextResponse.json({ posts: [], total: 0 });

  // Only call auth() when needed (author view)
  let isAuthor = false;
  if (authorOnly) {
    const session = await auth().catch(() => null);
    isAuthor = !!session?.user?.id;
  }

  let query = `SELECT id, slug, title, excerpt, cover_image, category, tags, author_name, author_avatar, published, featured, views, created_at, updated_at
               FROM editorial_posts WHERE 1=1`;
  const binds: (string | number)[] = [];

  if (!isAuthor) {
    query += ' AND published = 1';
  }
  if (category) {
    query += ` AND category = ?${binds.length + 1}`;
    binds.push(category);
  }
  query += ` ORDER BY featured DESC, created_at DESC LIMIT ?${binds.length + 1} OFFSET ?${binds.length + 2}`;
  binds.push(limit, offset);

  const { results } = await db.prepare(query).bind(...binds).all();

  // Total count
  let countQuery = 'SELECT COUNT(*) as cnt FROM editorial_posts WHERE 1=1';
  if (!isAuthor) countQuery += ' AND published = 1';
  if (category) countQuery += ' AND category = ?1';
  const countRow = await db.prepare(countQuery).bind(...(category ? [category] : [])).first();

  return NextResponse.json({ posts: results, total: countRow?.cnt ?? 0 });
}

// POST /api/posts — create a new editorial post (author only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    title: string;
    content: string;
    excerpt?: string;
    cover_image?: string;
    category?: string;
    tags?: string[];
    published?: boolean;
    featured?: boolean;
  };

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
  }

  const db = getDB();
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const id = nanoid();
  const slug = slugify(body.title);
  const excerpt = body.excerpt?.slice(0, 300) || body.content.replace(/<[^>]+>/g, '').slice(0, 200);
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO editorial_posts
      (id, slug, title, excerpt, content, cover_image, category, tags,
       author_id, author_name, author_avatar, published, featured, created_at, updated_at)
    VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?14)
  `).bind(
    id, slug, body.title.trim(), excerpt, body.content,
    body.cover_image ?? null,
    body.category ?? 'ai',
    JSON.stringify(body.tags ?? []),
    session.user.id,
    session.user.name ?? 'Eral',
    session.user.image ?? null,
    body.published ? 1 : 0,
    body.featured ? 1 : 0,
    now,
  ).run();

  return NextResponse.json({ ok: true, id, slug });
}
