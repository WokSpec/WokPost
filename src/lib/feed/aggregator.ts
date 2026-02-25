import type { Category, FeedItem, FeedSource } from './types';

const AI_KEYWORDS = [
  'artificial intelligence','machine learning','deep learning','neural network',
  'large language model','llm','gpt','chatgpt','claude','gemini','mistral',
  'openai','anthropic','google deepmind','meta ai','hugging face',
  'generative ai','ai model','ai system','ai tool','ai-powered','ai-generated',
  'stable diffusion','diffusion model','transformer','embeddings','fine-tuning',
  'reinforcement learning','computer vision','natural language processing','nlp',
  'automation','algorithm','robot','robotics','autonomous',
];

const DOMAIN_KEYWORDS: Record<Category, string[]> = {
  ai:            AI_KEYWORDS,
  business:      ['startup','funding','revenue','market','enterprise','ipo','acquisition','profit','economy','investment','venture capital','saas'],
  sports:        ['nfl','nba','mlb','soccer','football','basketball','athlete','game','match','tournament','championship','league','team','player'],
  science:       ['research','study','experiment','discovery','physics','biology','chemistry','genome','quantum','particle','scientific','lab','journal'],
  health:        ['health','medicine','medical','hospital','disease','treatment','therapy','drug','clinical','patient','doctor','surgery','cancer','vaccine'],
  nutrition:     ['nutrition','diet','food','protein','calorie','vitamin','mineral','gut','metabolism','eating','recipe','meal'],
  farming:       ['farming','agriculture','crop','harvest','soil','pesticide','livestock','irrigation','drought','farmer','food supply','agri'],
  entertainment: ['movie','film','music','album','concert','celebrity','streaming','netflix','hollywood','tv show','television','entertainment','box office'],
  education:     ['education','school','university','student','teacher','learning','classroom','curriculum','edtech','tutoring','degree','college'],
  law:           ['law','legal','court','judge','regulation','policy','legislation','lawsuit','rights','compliance','attorney','supreme court','congress'],
  gaming:        ['game','gaming','video game','esport','console','steam','playstation','xbox','nintendo','developer','indie','pc gaming','mobile game'],
  space:         ['space','nasa','spacex','rocket','satellite','astronaut','mars','moon','orbit','telescope','galaxy','cosmos','launch','spacecraft'],
  art:           ['art','design','creative','artist','illustration','painting','photography','sculpture','gallery','generative','graphic design'],
  robotics:      ['robot','robotics','actuator','servo','autonomous vehicle','drone','humanoid','boston dynamics','mechanical','hardware','arduino'],
  climate:       ['climate','environment','carbon','emission','renewable','solar','wind energy','fossil fuel','global warming','sustainability','green'],
  cybersecurity: ['cybersecurity','hacking','ransomware','vulnerability','exploit','breach','malware','phishing','encryption','zero-day','infosec','security'],
  crypto:        ['crypto','bitcoin','ethereum','blockchain','defi','nft','token','cryptocurrency','web3','wallet','mining','exchange','stablecoin'],
  politics:      ['politics','election','president','congress','senate','democrat','republican','government','policy','vote','legislation','white house'],
  energy:        ['energy','electricity','grid','nuclear','solar panel','wind turbine','battery','ev','electric vehicle','oil','gas','power plant'],
  ethics:        ['ethics','bias','fairness','alignment','safety','regulation','philosophy','moral','privacy','surveillance','accountability','singularity'],
};

function scoreText(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
}

export function classifyItem(text: string, defaultCategory: Category, alwaysAiTagged = false) {
  const aiHits = scoreText(text, AI_KEYWORDS);
  const aiScore = Math.min(10, Math.max(1, Math.round((aiHits / 3) * 10)));
  const aiTagged = alwaysAiTagged || aiHits >= 2;

  let bestCategory: Category = defaultCategory;
  let bestScore = 0;
  for (const [cat, keywords] of Object.entries(DOMAIN_KEYWORDS) as [Category, string[]][]) {
    if (cat === 'ai') continue;
    const s = scoreText(text, keywords);
    if (s > bestScore) { bestScore = s; bestCategory = cat; }
  }

  const category: Category = bestScore >= 2 ? bestCategory : defaultCategory;
  return { category, aiTagged, aiScore };
}

