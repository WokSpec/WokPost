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
type HistoryRow = {
  id: string; item_id: string; item_title: string; item_url: string;
  item_category: string | null; item_thumbnail: string | null; read_at: string;
};

async function getUserData(userId: string) {
  const db = await (async () => { try { const { getDB } = await import('@/lib/cloudflare'); return await getDB(); } catch { return undefined; } })();
  if (!db) return { bookmarks: [], savedFeeds: [], history: [] };
  const [bm, sf, hist] = await Promise.all([
    db.prepare(`SELECT * FROM bookmarks WHERE user_id = ?1 ORDER BY bookmarked_at DESC`).bind(userId).all(),
    db.prepare(`SELECT * FROM saved_feeds WHERE user_id = ?1 ORDER BY created_at DESC`).bind(userId).all(),
    db.prepare(`SELECT * FROM read_history WHERE user_id = ?1 ORDER BY read_at DESC LIMIT 30`).bind(userId).all().catch(() => ({ results: [] })),
  ]);
  return {
    bookmarks: (bm.results ?? []) as BookmarkRow[],
    savedFeeds: (sf.results ?? []) as SavedFeedRow[],
    history: (hist.results ?? []) as HistoryRow[],
  };
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { bookmarks, savedFeeds, history } = await getUserData(session.user.id);
  const user = session.user;

  const categories = Object.fromEntries(
    Object.entries(CATEGORIES).map(([k, v]) => [k, { label: v.label, color: v.color }])
  );

  return (
    <div className="site-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: 900 }}>
      {/* User header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2.5rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--border)' }}>
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            width={52}
            height={52}
            style={{ borderRadius: '50%', border: '2px solid var(--border-strong)', flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {user.name ?? 'Anonymous'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
            {user.email}
          </div>
        </div>
        <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
          <button
            type="submit"
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.78rem', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600 }}
          >
            Sign out
          </button>
        </form>
      </div>

      <ProfileClient
        initialBookmarks={bookmarks}
        initialSavedFeeds={savedFeeds}
        initialHistory={history}
        categories={categories}
      />
    </div>
  );
}
