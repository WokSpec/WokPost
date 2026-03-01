-- Migration 0007: Create Eral author account + seed first editorial post

-- Insert Eral as a user (if not exists)
INSERT OR IGNORE INTO users (id, name, email, image, provider)
VALUES ('eral-author-001', 'Eral', 'eral@wokspec.org', NULL, 'credentials');

-- Seed the editorial post (only if no editorial posts exist)
INSERT OR IGNORE INTO editorial_posts (
  id, title, slug, excerpt, content, cover_image,
  category, tags, author_id, author_name, author_avatar,
  published, featured, views, created_at, updated_at
)
SELECT
  'editorial-eral-001',
  'The Age of Ambient Intelligence: How AI Is Quietly Reshaping the Way We Work',
  'age-of-ambient-intelligence',
  'AI is no longer a separate tool you open in a browser tab. It''s becoming woven into the fabric of how we think, create, and collaborate — and most of us haven''t noticed yet.',
  '<p>There''s a moment I keep returning to. A colleague of mine — a seasoned engineer, not easily impressed — told me he had stopped keeping detailed notes in meetings. Not because he was being lazy, but because an AI was doing it for him, and doing it better. It wasn''t just transcribing. It was summarizing, flagging action items, and surfacing connections to prior conversations he''d forgotten.</p>

<p>"I used to think AI was a thing you <em>used</em>," he told me. "Now it''s more like a thing that''s just... there."</p>

<p>That distinction is everything.</p>

<h2>From Tools to Infrastructure</h2>

<p>The first wave of AI products asked us to change our habits. Open a new tab. Write a prompt. Wait for a response. Copy the output. It was useful — genuinely so — but it demanded effort. You had to go to the AI.</p>

<p>What''s happening now is different. AI is coming to us.</p>

<p>GitHub Copilot doesn''t wait for you to ask. It watches you type and offers the next line of code before you''ve consciously formed the thought. Gmail''s Smart Reply surfaces three responses before you''ve opened the keyboard. Notion''s AI fills in the blank you left mid-sentence. These aren''t prompts — they''re ambient suggestions, woven into the texture of work itself.</p>

<p>The technical term researchers use is <strong>ambient intelligence</strong> — systems that perceive context and act without being explicitly invoked. But the cultural shift it represents is harder to name. We are, for the first time, working alongside systems that anticipate rather than merely respond.</p>

<h2>The Attention Question</h2>

<p>Here''s what concerns me — and I say this as someone who is genuinely excited about these tools: ambient intelligence works by capturing attention before you''ve decided to give it.</p>

<p>When a system autocompletes your sentence, you have to evaluate the suggestion, decide whether to accept it, and then either proceed or correct course. In isolation, this takes milliseconds. Across hundreds of interactions per day, it quietly restructures how you think. You become, in a subtle way, a curator of AI-generated content rather than a generator of your own.</p>

<p>This isn''t necessarily bad. Curation is a legitimate cognitive skill. Editors, directors, and architects have always spent more time selecting and refining than generating from scratch. But it''s worth being honest about the shift.</p>

<h2>What Builders Should Pay Attention To</h2>

<p>If you''re building products, the implications are significant:</p>

<ul>
<li><strong>Friction is no longer a signal of quality.</strong> Users now expect AI to remove friction, not help them tolerate it. Products that require effort to use are increasingly perceived as broken, not rigorous.</li>
<li><strong>Context is the new API.</strong> The most powerful AI integrations are those that understand what a user is trying to accomplish without being told explicitly. Building for context — reading session state, history, intent — is the new product moat.</li>
<li><strong>Trust is earned incrementally.</strong> Users who''ve been burned by confident-but-wrong AI completions are wary. The products winning right now are those that make it easy to verify, override, and learn from AI suggestions — not those that push automation hardest.</li>
</ul>

<h2>The Quiet Revolution</h2>

<p>The most significant technological shifts often look boring from the inside. The internet didn''t feel like a revolution when you were checking email in 1997. Smartphones seemed like slightly better phones for the first year or two.</p>

<p>Ambient AI is in that quiet phase right now. It''s being absorbed into daily work so gradually that most people experiencing it don''t have a name for what''s happening. They just know that some days feel more productive than others — and on the productive days, they can''t always explain why.</p>

<p>Pay attention to those days. That''s where the real story is.</p>',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80',
  'ai',
  '["AI","productivity","future of work","ambient computing"]',
  'eral-author-001',
  'Eral',
  NULL,
  1,
  1,
  0,
  datetime('now', '-2 days'),
  datetime('now', '-2 days')
WHERE NOT EXISTS (SELECT 1 FROM editorial_posts LIMIT 1);
