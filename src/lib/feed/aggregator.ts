import type { Category, ContentType, FeedItem, FeedSource } from './types';

// Sources whose IDs indicate research papers
const PAPER_SOURCE_IDS = new Set(['pwc-latest']);
const ARXIV_PREFIX = /^arxiv-/;
function getContentType(sourceType: string, sourceId: string): ContentType {
  if (sourceType === 'github') return 'repo';
  if (sourceType === 'pwc' || PAPER_SOURCE_IDS.has(sourceId) || ARXIV_PREFIX.test(sourceId)) return 'paper';
  return 'story';
}

// ── Weighted AI keyword scoring ──────────────────────────────────────────────
const AI_KEYWORDS_WEIGHTED: [string, number][] = [
  // Definitive signals (3 pts)
  ['artificial intelligence', 3], ['machine learning', 3], ['large language model', 3],
  ['neural network', 3], ['deep learning', 3], ['generative ai', 3],
  ['foundation model', 3], ['llm', 3], ['gpt-4', 3], ['gpt-3', 3], ['chatgpt', 3],
  ['claude', 3], ['gemini', 3], ['openai', 3], ['anthropic', 3],
  ['google deepmind', 3], ['meta ai', 3], ['hugging face', 3],
  ['diffusion model', 3], ['mistral', 3], ['ai safety', 3], ['alignment', 3],
  ['grok', 3], ['copilot', 3], ['llama', 3], ['falcon', 3], ['phi-', 3],
  // Strong signals (2 pts)
  ['natural language processing', 2], ['nlp', 2], ['computer vision', 2],
  ['reinforcement learning', 2], ['fine-tuning', 2], ['embeddings', 2],
  ['ai model', 2], ['ai system', 2], ['ai-powered', 2], ['ai agent', 2],
  ['stable diffusion', 2], ['multimodal', 2], ['rag', 2],
  ['retrieval augmented', 2], ['inference', 2], ['benchmark', 2],
  ['language model', 2], ['agentic', 2], ['ai-generated', 2],
  ['transformer', 2], ['hallucination', 2], ['tokenizer', 2], ['parameter', 2],
  ['training data', 2], ['synthetic data', 2], ['ai tool', 2],
  // Weak signals (1 pt)
  ['automation', 1], ['algorithm', 1], ['autonomous', 1], ['neural', 1],
  ['data science', 1], ['predictive', 1], ['robotics', 1],
];

const AI_KEYWORDS = AI_KEYWORDS_WEIGHTED.map(([kw]) => kw);

