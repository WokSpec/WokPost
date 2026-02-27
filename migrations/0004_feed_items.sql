-- WokPost feed items persistent cache
-- Items are upserted here when fetched so /post/[id] always resolves

CREATE TABLE IF NOT EXISTS feed_items (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  url           TEXT NOT NULL,
  source_id     TEXT NOT NULL,
  source_name   TEXT NOT NULL,
  source_type   TEXT NOT NULL DEFAULT 'rss',
  source_tier   INTEGER NOT NULL DEFAULT 3,
  content_type  TEXT NOT NULL DEFAULT 'story',
  category      TEXT NOT NULL,
  ai_tagged     INTEGER NOT NULL DEFAULT 0,
  ai_score      INTEGER NOT NULL DEFAULT 1,
  published_at  TEXT NOT NULL,
  summary       TEXT NOT NULL DEFAULT '',
  tags          TEXT NOT NULL DEFAULT '[]',
  thumbnail     TEXT,
  score         INTEGER,
  repo_language TEXT,
  repo_topics   TEXT,
  fetched_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feed_items_category    ON feed_items(category);
CREATE INDEX IF NOT EXISTS idx_feed_items_published   ON feed_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_ai_score    ON feed_items(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_source_tier ON feed_items(source_tier);
CREATE INDEX IF NOT EXISTS idx_feed_items_content     ON feed_items(content_type);
