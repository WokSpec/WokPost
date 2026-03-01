import { NextResponse } from 'next/server';
import { getDB } from '@/lib/cloudflare';

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}


export async function POST(req: Request) {
  const raw = await req.text().catch(() => '');
  if (raw.length > 4000) return NextResponse.json({ error: 'Too large' }, { status: 413 });

  let body: Record<string, unknown> = {};
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

  // Sanitize topics: must be an array of known-ish strings, max 30 chars each
  const rawTopics = Array.isArray(body.topics) ? body.topics : [];
  const topics = rawTopics
    .filter((t): t is string => typeof t === 'string')
    .map(t => t.slice(0, 30))
    .slice(0, 50);

  const wokspecUpdates = body.wokspec_updates === 1 || body.wokspec_updates === true ? 1 : 0;

  const db = await getDB();
  if (db) {
    try {
      await db.prepare(
        `INSERT INTO subscribers (email, source, topics, wokspec_updates)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(email) DO UPDATE SET
           topics = excluded.topics,
           wokspec_updates = excluded.wokspec_updates`
      ).bind(
        email,
        String(body.source ?? 'wokpost').slice(0, 50),
        JSON.stringify(topics),
        wokspecUpdates,
      ).run();
    } catch (err) {
      // Column might not exist yet if migration hasn't run — fall back to simple upsert
      try {
        await db.prepare(
          'INSERT OR IGNORE INTO subscribers (email, source) VALUES (?1, ?2)'
        ).bind(email, String(body.source ?? 'wokpost').slice(0, 50)).run();
      } catch { /* ignore */ }
    }
  }

  return NextResponse.json({ ok: true });
}