// ── Domain keyword maps for cross-source classification ─────────────────────
const DOMAIN_KEYWORDS: Record<Category, string[]> = {
  ai:            AI_KEYWORDS,
  business:      ['startup', 'funding', 'revenue', 'market', 'enterprise', 'ipo', 'acquisition', 'profit', 'economy', 'investment', 'venture capital', 'saas', 'valuation', 'series a', 'series b'],
  sports:        ['nfl', 'nba', 'mlb', 'soccer', 'football', 'basketball', 'athlete', 'game', 'match', 'tournament', 'championship', 'league', 'team', 'player', 'formula 1', 'grand prix'],
  science:       ['research', 'study', 'experiment', 'discovery', 'physics', 'biology', 'chemistry', 'genome', 'quantum', 'particle', 'scientific', 'lab', 'journal', 'preprint', 'peer review', 'hypothesis'],
  health:        ['health', 'medicine', 'medical', 'hospital', 'disease', 'treatment', 'therapy', 'drug', 'clinical', 'patient', 'doctor', 'surgery', 'cancer', 'vaccine', 'fda', 'clinical trial'],
  nutrition:     ['nutrition', 'diet', 'food', 'protein', 'calorie', 'vitamin', 'mineral', 'gut', 'metabolism', 'eating', 'meal', 'microbiome', 'obesity', 'diabetes'],
  farming:       ['farming', 'agriculture', 'crop', 'harvest', 'soil', 'pesticide', 'livestock', 'irrigation', 'drought', 'farmer', 'food supply', 'agritech', 'precision farming'],
  entertainment: ['movie', 'film', 'music', 'album', 'concert', 'celebrity', 'streaming', 'netflix', 'hollywood', 'tv show', 'television', 'box office', 'box office', 'oscars', 'grammy'],
  education:     ['education', 'school', 'university', 'student', 'teacher', 'learning', 'classroom', 'curriculum', 'edtech', 'tutoring', 'degree', 'college', 'academic'],
  law:           ['law', 'legal', 'court', 'judge', 'regulation', 'policy', 'legislation', 'lawsuit', 'rights', 'compliance', 'attorney', 'supreme court', 'congress', 'gdpr', 'copyright'],
  gaming:        ['game', 'gaming', 'video game', 'esport', 'console', 'steam', 'playstation', 'xbox', 'nintendo', 'developer', 'indie', 'pc gaming', 'mobile game', 'unreal', 'unity'],
  space:         ['space', 'nasa', 'spacex', 'rocket', 'satellite', 'astronaut', 'mars', 'moon', 'orbit', 'telescope', 'galaxy', 'cosmos', 'launch', 'spacecraft', 'esa', 'jwst'],
  art:           ['art', 'design', 'creative', 'artist', 'illustration', 'painting', 'photography', 'sculpture', 'gallery', 'generative art', 'graphic design', 'architecture'],
  robotics:      ['robot', 'robotics', 'actuator', 'servo', 'autonomous vehicle', 'drone', 'humanoid', 'boston dynamics', 'mechanical', 'hardware', 'arduino', 'exoskeleton'],
  climate:       ['climate', 'environment', 'carbon', 'emission', 'renewable', 'solar', 'wind energy', 'fossil fuel', 'global warming', 'sustainability', 'green', 'net zero', 'ipcc'],
  cybersecurity: ['cybersecurity', 'hacking', 'ransomware', 'vulnerability', 'exploit', 'breach', 'malware', 'phishing', 'encryption', 'zero-day', 'infosec', 'security', 'cve', 'threat'],
  crypto:        ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'token', 'cryptocurrency', 'web3', 'wallet', 'mining', 'exchange', 'stablecoin', 'solana'],
  politics:      ['politics', 'election', 'president', 'congress', 'senate', 'democrat', 'republican', 'government', 'policy', 'vote', 'legislation', 'white house', 'geopolitics'],
  energy:        ['energy', 'electricity', 'grid', 'nuclear', 'solar panel', 'wind turbine', 'battery', 'ev', 'electric vehicle', 'oil', 'gas', 'power plant', 'gigawatt', 'hydrogen'],
  ethics:        ['ethics', 'bias', 'fairness', 'alignment', 'safety', 'regulation', 'philosophy', 'moral', 'privacy', 'surveillance', 'accountability', 'singularity', 'existential risk'],
};

function scoreText(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
}

function scoreAiWeighted(text: string): number {
  const lower = text.toLowerCase();
  return AI_KEYWORDS_WEIGHTED.reduce((acc, [kw, w]) => acc + (lower.includes(kw) ? w : 0), 0);
}

export function classifyItem(
  text: string,
  defaultCategory: Category,
  alwaysAiTagged = false
): { category: Category; aiTagged: boolean; aiScore: number } {
  const aiRaw = scoreAiWeighted(text);
  const aiScore = Math.min(10, Math.round((aiRaw / 6) * 10));
  const aiTagged = alwaysAiTagged || aiRaw >= 4;

  let bestCategory: Category = defaultCategory;
  let bestScore = 0;
  for (const [cat, keywords] of Object.entries(DOMAIN_KEYWORDS) as [Category, string[]][]) {
    if (cat === 'ai') continue;
    const s = scoreText(text, keywords);
    if (s > bestScore) { bestScore = s; bestCategory = cat; }
  }

  const category: Category = bestScore >= 2 ? bestCategory : defaultCategory;
  return { category, aiTagged, aiScore: Math.max(1, aiScore) };
}

// ── Title normalization for deduplication ────────────────────────────────────
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(arxiv:[^)]+\)/gi, '')   // strip arXiv IDs
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

// ── RSS / Atom parser ────────────────────────────────────────────────────────
function extractText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i'));
  return m ? m[1] : '';
}

