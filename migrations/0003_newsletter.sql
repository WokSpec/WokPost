-- Add topics and extras to subscribers
ALTER TABLE subscribers ADD COLUMN topics TEXT DEFAULT '[]';
ALTER TABLE subscribers ADD COLUMN wokspec_updates INTEGER DEFAULT 0;
ALTER TABLE subscribers ADD COLUMN verified INTEGER DEFAULT 0;
