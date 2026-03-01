-- Add ip_hash column to comments for proper rate limiting
ALTER TABLE comments ADD COLUMN ip_hash TEXT NOT NULL DEFAULT '';

-- Add reading history table
CREATE TABLE IF NOT EXISTS read_history (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id    TEXT NOT NULL,
  item_title TEXT NOT NULL,
  item_url   TEXT NOT NULL,
  item_category TEXT,
  item_thumbnail TEXT,
  read_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_read_history_user ON read_history(user_id, read_at DESC);
