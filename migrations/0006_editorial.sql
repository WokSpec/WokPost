-- Editorial posts written by WokPost authors (e.g. Eral)
CREATE TABLE IF NOT EXISTS editorial_posts (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL DEFAULT '',
  content       TEXT NOT NULL DEFAULT '',
  cover_image   TEXT,
  category      TEXT NOT NULL DEFAULT 'ai',
  tags          TEXT NOT NULL DEFAULT '[]',
  author_id     TEXT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  author_name   TEXT NOT NULL DEFAULT 'Eral',
  author_avatar TEXT,
  published     INTEGER NOT NULL DEFAULT 0,
  featured      INTEGER NOT NULL DEFAULT 0,
  views         INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_editorial_category  ON editorial_posts(category, published);
CREATE INDEX IF NOT EXISTS idx_editorial_published ON editorial_posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_editorial_author    ON editorial_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_editorial_slug      ON editorial_posts(slug);
