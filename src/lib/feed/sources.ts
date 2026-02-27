import type { FeedSource } from './types';

export const FEED_SOURCES: FeedSource[] = [

  // ══════════════════════════════════════════════════════════════════
  // AI & RESEARCH — Foundation models, papers, lab blogs, benchmarks
  // ══════════════════════════════════════════════════════════════════

  // Lab & company blogs (tier 1)
  { id: 'rss-openai-blog',    name: 'OpenAI Blog',        url: 'https://openai.com/blog/rss.xml',                                         type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-deepmind',       name: 'Google DeepMind',    url: 'https://deepmind.google/blog/feed/basic/',                                type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-googleblog-ai',  name: 'Google AI Blog',     url: 'https://blog.google/technology/ai/rss/',                                  type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-hf-blog',        name: 'Hugging Face Blog',  url: 'https://huggingface.co/blog/feed.xml',                                    type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-bair',           name: 'BAIR Blog',          url: 'https://bair.berkeley.edu/blog/feed.xml',                                 type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-gradient',       name: 'The Gradient',       url: 'https://thegradient.pub/rss/',                                            type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-distill',        name: 'Distill.pub',        url: 'https://distill.pub/rss.xml',                                             type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },

  // arXiv research feeds (tier 1) — published daily
  { id: 'arxiv-cs-ai',        name: 'arXiv · CS.AI',      url: 'https://export.arxiv.org/rss/cs.AI',                                      type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'arxiv-cs-lg',        name: 'arXiv · ML',         url: 'https://export.arxiv.org/rss/cs.LG',                                      type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'arxiv-cs-cl',        name: 'arXiv · NLP',        url: 'https://export.arxiv.org/rss/cs.CL',                                      type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'arxiv-cs-cv',        name: 'arXiv · Vision',     url: 'https://export.arxiv.org/rss/cs.CV',                                      type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },
  { id: 'arxiv-cs-ro',        name: 'arXiv · Robotics',   url: 'https://export.arxiv.org/rss/cs.RO',                                      type: 'rss',    defaultCategory: 'robotics', alwaysAiTagged: true, tier: 1 },
  { id: 'arxiv-cs-cr',        name: 'arXiv · Security',   url: 'https://export.arxiv.org/rss/cs.CR',                                      type: 'rss',    defaultCategory: 'cybersecurity', tier: 1 },

  // Papers with Code (tier 1) — ML papers with implementations
  { id: 'pwc-latest',         name: 'Papers with Code',   url: 'https://paperswithcode.com/api/v1/papers/?ordering=-published&page_size=20', type: 'pwc', defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },

  // GitHub trending AI/ML repos (tier 2)
  { id: 'gh-llm',             name: 'GitHub · LLM Repos', url: 'https://api.github.com/search/repositories?q=topic:llm+stars:>200+pushed:>2024-01-01&sort=updated&order=desc&per_page=12',          type: 'github', defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'gh-ai-tools',        name: 'GitHub · AI Tools',  url: 'https://api.github.com/search/repositories?q=topic:artificial-intelligence+stars:>500+pushed:>2024-01-01&sort=updated&per_page=10', type: 'github', defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },

  // Premium tech journalism (tier 1-2)
  { id: 'hn-ai',              name: 'Hacker News',        url: 'https://hn.algolia.com/api/v1/search?tags=story&query=artificial+intelligence&hitsPerPage=20', type: 'hn', defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-verge-ai',       name: 'The Verge AI',       url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',        type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-ars',            name: 'Ars Technica',       url: 'https://feeds.arstechnica.com/arstechnica/index',                          type: 'rss',    defaultCategory: 'ai', tier: 2 },
  { id: 'rss-mit-tech',       name: 'MIT Tech Review',    url: 'https://www.technologyreview.com/feed/',                                   type: 'rss',    defaultCategory: 'ai', tier: 1 },
  { id: 'rss-venturebeat',    name: 'VentureBeat AI',     url: 'https://venturebeat.com/category/ai/feed/',                                type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-tc-ai',          name: 'TechCrunch AI',      url: 'https://techcrunch.com/category/artificial-intelligence/feed/',            type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-wired-ai',       name: 'Wired AI',           url: 'https://www.wired.com/feed/category/artificial-intelligence/latest/rss',   type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-ieee',           name: 'IEEE Spectrum',      url: 'https://spectrum.ieee.org/feeds/feed.rss',                                 type: 'rss',    defaultCategory: 'ai', tier: 1 },
  { id: 'rss-ainews',         name: 'AI News',            url: 'https://www.artificialintelligence-news.com/feed/',                        type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-zdnet-ai',       name: 'ZDNet AI',           url: 'https://www.zdnet.com/topic/artificial-intelligence/rss.xml',              type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },

  // Top-tier AI Reddit (only research-grade communities)
  { id: 'r-ml',               name: 'r/MachineLearning',  url: 'https://www.reddit.com/r/MachineLearning.json?limit=25&sort=top&t=day',    type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'r-localllama',       name: 'r/LocalLLaMA',       url: 'https://www.reddit.com/r/LocalLLaMA.json?limit=25&sort=hot',              type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'r-artificial',       name: 'r/artificial',       url: 'https://www.reddit.com/r/artificial.json?limit=20&sort=top&t=day',        type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true, tier: 3 },
  { id: 'r-datascience',      name: 'r/datascience',      url: 'https://www.reddit.com/r/datascience.json?limit=20&sort=top&t=day',       type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true, tier: 3 },
  { id: 'r-futurology',       name: 'r/Futurology',       url: 'https://www.reddit.com/r/Futurology.json?limit=20&sort=top&t=day',        type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true, tier: 3 },


  // ══════════════════════════════════════════════════════════════════
  // SCIENCE — Peer-reviewed, journals, science journalism
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-nature',         name: 'Nature',             url: 'https://www.nature.com/nature.rss',                                        type: 'rss',    defaultCategory: 'science', tier: 1 },
  { id: 'rss-science-aaas',   name: 'Science (AAAS)',     url: 'https://www.science.org/rss/news_current.xml',                             type: 'rss',    defaultCategory: 'science', tier: 1 },
  { id: 'rss-cell',           name: 'Cell',               url: 'https://www.cell.com/rss/home-page',                                       type: 'rss',    defaultCategory: 'science', tier: 1 },
  { id: 'rss-pnas',           name: 'PNAS',               url: 'https://www.pnas.org/rss/current.xml',                                     type: 'rss',    defaultCategory: 'science', tier: 1 },
  { id: 'rss-quanta',         name: 'Quanta Magazine',    url: 'https://www.quantamagazine.org/feed/',                                     type: 'rss',    defaultCategory: 'science', tier: 1 },
  { id: 'rss-eurekalert',     name: 'EurekAlert',         url: 'https://www.eurekalert.org/rss/technology_engineering.xml',                type: 'rss',    defaultCategory: 'science', tier: 2 },
  { id: 'rss-sciencedaily',   name: 'ScienceDaily',       url: 'https://www.sciencedaily.com/rss/top.xml',                                 type: 'rss',    defaultCategory: 'science', tier: 2 },
  { id: 'rss-physorg',        name: 'Phys.org',           url: 'https://phys.org/rss-feed/',                                               type: 'rss',    defaultCategory: 'science', tier: 2 },
  { id: 'rss-newscientist',   name: 'New Scientist',      url: 'https://www.newscientist.com/feed/home/',                                  type: 'rss',    defaultCategory: 'science', tier: 2 },
  { id: 'rss-sciam',          name: 'Scientific American',url: 'https://www.scientificamerican.com/feed/',                                 type: 'rss',    defaultCategory: 'science', tier: 2 },
  { id: 'bbc-science',        name: 'BBC Science',        url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',             type: 'rss',    defaultCategory: 'science', tier: 1 },
  { id: 'gdn-science',        name: 'Guardian Science',   url: 'https://www.theguardian.com/science/rss',                                  type: 'rss',    defaultCategory: 'science', tier: 1 },
  { id: 'rss-livescience',    name: 'Live Science',       url: 'https://www.livescience.com/feeds/all',                                    type: 'rss',    defaultCategory: 'science', tier: 2 },
  { id: 'rss-popsci',         name: 'Popular Science',    url: 'https://www.popsci.com/feed/',                                             type: 'rss',    defaultCategory: 'science', tier: 2 },
  { id: 'npr-science',        name: 'NPR Science',        url: 'https://feeds.npr.org/1007/rss.xml',                                       type: 'rss',    defaultCategory: 'science', tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // HEALTH & MEDICINE — Clinical journals, health journalism
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-nejm',           name: 'NEJM',               url: 'https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss',          type: 'rss',    defaultCategory: 'health', tier: 1 },
  { id: 'rss-stat-news',      name: 'STAT News',          url: 'https://www.statnews.com/feed/',                                           type: 'rss',    defaultCategory: 'health', tier: 1 },
  { id: 'rss-nature-med',     name: 'Nature Medicine',    url: 'https://www.nature.com/nm.rss',                                            type: 'rss',    defaultCategory: 'health', tier: 1 },
  { id: 'rss-bmj',            name: 'The BMJ',            url: 'https://www.bmj.com/rss/etoc.xml',                                         type: 'rss',    defaultCategory: 'health', tier: 1 },
  { id: 'rss-nih',            name: 'NIH News',           url: 'https://www.nih.gov/news-events/news-releases/feed',                       type: 'rss',    defaultCategory: 'health', tier: 1 },
  { id: 'rss-who',            name: 'WHO News',           url: 'https://www.who.int/rss-feeds/news-english.xml',                           type: 'rss',    defaultCategory: 'health', tier: 1 },
  { id: 'rss-fierce-health',  name: 'Fierce Healthcare',  url: 'https://www.fiercehealthcare.com/rss/xml',                                 type: 'rss',    defaultCategory: 'health', tier: 2 },
  { id: 'rss-medicalxpress',  name: 'Medical Xpress',     url: 'https://medicalxpress.com/rss-feed/',                                      type: 'rss',    defaultCategory: 'health', tier: 2 },
  { id: 'bbc-health',         name: 'BBC Health',         url: 'http://feeds.bbci.co.uk/news/health/rss.xml',                              type: 'rss',    defaultCategory: 'health', tier: 1 },
  { id: 'gdn-health',         name: 'Guardian Health',    url: 'https://www.theguardian.com/society/health/rss',                           type: 'rss',    defaultCategory: 'health', tier: 1 },
  { id: 'npr-health',         name: 'NPR Health',         url: 'https://feeds.npr.org/1128/rss.xml',                                       type: 'rss',    defaultCategory: 'health', tier: 1 },
  { id: 'rss-healthline',     name: 'Healthline',         url: 'https://www.healthline.com/rss/health-news',                               type: 'rss',    defaultCategory: 'health', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // BUSINESS & FINANCE — Tier-1 financial journalism
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-ft-tech',        name: 'Financial Times',    url: 'https://www.ft.com/technology?format=rss',                                 type: 'rss',    defaultCategory: 'business', tier: 1 },
  { id: 'rss-bloomberg-tech', name: 'Bloomberg Tech',     url: 'https://feeds.bloomberg.com/technology/news.rss',                          type: 'rss',    defaultCategory: 'business', tier: 1 },
  { id: 'rss-hbr',            name: 'Harvard Business Review', url: 'https://feeds.hbr.org/harvardbusiness',                              type: 'rss',    defaultCategory: 'business', tier: 1 },
  { id: 'rss-fortune',        name: 'Fortune',            url: 'https://fortune.com/feed',                                                 type: 'rss',    defaultCategory: 'business', tier: 2 },
  { id: 'rss-reuters-biz',    name: 'Reuters Business',   url: 'https://feeds.reuters.com/reuters/businessNews',                           type: 'rss',    defaultCategory: 'business', tier: 1 },
  { id: 'rss-restofworld',    name: 'Rest of World',      url: 'https://restofworld.org/feed/articles',                                    type: 'rss',    defaultCategory: 'business', tier: 2 },
  { id: 'rss-cnbc-biz',       name: 'CNBC Business',      url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html',                     type: 'rss',    defaultCategory: 'business', tier: 2 },
  { id: 'rss-cnbc-tech',      name: 'CNBC Technology',    url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html',                     type: 'rss',    defaultCategory: 'business', tier: 2 },
  { id: 'bbc-business',       name: 'BBC Business',       url: 'http://feeds.bbci.co.uk/news/business/rss.xml',                            type: 'rss',    defaultCategory: 'business', tier: 1 },
  { id: 'gdn-business',       name: 'Guardian Business',  url: 'https://www.theguardian.com/business/rss',                                 type: 'rss',    defaultCategory: 'business', tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // CYBERSECURITY — Research, threat intelligence, advisories
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-cisa',           name: 'CISA Alerts',        url: 'https://www.cisa.gov/uscert/ncas/alerts.xml',                              type: 'rss',    defaultCategory: 'cybersecurity', tier: 1 },
  { id: 'rss-sans-isc',       name: 'SANS ISC',           url: 'https://isc.sans.edu/rssfeed.xml',                                         type: 'rss',    defaultCategory: 'cybersecurity', tier: 1 },
  { id: 'rss-krebs',          name: 'Krebs on Security',  url: 'https://krebsonsecurity.com/feed/',                                        type: 'rss',    defaultCategory: 'cybersecurity', tier: 1 },
  { id: 'rss-dark-reading',   name: 'Dark Reading',       url: 'https://www.darkreading.com/rss.xml',                                      type: 'rss',    defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'rss-securityweek',   name: 'SecurityWeek',       url: 'https://feeds.feedburner.com/securityweek',                                type: 'rss',    defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'rss-wired-security', name: 'Wired Security',     url: 'https://www.wired.com/feed/category/security/latest/rss',                  type: 'rss',    defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'rss-ars-security',   name: 'Ars Security',       url: 'https://feeds.arstechnica.com/arstechnica/security',                       type: 'rss',    defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'rss-thhn',           name: 'The Hacker News',    url: 'https://feeds.feedburner.com/TheHackersNews',                              type: 'rss',    defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'rss-bleeping',       name: 'BleepingComputer',   url: 'https://www.bleepingcomputer.com/feed/',                                   type: 'rss',    defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'rss-register',       name: 'The Register',       url: 'https://www.theregister.com/headlines.atom',                               type: 'rss',    defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'r-netsec',           name: 'r/netsec',           url: 'https://www.reddit.com/r/netsec.json?limit=20&sort=top&t=week',            type: 'reddit', defaultCategory: 'cybersecurity', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // CLIMATE & ENVIRONMENT — Science-backed, policy-focused
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-carbon-brief',   name: 'Carbon Brief',       url: 'https://www.carbonbrief.org/feed/',                                        type: 'rss',    defaultCategory: 'climate', tier: 1 },
  { id: 'rss-insideclimate',  name: 'Inside Climate News',url: 'https://insideclimatenews.org/feed/',                                      type: 'rss',    defaultCategory: 'climate', tier: 1 },
  { id: 'rss-yale-e360',      name: 'Yale Environment 360',url: 'https://e360.yale.edu/feed',                                              type: 'rss',    defaultCategory: 'climate', tier: 1 },
  { id: 'rss-nasa-climate',   name: 'NASA Climate',       url: 'https://climate.nasa.gov/feed.rss',                                        type: 'rss',    defaultCategory: 'climate', tier: 1 },
  { id: 'rss-cleantechnica',  name: 'CleanTechnica',      url: 'https://cleantechnica.com/feed/',                                          type: 'rss',    defaultCategory: 'climate', tier: 2 },
  { id: 'rss-desmog',         name: 'DeSmog',             url: 'https://www.desmog.com/feed/',                                             type: 'rss',    defaultCategory: 'climate', tier: 2 },
  { id: 'gdn-environ',        name: 'Guardian Environment',url: 'https://www.theguardian.com/environment/rss',                             type: 'rss',    defaultCategory: 'climate', tier: 1 },
  { id: 'rss-ehn',            name: 'Env. Health News',   url: 'https://www.ehn.org/feeds/rss',                                            type: 'rss',    defaultCategory: 'climate', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // AI ETHICS & SAFETY — Alignment, governance, philosophy
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-alignment-forum',name: 'Alignment Forum',    url: 'https://www.alignmentforum.org/feed.xml',                                  type: 'rss',    defaultCategory: 'ethics', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-stanford-hai',   name: 'Stanford HAI',       url: 'https://hai.stanford.edu/news/rss.xml',                                    type: 'rss',    defaultCategory: 'ethics', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-fli',            name: 'Future of Life Inst.',url: 'https://futureoflife.org/feed/',                                          type: 'rss',    defaultCategory: 'ethics', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-brookings-ai',   name: 'Brookings · AI',     url: 'https://www.brookings.edu/topic/artificial-intelligence/feed/',            type: 'rss',    defaultCategory: 'ethics', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-techpolicy',     name: 'Tech Policy Press',  url: 'https://techpolicy.press/feed/',                                           type: 'rss',    defaultCategory: 'ethics', alwaysAiTagged: true, tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // SPACE & EXPLORATION — Agencies, missions, astronomy
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-nasa',           name: 'NASA News',          url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',                           type: 'rss',    defaultCategory: 'space', tier: 1 },
  { id: 'rss-esa',            name: 'ESA News',           url: 'https://www.esa.int/rssfeed.xml',                                          type: 'rss',    defaultCategory: 'space', tier: 1 },
  { id: 'rss-universe-today', name: 'Universe Today',     url: 'https://www.universetoday.com/feed/',                                      type: 'rss',    defaultCategory: 'space', tier: 1 },
  { id: 'rss-spaceflight',    name: 'SpaceflightNow',     url: 'https://spaceflightnow.com/feed/',                                         type: 'rss',    defaultCategory: 'space', tier: 1 },
  { id: 'rss-spacenews',      name: 'SpaceNews',          url: 'https://spacenews.com/feed/',                                              type: 'rss',    defaultCategory: 'space', tier: 2 },
  { id: 'rss-space',          name: 'Space.com',          url: 'https://www.space.com/feeds/all',                                          type: 'rss',    defaultCategory: 'space', tier: 2 },
  { id: 'rss-skytel',         name: 'Sky & Telescope',    url: 'https://skyandtelescope.org/feed/',                                        type: 'rss',    defaultCategory: 'space', tier: 2 },
  { id: 'rss-astronomy',      name: 'Astronomy.com',      url: 'https://astronomy.com/news/feed',                                          type: 'rss',    defaultCategory: 'space', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // ROBOTICS & HARDWARE — Systems, embodied AI, manufacturing
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-ieee-rob',       name: 'IEEE · Robotics',    url: 'https://spectrum.ieee.org/topic/robotics/feed',                            type: 'rss',    defaultCategory: 'robotics', alwaysAiTagged: true, tier: 1 },
  { id: 'rss-robot-report',   name: 'The Robot Report',   url: 'https://www.therobotreport.com/feed/',                                     type: 'rss',    defaultCategory: 'robotics', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-rbr',            name: 'Robotics Business',  url: 'https://www.roboticsbusinessreview.com/feed/',                             type: 'rss',    defaultCategory: 'robotics', alwaysAiTagged: true, tier: 2 },
  { id: 'gh-robotics',        name: 'GitHub · Robotics',  url: 'https://api.github.com/search/repositories?q=topic:robotics+stars:>100+pushed:>2024-01-01&sort=updated&per_page=10', type: 'github', defaultCategory: 'robotics', alwaysAiTagged: true, tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // LAW & POLICY — Courts, regulation, digital rights
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-scotusblog',     name: 'SCOTUSblog',         url: 'https://www.scotusblog.com/feed/',                                         type: 'rss',    defaultCategory: 'law', tier: 1 },
  { id: 'rss-eff',            name: 'EFF Deeplinks',      url: 'https://www.eff.org/rss/updates.xml',                                      type: 'rss',    defaultCategory: 'law', tier: 1 },
  { id: 'rss-lawfare',        name: 'Lawfare',            url: 'https://www.lawfaremedia.org/feed',                                        type: 'rss',    defaultCategory: 'law', tier: 1 },
  { id: 'rss-natlaw',         name: 'National Law Review',url: 'https://www.natlawreview.com/rss.xml',                                     type: 'rss',    defaultCategory: 'law', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // GAMING — Industry analysis, game dev, culture
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-gamedev',        name: 'Game Developer',     url: 'https://www.gamedeveloper.com/rss.xml',                                    type: 'rss',    defaultCategory: 'gaming', tier: 1 },
  { id: 'rss-gamesindustry',  name: 'GamesIndustry.biz',  url: 'https://www.gamesindustry.biz/rss',                                        type: 'rss',    defaultCategory: 'gaming', tier: 1 },
  { id: 'rss-ign',            name: 'IGN',                url: 'https://feeds.ign.com/ign/all',                                            type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-kotaku',         name: 'Kotaku',             url: 'https://kotaku.com/rss',                                                   type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-polygon',        name: 'Polygon',            url: 'https://www.polygon.com/rss/index.xml',                                    type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-rps',            name: 'Rock Paper Shotgun', url: 'https://www.rockpapershotgun.com/feed',                                    type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-eurogamer',      name: 'Eurogamer',          url: 'https://www.eurogamer.net/?format=rss',                                    type: 'rss',    defaultCategory: 'gaming', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // ENTERTAINMENT — Film, music, culture criticism
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-variety',        name: 'Variety',            url: 'https://variety.com/feed/',                                                type: 'rss',    defaultCategory: 'entertainment', tier: 2 },
  { id: 'rss-deadline',       name: 'Deadline',           url: 'https://deadline.com/feed/',                                               type: 'rss',    defaultCategory: 'entertainment', tier: 2 },
  { id: 'rss-thr',            name: 'Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/',                                  type: 'rss',    defaultCategory: 'entertainment', tier: 2 },
  { id: 'rss-indiewire',      name: 'IndieWire',          url: 'https://www.indiewire.com/feed/',                                          type: 'rss',    defaultCategory: 'entertainment', tier: 2 },
  { id: 'rss-pitchfork',      name: 'Pitchfork',          url: 'https://pitchfork.com/rss/news/',                                          type: 'rss',    defaultCategory: 'entertainment', tier: 2 },
  { id: 'rss-rolling-stone',  name: 'Rolling Stone',      url: 'https://www.rollingstone.com/feed/',                                      type: 'rss',    defaultCategory: 'entertainment', tier: 2 },
  { id: 'rss-billboard',      name: 'Billboard',          url: 'https://www.billboard.com/feed/',                                         type: 'rss',    defaultCategory: 'entertainment', tier: 2 },
  { id: 'bbc-entertain',      name: 'BBC Entertainment',  url: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',              type: 'rss',    defaultCategory: 'entertainment', tier: 1 },
  { id: 'gdn-culture',        name: 'Guardian Culture',   url: 'https://www.theguardian.com/culture/rss',                                  type: 'rss',    defaultCategory: 'entertainment', tier: 1 },
  { id: 'npr-arts',           name: 'NPR Arts',           url: 'https://feeds.npr.org/1008/rss.xml',                                       type: 'rss',    defaultCategory: 'entertainment', tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // SPORTS — Analytics-driven, global coverage
  // ══════════════════════════════════════════════════════════════════

  { id: 'bbc-sport',          name: 'BBC Sport',          url: 'http://feeds.bbci.co.uk/sport/rss.xml',                                    type: 'rss',    defaultCategory: 'sports', tier: 1 },
  { id: 'gdn-sport',          name: 'Guardian Sport',     url: 'https://www.theguardian.com/sport/rss',                                    type: 'rss',    defaultCategory: 'sports', tier: 1 },
  { id: 'rss-sports-illustrated', name: 'Sports Illustrated', url: 'https://www.si.com/rss/si_topstories.rss',                            type: 'rss',    defaultCategory: 'sports', tier: 2 },
  { id: 'rss-espn',           name: 'ESPN',               url: 'https://www.espn.com/espn/rss/news',                                       type: 'rss',    defaultCategory: 'sports', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // ART & CREATIVITY — Design, generative art, culture
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-artnet',         name: 'Artnet News',        url: 'https://news.artnet.com/feed',                                             type: 'rss',    defaultCategory: 'art', tier: 2 },
  { id: 'rss-hyperallergic',  name: 'Hyperallergic',      url: 'https://hyperallergic.com/feed/',                                          type: 'rss',    defaultCategory: 'art', tier: 2 },
  { id: 'rss-dezeen',         name: 'Dezeen',             url: 'https://www.dezeen.com/feed/',                                             type: 'rss',    defaultCategory: 'art', tier: 2 },
  { id: 'rss-creativeblq',    name: 'Creative Bloq',      url: 'https://www.creativebloq.com/feed',                                        type: 'rss',    defaultCategory: 'art', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // ENERGY — Clean energy, grid, nuclear, EVs
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-electrek',       name: 'Electrek',           url: 'https://electrek.co/feed/',                                                type: 'rss',    defaultCategory: 'energy', tier: 2 },
  { id: 'rss-canary-media',   name: 'Canary Media',       url: 'https://www.canarymedia.com/feed',                                         type: 'rss',    defaultCategory: 'energy', tier: 2 },
  { id: 'rss-oilprice',       name: 'OilPrice.com',       url: 'https://oilprice.com/rss/main',                                            type: 'rss',    defaultCategory: 'energy', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // FINANCE & CRYPTO — Market analysis, DeFi research
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-coindesk',       name: 'CoinDesk',           url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',                          type: 'rss',    defaultCategory: 'crypto', tier: 2 },
  { id: 'rss-cointelegraph',  name: 'CoinTelegraph',      url: 'https://cointelegraph.com/rss',                                            type: 'rss',    defaultCategory: 'crypto', tier: 2 },
  { id: 'rss-theblock',       name: 'The Block',          url: 'https://www.theblock.co/rss.xml',                                          type: 'rss',    defaultCategory: 'crypto', tier: 2 },
  { id: 'rss-decrypt',        name: 'Decrypt',            url: 'https://decrypt.co/feed',                                                  type: 'rss',    defaultCategory: 'crypto', tier: 2 },
  { id: 'rss-bloomberg-crypto',name: 'Bloomberg Crypto',  url: 'https://feeds.bloomberg.com/crypto/news.rss',                             type: 'rss',    defaultCategory: 'crypto', tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // POLITICS & GEOPOLITICS — Foreign policy, governance
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-reuters-top',    name: 'Reuters World',      url: 'https://feeds.reuters.com/reuters/topNews',                                type: 'rss',    defaultCategory: 'politics', tier: 1 },
  { id: 'bbc-world',          name: 'BBC World News',     url: 'http://feeds.bbci.co.uk/news/world/rss.xml',                               type: 'rss',    defaultCategory: 'politics', tier: 1 },
  { id: 'gdn-world',          name: 'Guardian World',     url: 'https://www.theguardian.com/world/rss',                                    type: 'rss',    defaultCategory: 'politics', tier: 1 },
  { id: 'rss-foreign-affairs',name: 'Foreign Affairs',    url: 'https://www.foreignaffairs.com/rss.xml',                                   type: 'rss',    defaultCategory: 'politics', tier: 1 },
  { id: 'rss-foreign-policy', name: 'Foreign Policy',     url: 'https://foreignpolicy.com/feed/',                                          type: 'rss',    defaultCategory: 'politics', tier: 1 },
  { id: 'rss-economist',      name: 'The Economist',      url: 'https://www.economist.com/latest-updates/rss.xml',                         type: 'rss',    defaultCategory: 'politics', tier: 1 },
  { id: 'rss-warontherocks',  name: 'War on the Rocks',   url: 'https://warontherocks.com/feed/',                                          type: 'rss',    defaultCategory: 'politics', tier: 1 },
  { id: 'rss-politico',       name: 'Politico',           url: 'https://www.politico.com/rss/politics08.xml',                              type: 'rss',    defaultCategory: 'politics', tier: 2 },
  { id: 'rss-axios',          name: 'Axios',              url: 'https://api.axios.com/feed/',                                              type: 'rss',    defaultCategory: 'politics', tier: 2 },
  { id: 'aljazeera',          name: 'Al Jazeera',         url: 'https://www.aljazeera.com/xml/rss/all.xml',                                type: 'rss',    defaultCategory: 'politics', tier: 1 },
  { id: 'npr-news',           name: 'NPR News',           url: 'https://feeds.npr.org/1001/rss.xml',                                       type: 'rss',    defaultCategory: 'politics', tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // EDUCATION — EdTech, higher education, learning
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-edsurge',        name: 'EdSurge',            url: 'https://www.edsurge.com/rss.xml',                                          type: 'rss',    defaultCategory: 'education', tier: 2 },
  { id: 'rss-the',            name: 'Times Higher Ed',    url: 'https://www.timeshighereducation.com/feed.rss',                            type: 'rss',    defaultCategory: 'education', tier: 2 },
  { id: 'rss-ihe',            name: 'Inside Higher Ed',   url: 'https://www.insidehighered.com/rss.xml',                                   type: 'rss',    defaultCategory: 'education', tier: 2 },
  { id: 'bbc-tech',           name: 'BBC Technology',     url: 'http://feeds.bbci.co.uk/news/technology/rss.xml',                          type: 'rss',    defaultCategory: 'ai', tier: 1 },
  { id: 'rss-engadget',       name: 'Engadget',           url: 'https://www.engadget.com/rss.xml',                                         type: 'rss',    defaultCategory: 'ai', tier: 2 },
  { id: 'rss-gizmodo',        name: 'Gizmodo',            url: 'https://gizmodo.com/rss',                                                  type: 'rss',    defaultCategory: 'ai', tier: 2 },
  { id: 'gdn-tech',           name: 'Guardian Tech',      url: 'https://www.theguardian.com/technology/rss',                               type: 'rss',    defaultCategory: 'ai', tier: 1 },
  { id: 'npr-tech',           name: 'NPR Technology',     url: 'https://feeds.npr.org/1019/rss.xml',                                       type: 'rss',    defaultCategory: 'ai', tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // NUTRITION & FOOD SCIENCE
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-foodnavigator',  name: 'Food Navigator',     url: 'https://www.foodnavigator.com/feed',                                       type: 'rss',    defaultCategory: 'nutrition', tier: 2 },
  { id: 'rss-harvard-nutrition', name: 'Harvard Nutrition',url: 'https://www.hsph.harvard.edu/nutritionsource/feed/',                      type: 'rss',    defaultCategory: 'nutrition', tier: 1 },
  { id: 'rss-foodpolitics',   name: 'Food Politics',      url: 'https://www.foodpolitics.com/feed/',                                       type: 'rss',    defaultCategory: 'nutrition', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // AGRICULTURE & AGRITECH
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-agfunder',       name: 'AgFunder News',      url: 'https://agfundernews.com/feed',                                            type: 'rss',    defaultCategory: 'farming', tier: 2 },
  { id: 'rss-agdaily',        name: 'AgDaily',            url: 'https://www.agdaily.com/feed',                                             type: 'rss',    defaultCategory: 'farming', tier: 2 },
  { id: 'rss-foodtank',       name: 'Food Tank',          url: 'https://foodtank.com/news/feed/',                                          type: 'rss',    defaultCategory: 'farming', tier: 2 },
  { id: 'rss-sd-agri',        name: 'ScienceDaily · Agri',url: 'https://www.sciencedaily.com/rss/plants_animals/agriculture.xml',          type: 'rss',    defaultCategory: 'farming', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // SPACE & EXPLORATION — NASA, launch coverage, astrophysics
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-nasa-news',      name: 'NASA News',          url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',                           type: 'rss',    defaultCategory: 'space', tier: 1 },
  { id: 'rss-spacenews',      name: 'Space News',         url: 'https://spacenews.com/feed/',                                              type: 'rss',    defaultCategory: 'space', tier: 1 },
  { id: 'rss-nasaspaceflight',name: 'NASASpaceFlight',    url: 'https://www.nasaspaceflight.com/feed/',                                    type: 'rss',    defaultCategory: 'space', tier: 2 },
  { id: 'rss-planetary',      name: 'Planetary Society',  url: 'https://www.planetary.org/rss/articles',                                   type: 'rss',    defaultCategory: 'space', tier: 1 },
  { id: 'rss-esa',            name: 'ESA News',           url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science',                  type: 'rss',    defaultCategory: 'space', tier: 1 },
  { id: 'rss-sky-telescope',  name: 'Sky & Telescope',    url: 'https://skyandtelescope.org/news/feed/',                                   type: 'rss',    defaultCategory: 'space', tier: 2 },
  { id: 'rss-astronomy',      name: 'Astronomy Magazine',  url: 'https://astronomy.com/rss/news',                                          type: 'rss',    defaultCategory: 'space', tier: 2 },
  { id: 'arxiv-astro',        name: 'arXiv · Astrophysics',url: 'https://export.arxiv.org/rss/astro-ph',                                   type: 'rss',    defaultCategory: 'space', tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // GAMING — Press, analytics, industry news
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-polygon',        name: 'Polygon',            url: 'https://www.polygon.com/rss/index.xml',                                    type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-kotaku',         name: 'Kotaku',             url: 'https://kotaku.com/rss',                                                   type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-pcgamer',        name: 'PC Gamer',           url: 'https://www.pcgamer.com/rss/',                                             type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-rps',            name: 'Rock Paper Shotgun', url: 'https://www.rockpapershotgun.com/feed/news',                               type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-eurogamer',      name: 'Eurogamer',          url: 'https://www.eurogamer.net/?format=rss',                                    type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-ign',            name: 'IGN',                url: 'https://feeds.ign.com/ign/all',                                            type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'rss-gamedeveloper',  name: 'Game Developer',     url: 'https://www.gamedeveloper.com/rss.xml',                                    type: 'rss',    defaultCategory: 'gaming', tier: 2 },
  { id: 'gh-gamedev',         name: 'GitHub · Game Dev',  url: 'https://api.github.com/search/repositories?q=topic:game-development+stars:>300+pushed:>2024-01-01&sort=updated&per_page=10', type: 'github', defaultCategory: 'gaming', tier: 2 },
  { id: 'gh-gameengine',      name: 'GitHub · Engines',   url: 'https://api.github.com/search/repositories?q=topic:game-engine+stars:>500+pushed:>2024-01-01&sort=stars&per_page=8',         type: 'github', defaultCategory: 'gaming', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // ROBOTICS & HARDWARE — Embodied AI, automation, physical systems
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-robohub',        name: 'Robohub',            url: 'https://robohub.org/feed/',                                                type: 'rss',    defaultCategory: 'robotics', tier: 2 },
  { id: 'rss-ieee-spectrum-ro',name: 'IEEE · Robotics',   url: 'https://spectrum.ieee.org/feeds/robotics.rss',                             type: 'rss',    defaultCategory: 'robotics', tier: 1 },
  { id: 'rss-therobotreport', name: 'The Robot Report',   url: 'https://www.therobotreport.com/feed/',                                     type: 'rss',    defaultCategory: 'robotics', tier: 2 },
  { id: 'rss-automationworld',name: 'Automation World',   url: 'https://www.automationworld.com/rss.xml',                                  type: 'rss',    defaultCategory: 'robotics', tier: 2 },
  { id: 'gh-robotics',        name: 'GitHub · Robotics',  url: 'https://api.github.com/search/repositories?q=topic:robotics+stars:>200+pushed:>2024-01-01&sort=updated&per_page=10',          type: 'github', defaultCategory: 'robotics', alwaysAiTagged: true, tier: 2 },
  { id: 'gh-ros',             name: 'GitHub · ROS',       url: 'https://api.github.com/search/repositories?q=topic:ros+stars:>100+pushed:>2024-01-01&sort=updated&per_page=8',                type: 'github', defaultCategory: 'robotics', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // LAW & DIGITAL RIGHTS — Policy, regulation, court
  // ══════════════════════════════════════════════════════════════════

  { id: 'rss-eff',            name: 'EFF Deeplinks',      url: 'https://www.eff.org/rss/updates.xml',                                      type: 'rss',    defaultCategory: 'law', tier: 1 },
  { id: 'rss-aclu',           name: 'ACLU News',          url: 'https://www.aclu.org/news/feed',                                           type: 'rss',    defaultCategory: 'law', tier: 1 },
  { id: 'rss-lawfare',        name: 'Lawfare',            url: 'https://www.lawfaremedia.org/feed',                                        type: 'rss',    defaultCategory: 'law', tier: 1 },
  { id: 'rss-propublica',     name: 'ProPublica',         url: 'https://www.propublica.org/feeds/propublica/main',                         type: 'rss',    defaultCategory: 'law', tier: 1 },
  { id: 'rss-just-security',  name: 'Just Security',      url: 'https://www.justsecurity.org/feed/',                                       type: 'rss',    defaultCategory: 'law', tier: 1 },
  { id: 'rss-scotusblog',     name: 'SCOTUSblog',         url: 'https://www.scotusblog.com/feed/',                                         type: 'rss',    defaultCategory: 'law', tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // CYBERSECURITY — GitHub repos for security tools / research
  // ══════════════════════════════════════════════════════════════════

  { id: 'gh-security',        name: 'GitHub · Security',  url: 'https://api.github.com/search/repositories?q=topic:security+stars:>500+pushed:>2024-01-01&sort=updated&per_page=10',          type: 'github', defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'gh-pentest',         name: 'GitHub · Pentest',   url: 'https://api.github.com/search/repositories?q=topic:penetration-testing+stars:>200+pushed:>2024-01-01&sort=updated&per_page=8',type: 'github', defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'rss-threatpost',     name: 'Infosecurity Mag',   url: 'https://www.infosecurity-magazine.com/rss/news/',                          type: 'rss',    defaultCategory: 'cybersecurity', tier: 2 },
  { id: 'rss-recordedfuture', name: 'Recorded Future',    url: 'https://www.recordedfuture.com/feed',                                      type: 'rss',    defaultCategory: 'cybersecurity', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // CLIMATE — GitHub repos for climate data science / tools
  // ══════════════════════════════════════════════════════════════════

  { id: 'gh-climate-data',    name: 'GitHub · Climate',   url: 'https://api.github.com/search/repositories?q=topic:climate+stars:>100+pushed:>2024-01-01&sort=updated&per_page=10',           type: 'github', defaultCategory: 'climate', tier: 2 },
  { id: 'rss-grist',          name: 'Grist',              url: 'https://grist.org/feed/',                                                  type: 'rss',    defaultCategory: 'climate', tier: 2 },
  { id: 'rss-climatecentral', name: 'Climate Central',    url: 'https://www.climatecentral.org/feeds/all',                                 type: 'rss',    defaultCategory: 'climate', tier: 1 },
  { id: 'rss-mongabay',       name: 'Mongabay',           url: 'https://news.mongabay.com/feed/',                                          type: 'rss',    defaultCategory: 'climate', tier: 2 },


  // ══════════════════════════════════════════════════════════════════
  // HEALTH — GitHub repos for medical AI / bioinformatics
  // ══════════════════════════════════════════════════════════════════

  { id: 'gh-bioinfo',         name: 'GitHub · Bioinformatics', url: 'https://api.github.com/search/repositories?q=topic:bioinformatics+stars:>200+pushed:>2024-01-01&sort=updated&per_page=8', type: 'github', defaultCategory: 'health', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-med-xpress-ai',  name: 'MedicalXpress · AI', url: 'https://medicalxpress.com/rss-feed/medical-research-news/',                type: 'rss',    defaultCategory: 'health', tier: 2 },
  { id: 'arxiv-bio',          name: 'arXiv · BioMed',     url: 'https://export.arxiv.org/rss/q-bio.GN',                                    type: 'rss',    defaultCategory: 'health', tier: 1 },


  // ══════════════════════════════════════════════════════════════════
  // AI — Additional GitHub repos and research sources
  // ══════════════════════════════════════════════════════════════════

  { id: 'gh-ml-frameworks',   name: 'GitHub · ML Frameworks', url: 'https://api.github.com/search/repositories?q=topic:machine-learning+stars:>1000+pushed:>2024-01-01&sort=stars&per_page=10', type: 'github', defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'gh-nlp',             name: 'GitHub · NLP',       url: 'https://api.github.com/search/repositories?q=topic:natural-language-processing+stars:>300+pushed:>2024-01-01&sort=updated&per_page=8', type: 'github', defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-interconnects',  name: 'Interconnects',      url: 'https://www.interconnects.ai/feed',                                        type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-aidanfieldwork', name: 'AI Snake Oil',       url: 'https://www.aisnakeoil.com/feed',                                          type: 'rss',    defaultCategory: 'ethics', alwaysAiTagged: true, tier: 1 },
  { id: 'arxiv-cs-se',        name: 'arXiv · Software Eng',url: 'https://export.arxiv.org/rss/cs.SE',                                     type: 'rss',    defaultCategory: 'ai', tier: 1 },
  { id: 'rss-ghblog',         name: 'GitHub Blog',        url: 'https://github.blog/feed/',                                                type: 'rss',    defaultCategory: 'ai', tier: 2 },
  { id: 'rss-simonwillison',  name: 'Simon Willison',     url: 'https://simonwillison.net/atom/everything/',                               type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 2 },
  { id: 'rss-lmsys',          name: 'LMSYS Blog',         url: 'https://lmsys.org/blog/rss.xml',                                           type: 'rss',    defaultCategory: 'ai', alwaysAiTagged: true, tier: 1 },

];
