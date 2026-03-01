import { NextResponse } from 'next/server';
import { getDB, getKV } from '@/lib/cloudflare';

export const dynamic = 'force-dynamic';

export async function GET() {
  const t0 = Date.now();
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  // D1 check
  try {
    const db = await getDB();
    const t = Date.now();
    if (db) {
      await db.prepare('SELECT 1').run();
      checks.d1 = { ok: true, latencyMs: Date.now() - t };
    } else {
      checks.d1 = { ok: false, error: 'unavailable' };
    }
  } catch (e) {
    checks.d1 = { ok: false, error: String(e) };
  }

  // KV check
  try {
    const kv = await getKV();
    const t = Date.now();
    if (kv) {
      await kv.get('__health__');
      checks.kv = { ok: true, latencyMs: Date.now() - t };
    } else {
      checks.kv = { ok: false, error: 'unavailable' };
    }
  } catch (e) {
    checks.kv = { ok: false, error: String(e) };
  }

  const allOk = Object.values(checks).every(c => c.ok);
  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      service: 'wokpost',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - t0,
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
