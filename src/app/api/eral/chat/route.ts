import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const ERAL_API = process.env.ERAL_API_URL ?? 'https://eral.wokspec.org/api';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json() as Record<string, unknown>;

  // next-auth v5: access token lives on the JWT but isn't forwarded to session by default
  const token = (session as Record<string, unknown> | null)?.accessToken as string | undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Eral-Source': 'wokpost',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${ERAL_API}/v1/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...body, product: 'wokpost' }),
  });

  const data: unknown = await res.json();
  return NextResponse.json(data, { status: res.status });
}
