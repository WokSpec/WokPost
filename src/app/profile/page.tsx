import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { CATEGORIES } from '@/lib/feed/types';
import ProfileClient from './ProfileClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Profile — WokPost' };

type BookmarkRow = {
  id: string; item_id: string; item_title: string; item_url: string;
  item_category: string | null; item_source: string | null; item_source_tier: number;
  item_thumbnail: string | null; item_ai_score: number; item_ai_tagged: number;
  bookmarked_at: string;
};
type SavedFeedRow = {
  id: string; name: string; category: string | null; keywords: string | null;
  sort: string; created_at: string;
};

async function getUserData(userId: string) {
  // @ts-expect-error — Cloudflare D1 injected at runtime
  const db = globalThis.__env__?.DB as D1Database | undefined;
  if (!db) return { bookmarks: [], savedFeeds: [] };
  const [bm, sf] = await Promise.all([
    db.prepare(`SELECT * FROM bookmarks WHERE user_id = ?1 ORDER BY bookmarked_at DESC`).bind(userId).all(),
    db.prepare(`SELECT * FROM saved_feeds WHERE user_id = ?1 ORDER BY created_at DESC`).bind(userId).all(),
  ]);
  return { bookmarks: (bm.results ?? []) as BookmarkRow[], savedFeeds: (sf.results ?? []) as SavedFeedRow[] };
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { bookmarks, savedFeeds } = await getUserData(session.user.id);
  const user = session.user;

  const categories = Object.fromEntries(
    Object.entries(CATEGORIES).map(([k, v]) => [k, { label: v.label, color: v.color }])
  );

  return (
    <div className="site-container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 900 }}>
      {/* User header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" width={56} height={56} style={{ borderRadius: '50%', border: '2px solid var(--border)' }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{user.name ?? 'Anonymous'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{user.email}</div>
        </div>
        <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
          <button type="submit" style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 13, padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
            Sign out
          </button>
        </form>
      </div>

      {/* Client-rendered interactive sections */}
      <ProfileClient
        initialBookmarks={bookmarks}
        initialSavedFeeds={savedFeeds}
        categories={categories}
      />
    </div>
  );
}