function extractThumbnail(itemXml: string): string | undefined {
  let m = itemXml.match(/<media:thumbnail\b[^>]+url="(https?:\/\/[^"]+)"/i);
  if (m) return m[1];
  m = itemXml.match(/<media:content\b[^>]+url="(https?:\/\/[^"]+)"[^>]*medium="image"/i);
  if (!m) m = itemXml.match(/<media:content\b[^>]*medium="image"[^>]+url="(https?:\/\/[^"]+)"/i);
  if (m) return m[1];
  m = itemXml.match(/<media:content\b[^>]+url="(https?:\/\/[^"]+\.(?:jpe?g|png|webp|gif)[^"]*)"/i);
  if (m) return m[1];
  m = itemXml.match(/<enclosure\b[^>]+type="image\/[^"]*"[^>]+url="(https?:\/\/[^"]+)"/i);
  if (!m) m = itemXml.match(/<enclosure\b[^>]+url="(https?:\/\/[^"]+)"[^>]*type="image\/[^"]*"/i);
  if (m) return m[1];
  m = itemXml.match(/<img\b[^>]+src="(https?:\/\/[^"]+)"/i);
  if (m) return m[1];
  return undefined;
}

function parseRssItems(xml: string): { title: string; url: string; publishedAt: string; summary: string; thumbnail?: string }[] {
  const items: { title: string; url: string; publishedAt: string; summary: string; thumbnail?: string }[] = [];

  // Support both RSS <item> and Atom <entry>
  const itemPattern = xml.includes('<entry>') ? /<entry>([\s\S]*?)<\/entry>/gi : /<item>([\s\S]*?)<\/item>/gi;

  for (const m of xml.matchAll(itemPattern)) {
    const chunk = m[1];
    const title = extractText(chunk, 'title');
    // Atom uses <link href="..."/> while RSS uses <link>url</link>
    const link = extractText(chunk, 'link')
      || extractAttr(chunk, 'link', 'href')
      || extractAttr(chunk, 'id', '');
    const pubDate = extractText(chunk, 'pubDate')
      || extractText(chunk, 'published')
      || extractText(chunk, 'updated')
      || extractText(chunk, 'dc:date');
    const desc = extractText(chunk, 'description')
      || extractText(chunk, 'content:encoded')
      || extractText(chunk, 'summary')
      || extractText(chunk, 'content');
    const thumbnail = extractThumbnail(chunk);
    if (title && link) {
      items.push({
        title,
        url: link,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        summary: desc.slice(0, 300),
        thumbnail,
      });
    }
  }
  return items.slice(0, 15);
}

// ── Deduplication helpers ────────────────────────────────────────────────────
function urlId(url: string): string {
  try { return new URL(url).pathname; } catch { return url; }
}

