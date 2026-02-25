import type { FeedSource } from './types';

export const FEED_SOURCES: FeedSource[] = [
  // ── AI ───────────────────────────────────────────────────────────────────
  { id: 'hn-ai', name: 'Hacker News', url: 'https://hn.algolia.com/api/v1/search?tags=story&query=AI+machine+learning&hitsPerPage=25', type: 'hn', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'reddit-ml', name: 'r/MachineLearning', url: 'https://www.reddit.com/r/MachineLearning.json?limit=25', type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'reddit-ai', name: 'r/artificial', url: 'https://www.reddit.com/r/artificial.json?limit=25', type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'reddit-llm', name: 'r/LocalLLaMA', url: 'https://www.reddit.com/r/LocalLLaMA.json?limit=25', type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'reddit-openai', name: 'r/OpenAI', url: 'https://www.reddit.com/r/OpenAI.json?limit=25', type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'techcrunch-ai', name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'venturebeat-ai', name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'wired-ai', name: 'Wired AI', url: 'https://www.wired.com/feed/category/artificial-intelligence/latest/rss', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'mit-news', name: 'MIT News AI', url: 'https://news.mit.edu/rss/topic/artificial-intelligence2', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'deepmind-blog', name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'openai-blog', name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'importai', name: 'Import AI', url: 'https://jack-clark.net/feed/', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'thesequence', name: 'TheSequence', url: 'https://thesequence.substack.com/feed', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'aiweekly', name: 'AI Weekly', url: 'https://aiweekly.co/issues.rss', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'reddit-datascience', name: 'r/datascience', url: 'https://www.reddit.com/r/datascience.json?limit=25', type: 'reddit', defaultCategory: 'ai' },

  // ── BUSINESS ─────────────────────────────────────────────────────────────
  { id: 'tc-startups', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'rss', defaultCategory: 'business' },
  { id: 'hbr', name: 'Harvard Business Review', url: 'https://hbr.org/stories.rss', type: 'rss', defaultCategory: 'business' },
  { id: 'reddit-entrepreneur', name: 'r/Entrepreneur', url: 'https://www.reddit.com/r/Entrepreneur.json?limit=25', type: 'reddit', defaultCategory: 'business' },
  { id: 'ft-tech', name: 'Financial Times Tech', url: 'https://www.ft.com/technology?format=rss', type: 'rss', defaultCategory: 'business' },
  { id: 'fortune-tech', name: 'Fortune Tech', url: 'https://fortune.com/feed/', type: 'rss', defaultCategory: 'business' },

  // ── SPORTS ───────────────────────────────────────────────────────────────
  { id: 'reddit-sports', name: 'r/sports', url: 'https://www.reddit.com/r/sports.json?limit=25', type: 'reddit', defaultCategory: 'sports' },
  { id: 'reddit-nfl', name: 'r/nfl', url: 'https://www.reddit.com/r/nfl.json?limit=25', type: 'reddit', defaultCategory: 'sports' },
  { id: 'reddit-nba', name: 'r/nba', url: 'https://www.reddit.com/r/nba.json?limit=25', type: 'reddit', defaultCategory: 'sports' },
  { id: 'espn', name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', type: 'rss', defaultCategory: 'sports' },
  { id: 'bleacher-report', name: 'Bleacher Report', url: 'https://bleacherreport.com/articles/feed', type: 'rss', defaultCategory: 'sports' },
  { id: 'hn-sports-ai', name: 'HN Sports Tech', url: 'https://hn.algolia.com/api/v1/search?tags=story&query=sports+AI+analytics&hitsPerPage=15', type: 'hn', defaultCategory: 'sports' },

  // ── SCIENCE ──────────────────────────────────────────────────────────────
  { id: 'nature', name: 'Nature', url: 'https://www.nature.com/nature.rss', type: 'rss', defaultCategory: 'science' },
  { id: 'science-mag', name: 'Science Magazine', url: 'https://www.science.org/action/showFeed?type=axatoc&feed=rss&jc=science', type: 'rss', defaultCategory: 'science' },
  { id: 'phys-org', name: 'Phys.org', url: 'https://phys.org/rss-feed/breaking/', type: 'rss', defaultCategory: 'science' },
  { id: 'reddit-science', name: 'r/science', url: 'https://www.reddit.com/r/science.json?limit=25', type: 'reddit', defaultCategory: 'science' },
  { id: 'newscientist', name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/?cmpid=RSS|NSNS|2012-GLOBAL|home', type: 'rss', defaultCategory: 'science' },
  { id: 'arxiv-cs-ai', name: 'arXiv CS.AI', url: 'https://rss.arxiv.org/rss/cs.AI', type: 'rss', defaultCategory: 'science', alwaysAiTagged: true },

  // ── HEALTH ───────────────────────────────────────────────────────────────
  { id: 'medscape', name: 'Medscape', url: 'https://www.medscape.com/cx/rssfeeds/2685.xml', type: 'rss', defaultCategory: 'health' },
  { id: 'stat-news', name: 'STAT News', url: 'https://www.statnews.com/feed/', type: 'rss', defaultCategory: 'health' },
  { id: 'reddit-medicine', name: 'r/medicine', url: 'https://www.reddit.com/r/medicine.json?limit=25', type: 'reddit', defaultCategory: 'health' },
  { id: 'who-news', name: 'WHO News', url: 'https://www.who.int/rss-feeds/news-english.xml', type: 'rss', defaultCategory: 'health' },
  { id: 'nih-news', name: 'NIH News', url: 'https://www.nih.gov/news-events/news-releases/rss.xml', type: 'rss', defaultCategory: 'health' },

  // ── NUTRITION ────────────────────────────────────────────────────────────
  { id: 'reddit-nutrition', name: 'r/nutrition', url: 'https://www.reddit.com/r/nutrition.json?limit=25', type: 'reddit', defaultCategory: 'nutrition' },
  { id: 'reddit-fitness-nutrition', name: 'r/loseit', url: 'https://www.reddit.com/r/loseit.json?limit=15', type: 'reddit', defaultCategory: 'nutrition' },
  { id: 'examine', name: 'Examine.com', url: 'https://examine.com/feed/', type: 'rss', defaultCategory: 'nutrition' },
  { id: 'healthline-nutrition', name: 'Healthline Nutrition', url: 'https://www.healthline.com/nutrition/rss', type: 'rss', defaultCategory: 'nutrition' },

  // ── FARMING ──────────────────────────────────────────────────────────────
  { id: 'reddit-farming', name: 'r/farming', url: 'https://www.reddit.com/r/farming.json?limit=25', type: 'reddit', defaultCategory: 'farming' },
  { id: 'reddit-agriculture', name: 'r/agriculture', url: 'https://www.reddit.com/r/agriculture.json?limit=25', type: 'reddit', defaultCategory: 'farming' },
  { id: 'agweb', name: 'AgWeb', url: 'https://www.agweb.com/rss', type: 'rss', defaultCategory: 'farming' },
  { id: 'farmprogress', name: 'Farm Progress', url: 'https://www.farmprogress.com/rss', type: 'rss', defaultCategory: 'farming' },

  // ── ENTERTAINMENT ─────────────────────────────────────────────────────────
  { id: 'variety', name: 'Variety', url: 'https://variety.com/feed/', type: 'rss', defaultCategory: 'entertainment' },
  { id: 'hollywood-reporter', name: 'Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/', type: 'rss', defaultCategory: 'entertainment' },
  { id: 'reddit-movies', name: 'r/movies', url: 'https://www.reddit.com/r/movies.json?limit=25', type: 'reddit', defaultCategory: 'entertainment' },
  { id: 'reddit-music', name: 'r/Music', url: 'https://www.reddit.com/r/Music.json?limit=25', type: 'reddit', defaultCategory: 'entertainment' },
  { id: 'pitchfork', name: 'Pitchfork', url: 'https://pitchfork.com/feed/feed-news/rss', type: 'rss', defaultCategory: 'entertainment' },

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  { id: 'edweek', name: 'Education Week', url: 'https://www.edweek.org/ew/rss/all.xml', type: 'rss', defaultCategory: 'education' },
  { id: 'reddit-education', name: 'r/education', url: 'https://www.reddit.com/r/education.json?limit=25', type: 'reddit', defaultCategory: 'education' },
  { id: 'edsurge', name: 'EdSurge', url: 'https://www.edsurge.com/feeds/stories.rss', type: 'rss', defaultCategory: 'education' },
  { id: 'mit-edtech', name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', type: 'rss', defaultCategory: 'education' },

  // ── LAW ──────────────────────────────────────────────────────────────────
  { id: 'reddit-law', name: 'r/law', url: 'https://www.reddit.com/r/law.json?limit=25', type: 'reddit', defaultCategory: 'law' },
  { id: 'lawdotcom', name: 'Law.com', url: 'https://www.law.com/rss/', type: 'rss', defaultCategory: 'law' },
  { id: 'scotusblog', name: 'SCOTUSblog', url: 'https://www.scotusblog.com/feed/', type: 'rss', defaultCategory: 'law' },

  // ── GAMING ───────────────────────────────────────────────────────────────
  { id: 'reddit-gaming', name: 'r/gaming', url: 'https://www.reddit.com/r/gaming.json?limit=25', type: 'reddit', defaultCategory: 'gaming' },
  { id: 'ign', name: 'IGN', url: 'https://feeds.ign.com/ign/articles', type: 'rss', defaultCategory: 'gaming' },
  { id: 'kotaku', name: 'Kotaku', url: 'https://kotaku.com/rss', type: 'rss', defaultCategory: 'gaming' },
  { id: 'reddit-gamedev', name: 'r/gamedev', url: 'https://www.reddit.com/r/gamedev.json?limit=25', type: 'reddit', defaultCategory: 'gaming' },
  { id: 'pcgamer', name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/', type: 'rss', defaultCategory: 'gaming' },

  // ── SPACE ────────────────────────────────────────────────────────────────
  { id: 'spacenews', name: 'SpaceNews', url: 'https://spacenews.com/feed/', type: 'rss', defaultCategory: 'space' },
  { id: 'nasa-news', name: 'NASA Breaking News', url: 'https://www.nasa.gov/news-release/feed/', type: 'rss', defaultCategory: 'space' },
  { id: 'reddit-space', name: 'r/space', url: 'https://www.reddit.com/r/space.json?limit=25', type: 'reddit', defaultCategory: 'space' },
  { id: 'reddit-spacex', name: 'r/SpaceX', url: 'https://www.reddit.com/r/SpaceX.json?limit=25', type: 'reddit', defaultCategory: 'space' },
  { id: 'spaceflightnow', name: 'Spaceflight Now', url: 'https://spaceflightnow.com/feed/', type: 'rss', defaultCategory: 'space' },

  // ── ART ──────────────────────────────────────────────────────────────────
  { id: 'reddit-art', name: 'r/Art', url: 'https://www.reddit.com/r/Art.json?limit=25', type: 'reddit', defaultCategory: 'art' },
  { id: 'artnet', name: 'Artnet News', url: 'https://news.artnet.com/feed', type: 'rss', defaultCategory: 'art' },
  { id: 'reddit-midjourney', name: 'r/midjourney', url: 'https://www.reddit.com/r/midjourney.json?limit=25', type: 'reddit', defaultCategory: 'art', alwaysAiTagged: true },
  { id: 'designboom', name: 'Designboom', url: 'https://www.designboom.com/eng/rss/', type: 'rss', defaultCategory: 'art' },

  // ── ROBOTICS ─────────────────────────────────────────────────────────────
  { id: 'reddit-robotics', name: 'r/robotics', url: 'https://www.reddit.com/r/robotics.json?limit=25', type: 'reddit', defaultCategory: 'robotics', alwaysAiTagged: true },
  { id: 'ieee-robotics', name: 'IEEE Spectrum Robotics', url: 'https://spectrum.ieee.org/feeds/topic/robotics.rss', type: 'rss', defaultCategory: 'robotics', alwaysAiTagged: true },
  { id: 'techcrunch-robotics', name: 'TechCrunch Robotics', url: 'https://techcrunch.com/category/robotics/feed/', type: 'rss', defaultCategory: 'robotics', alwaysAiTagged: true },
  { id: 'hn-robotics', name: 'HN Robotics', url: 'https://hn.algolia.com/api/v1/search?tags=story&query=robotics+humanoid&hitsPerPage=15', type: 'hn', defaultCategory: 'robotics' },

  // ── CLIMATE ──────────────────────────────────────────────────────────────
  { id: 'carbonbrief', name: 'Carbon Brief', url: 'https://www.carbonbrief.org/feed', type: 'rss', defaultCategory: 'climate' },
  { id: 'reddit-climate', name: 'r/climate', url: 'https://www.reddit.com/r/climate.json?limit=25', type: 'reddit', defaultCategory: 'climate' },
  { id: 'guardian-climate', name: 'The Guardian Climate', url: 'https://www.theguardian.com/environment/climate-crisis/rss', type: 'rss', defaultCategory: 'climate' },
  { id: 'cleantechnica', name: 'CleanTechnica', url: 'https://cleantechnica.com/feed/', type: 'rss', defaultCategory: 'climate' },

  // ── CYBERSECURITY ────────────────────────────────────────────────────────
  { id: 'krebs', name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', type: 'rss', defaultCategory: 'cybersecurity' },
  { id: 'reddit-netsec', name: 'r/netsec', url: 'https://www.reddit.com/r/netsec.json?limit=25', type: 'reddit', defaultCategory: 'cybersecurity' },
  { id: 'darkreading', name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', type: 'rss', defaultCategory: 'cybersecurity' },
  { id: 'thehackernews', name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', type: 'rss', defaultCategory: 'cybersecurity' },
  { id: 'schneier', name: 'Schneier on Security', url: 'https://www.schneier.com/feed/atom/', type: 'rss', defaultCategory: 'cybersecurity' },

  // ── CRYPTO ───────────────────────────────────────────────────────────────
  { id: 'coindesk', name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', type: 'rss', defaultCategory: 'crypto' },
  { id: 'cointelegraph', name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', type: 'rss', defaultCategory: 'crypto' },
  { id: 'reddit-crypto', name: 'r/CryptoCurrency', url: 'https://www.reddit.com/r/CryptoCurrency.json?limit=25', type: 'reddit', defaultCategory: 'crypto' },
  { id: 'decrypt', name: 'Decrypt', url: 'https://decrypt.co/feed', type: 'rss', defaultCategory: 'crypto' },

  // ── POLITICS ─────────────────────────────────────────────────────────────
  { id: 'politico-tech', name: 'Politico Tech', url: 'https://www.politico.com/rss/technology.xml', type: 'rss', defaultCategory: 'politics' },
  { id: 'reddit-politics', name: 'r/politics', url: 'https://www.reddit.com/r/politics.json?limit=25', type: 'reddit', defaultCategory: 'politics' },
  { id: 'thehill', name: 'The Hill Tech', url: 'https://thehill.com/technology/feed/', type: 'rss', defaultCategory: 'politics' },

  // ── ENERGY ───────────────────────────────────────────────────────────────
  { id: 'oilprice', name: 'OilPrice.com', url: 'https://oilprice.com/rss/main', type: 'rss', defaultCategory: 'energy' },
  { id: 'energymonitor', name: 'Energy Monitor', url: 'https://www.energymonitor.ai/feed/', type: 'rss', defaultCategory: 'energy' },
  { id: 'reddit-energy', name: 'r/energy', url: 'https://www.reddit.com/r/energy.json?limit=25', type: 'reddit', defaultCategory: 'energy' },
  { id: 'electrek', name: 'Electrek', url: 'https://electrek.co/feed/', type: 'rss', defaultCategory: 'energy' },

  // ── ETHICS ───────────────────────────────────────────────────────────────
  { id: 'reddit-aiethics', name: 'r/AIethics', url: 'https://www.reddit.com/r/AIethics.json?limit=25', type: 'reddit', defaultCategory: 'ethics', alwaysAiTagged: true },
  { id: 'ainowinstitute', name: 'AI Now Institute', url: 'https://ainowinstitute.org/feed', type: 'rss', defaultCategory: 'ethics', alwaysAiTagged: true },
  { id: 'algorithmic-watch', name: 'AlgorithmWatch', url: 'https://algorithmwatch.org/en/feed/', type: 'rss', defaultCategory: 'ethics', alwaysAiTagged: true },
  { id: 'hn-ethics', name: 'HN AI Ethics', url: 'https://hn.algolia.com/api/v1/search?tags=story&query=AI+ethics+alignment+safety&hitsPerPage=15', type: 'hn', defaultCategory: 'ethics', alwaysAiTagged: true },
];
