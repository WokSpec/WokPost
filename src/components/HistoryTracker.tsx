'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  itemId: string;
  itemTitle: string;
  itemUrl: string;
  itemCategory?: string;
  itemThumbnail?: string;
}

export function HistoryTracker({ itemId, itemTitle, itemUrl, itemCategory, itemThumbnail }: Props) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, item_title: itemTitle, item_url: itemUrl, item_category: itemCategory, item_thumbnail: itemThumbnail }),
    }).catch(() => {});
  // Run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  return null;
}