// ── Fetcher ──────────────────────────────────────────────────────────────────
async function fetchSource(source: FeedSource): Promise<FeedItem[]> {
  const headers = { 'User-Agent': 'WokPost/1.0 (+https://wokpost.wokspec.org)' };
  const tier = source.tier ?? 3;
  const items: FeedItem[] = [];

  try {
    if (source.type === 'hn') {
      const res = await fetch(source.url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) return [];
      const data = await res.json() as { hits: { objectID: string; title: string; url?: string; story_url?: string; created_at: string; points: number; num_comments: number }[] };
      for (const hit of data.hits ?? []) {
        const url = hit.url || hit.story_url;
        if (!url) continue;
        const text = hit.title;
        const cls = classifyItem(text, source.defaultCategory, source.alwaysAiTagged);
        items.push({
          id: `hn-${hit.objectID}`,
          title: hit.title,
          url,
          sourceId: source.id,
          sourceName: source.name,
          sourceType: 'hn',
          sourceTier: tier,
          contentType: 'story',
          ...cls,
          publishedAt: hit.created_at,
          summary: '',
          tags: [],
          score: hit.points,
          commentCount: hit.num_comments,
        });
      }

    } else if (source.type === 'reddit') {
      const res = await fetch(source.url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) return [];
      const data = await res.json() as { data: { children: { data: { id: string; title: string; url: string; created_utc: number; selftext: string; score: number; num_comments: number; thumbnail?: string; preview?: { images: Array<{ source: { url: string } }> } } }[] } };
      for (const child of data.data?.children ?? []) {
        const p = child.data;
        if (!p.url || p.url.includes('reddit.com/r/')) continue;
        const text = p.title + ' ' + (p.selftext ?? '').slice(0, 200);
        const cls = classifyItem(text, source.defaultCategory, source.alwaysAiTagged);
        let thumbnail: string | undefined;
        if (p.preview?.images?.[0]?.source?.url) {
          thumbnail = p.preview.images[0].source.url.replace(/&amp;/g, '&');
        } else if (p.thumbnail && p.thumbnail.startsWith('http')) {
          thumbnail = p.thumbnail;
        }
        items.push({
          id: `reddit-${p.id}`,
          title: p.title,
          url: p.url,
          sourceId: source.id,
          sourceName: source.name,
          sourceType: 'reddit',
          sourceTier: tier,
          contentType: 'story',
          ...cls,
          publishedAt: new Date(p.created_utc * 1000).toISOString(),
          summary: p.selftext?.slice(0, 300) ?? '',
          tags: [],
          score: p.score,
          commentCount: p.num_comments,
          thumbnail,
        });
      }

    } else if (source.type === 'pwc') {
      // Papers with Code API
      const res = await fetch(source.url, { headers, signal: AbortSignal.timeout(10000) });
      if (!res.ok) return [];
      const data = await res.json() as { results: Array<{ id: string; title: string; abstract: string; url_abs?: string; url_pdf?: string; published: string; total_stars?: number; thumbnail_url?: string }> };
      for (const paper of data.results ?? []) {
        const url = paper.url_abs || paper.url_pdf;
        if (!url || !paper.title) continue;
        const text = paper.title + ' ' + (paper.abstract ?? '').slice(0, 300);
        const cls = classifyItem(text, source.defaultCategory, source.alwaysAiTagged);
        items.push({
          id: `pwc-${paper.id}`,
          title: paper.title,
          url,
          sourceId: source.id,
          sourceName: source.name,
          sourceType: 'rss',
          sourceTier: tier,
          contentType: 'paper',
          ...cls,
          publishedAt: paper.published ? new Date(paper.published).toISOString() : new Date().toISOString(),
          summary: (paper.abstract ?? '').slice(0, 500),
          tags: [],
          score: paper.total_stars,
          thumbnail: paper.thumbnail_url ?? undefined,
        });
      }

    } else if (source.type === 'github') {
      // GitHub search API — trending repos in a topic
      const res = await fetch(source.url, {
        headers: { ...headers, Accept: 'application/vnd.github.v3+json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const data = await res.json() as { items: Array<{ id: number; full_name: string; html_url: string; description: string | null; stargazers_count: number; updated_at: string; created_at: string; language: string | null; topics?: string[] }> };
      for (const repo of data.items ?? []) {
        const text = repo.full_name + ' ' + (repo.description ?? '') + ' ' + (repo.topics?.join(' ') ?? '');
        const cls = classifyItem(text, source.defaultCategory, source.alwaysAiTagged);
        items.push({
          id: `github-${repo.id}`,
          title: repo.full_name,
          url: repo.html_url,
          sourceId: source.id,
          sourceName: source.name,
          sourceType: 'github',
          sourceTier: tier,
          contentType: 'repo',
          ...cls,
          publishedAt: repo.updated_at,
          summary: repo.description ?? '',
          tags: repo.topics ?? [],
          repoLanguage: repo.language ?? undefined,
          repoTopics: repo.topics ?? [],
          score: repo.stargazers_count,
        });
      }

    } else {
      // RSS / Atom
      const res = await fetch(source.url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) return [];
      const xml = await res.text();
      const parsed = parseRssItems(xml);
      for (const p of parsed) {
        const text = p.title + ' ' + p.summary;
        const cls = classifyItem(text, source.defaultCategory, source.alwaysAiTagged);
        items.push({
          id: `rss-${source.id}-${Buffer.from(p.url).toString('base64').slice(0, 12)}`,
          title: p.title,
          url: p.url,
          sourceId: source.id,
          sourceName: source.name,
          sourceType: 'rss',
          sourceTier: tier,
          contentType: getContentType('rss', source.id),
          ...cls,
          publishedAt: p.publishedAt,
          summary: p.summary,
          tags: [],
          thumbnail: p.thumbnail,
        });
      }
    }
  } catch {
    // Source temporarily unavailable — skip silently
  }

  return items;
}

// ── Main aggregator ──────────────────────────────────────────────────────────
export async function fetchAllSources(sources: FeedSource[]): Promise<FeedItem[]> {
  const results = await Promise.allSettled(sources.map(s => fetchSource(s)));
  const all: FeedItem[] = [];
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();

  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const item of r.value) {
      const urlKey = urlId(item.url);
      const titleKey = normalizeTitle(item.title);
      if (!seenUrls.has(urlKey) && !seenTitles.has(titleKey)) {
        seenUrls.add(urlKey);
        seenTitles.add(titleKey);
        all.push(item);
      }
    }
  }

  return all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