function extractText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!m) return '';
  return m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i'));
  return m ? m[1] : '';
}

function parseRssItems(xml: string) {
  const items: { title: string; url: string; publishedAt: string; summary: string }[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const c = m[1];
    const title = extractText(c, 'title');
    const link = extractText(c, 'link') || extractAttr(c, 'link', 'href');
    const pubDate = extractText(c, 'pubDate') || extractText(c, 'published') || extractText(c, 'dc:date');
    const desc = extractText(c, 'description') || extractText(c, 'content:encoded') || extractText(c, 'summary');
    if (title && link) items.push({ title, url: link, publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(), summary: desc.slice(0, 300) });
  }
  return items.slice(0, 15);
}

function urlId(url: string): string {
  try { return new URL(url).pathname; } catch { return url; }
}

async function fetchSource(source: FeedSource): Promise<FeedItem[]> {
  const headers = { 'User-Agent': 'WokPost/1.0 (+https://wokpost.wokspec.org)' };
  const items: FeedItem[] = [];

  try {
    if (source.type === 'hn') {
      const res = await fetch(source.url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) return [];
      const data = await res.json() as { hits: { objectID: string; title: string; url?: string; story_url?: string; created_at: string; points: number; num_comments: number }[] };
      for (const hit of data.hits ?? []) {
        const url = hit.url || hit.story_url;
        if (!url) continue;
        const cls = classifyItem(hit.title, source.defaultCategory, source.alwaysAiTagged);
        items.push({ id: `hn-${hit.objectID}`, title: hit.title, url, sourceId: source.id, sourceName: source.name, sourceType: 'hn', ...cls, publishedAt: hit.created_at, summary: '', tags: [], score: hit.points, commentCount: hit.num_comments });
      }
    } else if (source.type === 'reddit') {
      const res = await fetch(source.url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) return [];
      const data = await res.json() as { data: { children: { data: { id: string; title: string; url: string; created_utc: number; selftext: string; score: number; num_comments: number } }[] } };
      for (const child of data.data?.children ?? []) {
        const p = child.data;
        if (!p.url || p.url.includes('reddit.com/r/')) continue;
        const cls = classifyItem(p.title + ' ' + (p.selftext ?? '').slice(0, 200), source.defaultCategory, source.alwaysAiTagged);
        items.push({ id: `reddit-${p.id}`, title: p.title, url: p.url, sourceId: source.id, sourceName: source.name, sourceType: 'reddit', ...cls, publishedAt: new Date(p.created_utc * 1000).toISOString(), summary: p.selftext?.slice(0, 300) ?? '', tags: [], score: p.score, commentCount: p.num_comments });
      }
    } else {
      const res = await fetch(source.url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) return [];
      const xml = await res.text();
      for (const p of parseRssItems(xml)) {
        const cls = classifyItem(p.title + ' ' + p.summary, source.defaultCategory, source.alwaysAiTagged);
        const b64id = Buffer.from(p.url).toString('base64').slice(0, 12);
        items.push({ id: `rss-${source.id}-${b64id}`, title: p.title, url: p.url, sourceId: source.id, sourceName: source.name, sourceType: 'rss', ...cls, publishedAt: p.publishedAt, summary: p.summary, tags: [] });
      }
    }
  } catch { /* skip unavailable source */ }

  return items;
}

export async function fetchAllSources(sources: FeedSource[]): Promise<FeedItem[]> {
  const results = await Promise.allSettled(sources.map(s => fetchSource(s)));
  const all: FeedItem[] = [];
  const seen = new Set<string>();

  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const item of r.value) {
      const key = urlId(item.url);
      if (!seen.has(key)) { seen.add(key); all.push(item); }
    }
  }

  return all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
