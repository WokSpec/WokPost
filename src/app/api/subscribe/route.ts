import { NextResponse } from 'next/server';
import { Resend } from 'resend';


function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

function getDB(): D1Database | null {
  try {
    // @ts-expect-error
    return globalThis.__env__?.DB ?? null;
  } catch { return null; }
}

export async function POST(req: Request) {
  const raw = await req.text().catch(() => '');
  if (raw.length > 1000) return NextResponse.json({ error: 'Too large' }, { status: 413 });

  let body: Record<string, unknown> = {};
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

  // Store in D1
  const db = getDB();
  if (db) {
    try {
      await db.prepare(
        'INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)'
      ).bind(email, String(body.source ?? 'wokpost').slice(0, 50)).run();
    } catch { /* ignore duplicate */ }
  }

  // Also add to Resend audience
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (apiKey && audienceId) {
    try {
      const resend = new Resend(apiKey);
      await resend.contacts.create({ email, audienceId, unsubscribed: false });
    } catch { /* resend unavailable */ }
  }

  return NextResponse.json({ ok: true });
}
