-- Auth: users, bookmarks, saved feeds

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  image      TEXT,
  provider   TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id        TEXT NOT NULL,
  item_title     TEXT NOT NULL,
  item_url       TEXT NOT NULL,
  item_category  TEXT,
  item_source    TEXT,
  item_source_tier INTEGER DEFAULT 3,
  item_thumbnail TEXT,
  item_ai_score  INTEGER DEFAULT 0,
  item_ai_tagged INTEGER DEFAULT 0,
  bookmarked_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

CREATE TABLE IF NOT EXISTS saved_feeds (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  category   TEXT,
  keywords   TEXT,
  sort       TEXT NOT NULL DEFAULT 'latest',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_saved_feeds_user ON saved_feeds(user_id);
