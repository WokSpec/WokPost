import type { FeedSource } from './types';

export const FEED_SOURCES: FeedSource[] = [
  // ── AI & Research ──────────────────────────────────────────────────────────
  { id: 'hn-ai',           name: 'Hacker News',           url: 'https://hn.algolia.com/api/v1/search?tags=story&query=artificial+intelligence&hitsPerPage=20', type: 'hn',     defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'r-artificial',    name: 'r/artificial',          url: 'https://www.reddit.com/r/artificial.json?limit=25',            type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'r-ml',            name: 'r/MachineLearning',     url: 'https://www.reddit.com/r/MachineLearning.json?limit=25',       type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'r-localllama',    name: 'r/LocalLLaMA',          url: 'https://www.reddit.com/r/LocalLLaMA.json?limit=25',            type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'r-chatgpt',       name: 'r/ChatGPT',             url: 'https://www.reddit.com/r/ChatGPT.json?limit=25',               type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'r-openai',        name: 'r/OpenAI',              url: 'https://www.reddit.com/r/OpenAI.json?limit=25',                type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'rss-verge-ai',    name: 'The Verge AI',          url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'rss-ars',         name: 'Ars Technica',          url: 'https://feeds.arstechnica.com/arstechnica/index',              type: 'rss', defaultCategory: 'ai' },
  { id: 'rss-mit-tech',    name: 'MIT Tech Review',       url: 'https://www.technologyreview.com/feed/',                       type: 'rss', defaultCategory: 'ai' },
  { id: 'rss-venturebeat', name: 'VentureBeat AI',        url: 'https://venturebeat.com/category/ai/feed/',                    type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'rss-tc-ai',       name: 'TechCrunch AI',         url: 'https://techcrunch.com/category/artificial-intelligence/feed/', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'rss-wired-ai',    name: 'Wired AI',              url: 'https://www.wired.com/feed/category/artificial-intelligence/latest/rss', type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'rss-zdnet-ai',    name: 'ZDNet AI',              url: 'https://www.zdnet.com/topic/artificial-intelligence/rss.xml',  type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'rss-ainews',      name: 'AI News',               url: 'https://www.artificialintelligence-news.com/feed/',            type: 'rss', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'rss-ieee',        name: 'IEEE Spectrum',         url: 'https://spectrum.ieee.org/feeds/feed.rss',                     type: 'rss', defaultCategory: 'ai' },

  // ── Science ─────────────────────────────────────────────────────────────────
  { id: 'r-science',       name: 'r/science',             url: 'https://www.reddit.com/r/science.json?limit=25',               type: 'reddit', defaultCategory: 'science' },
  { id: 'r-physics',       name: 'r/physics',             url: 'https://www.reddit.com/r/physics.json?limit=25',               type: 'reddit', defaultCategory: 'science' },
  { id: 'r-biology',       name: 'r/biology',             url: 'https://www.reddit.com/r/biology.json?limit=25',               type: 'reddit', defaultCategory: 'science' },
  { id: 'rss-sciencedaily',name: 'ScienceDaily',          url: 'https://www.sciencedaily.com/rss/top.xml',                     type: 'rss', defaultCategory: 'science' },
  { id: 'rss-physorg',     name: 'Phys.org',              url: 'https://phys.org/rss-feed/',                                   type: 'rss', defaultCategory: 'science' },

  // ── Health & Fitness ─────────────────────────────────────────────────────────
  { id: 'r-fitness',       name: 'r/fitness',             url: 'https://www.reddit.com/r/fitness.json?limit=25',               type: 'reddit', defaultCategory: 'health' },
  { id: 'r-health',        name: 'r/Health',              url: 'https://www.reddit.com/r/Health.json?limit=25',                type: 'reddit', defaultCategory: 'health' },
  { id: 'rss-nih',         name: 'NIH News',              url: 'https://www.nih.gov/news-events/news-releases/feed',           type: 'rss', defaultCategory: 'health' },
  { id: 'rss-healthline',  name: 'Healthline',            url: 'https://www.healthline.com/rss/health-news',                  type: 'rss', defaultCategory: 'health' },

  // ── Nutrition ────────────────────────────────────────────────────────────────
  { id: 'r-nutrition',     name: 'r/nutrition',           url: 'https://www.reddit.com/r/nutrition.json?limit=25',             type: 'reddit', defaultCategory: 'nutrition' },
  { id: 'r-eatcheap',      name: 'r/EatCheapAndHealthy',  url: 'https://www.reddit.com/r/EatCheapAndHealthy.json?limit=25',   type: 'reddit', defaultCategory: 'nutrition' },

  // ── Agriculture & Farming ────────────────────────────────────────────────────
  { id: 'r-farming',       name: 'r/farming',             url: 'https://www.reddit.com/r/farming.json?limit=25',               type: 'reddit', defaultCategory: 'farming' },
  { id: 'r-agriculture',   name: 'r/agriculture',         url: 'https://www.reddit.com/r/agriculture.json?limit=25',           type: 'reddit', defaultCategory: 'farming' },
  { id: 'rss-sd-agri',     name: 'ScienceDaily Agriculture', url: 'https://www.sciencedaily.com/rss/plants_animals/agriculture.xml', type: 'rss', defaultCategory: 'farming' },

  // ── Business & Finance ───────────────────────────────────────────────────────
  { id: 'r-investing',     name: 'r/investing',           url: 'https://www.reddit.com/r/investing.json?limit=25',             type: 'reddit', defaultCategory: 'business' },
  { id: 'r-startups',      name: 'r/startups',            url: 'https://www.reddit.com/r/startups.json?limit=25',              type: 'reddit', defaultCategory: 'business' },
  { id: 'r-entrepreneur',  name: 'r/entrepreneur',        url: 'https://www.reddit.com/r/Entrepreneur.json?limit=25',          type: 'reddit', defaultCategory: 'business' },
  { id: 'rss-reuters-biz', name: 'Reuters Business',      url: 'https://feeds.reuters.com/reuters/businessNews',               type: 'rss', defaultCategory: 'business' },

  // ── Sports ───────────────────────────────────────────────────────────────────
  { id: 'r-sports',        name: 'r/sports',              url: 'https://www.reddit.com/r/sports.json?limit=25',                type: 'reddit', defaultCategory: 'sports' },
  { id: 'r-nba',           name: 'r/nba',                 url: 'https://www.reddit.com/r/nba.json?limit=25',                   type: 'reddit', defaultCategory: 'sports' },
  { id: 'r-nfl',           name: 'r/nfl',                 url: 'https://www.reddit.com/r/nfl.json?limit=25',                   type: 'reddit', defaultCategory: 'sports' },
  { id: 'r-soccer',        name: 'r/soccer',              url: 'https://www.reddit.com/r/soccer.json?limit=25',                type: 'reddit', defaultCategory: 'sports' },

  // ── Entertainment ────────────────────────────────────────────────────────────
  { id: 'r-movies',        name: 'r/movies',              url: 'https://www.reddit.com/r/movies.json?limit=25',                type: 'reddit', defaultCategory: 'entertainment' },
  { id: 'r-television',    name: 'r/television',          url: 'https://www.reddit.com/r/television.json?limit=25',            type: 'reddit', defaultCategory: 'entertainment' },
  { id: 'r-music',         name: 'r/Music',               url: 'https://www.reddit.com/r/Music.json?limit=25',                 type: 'reddit', defaultCategory: 'entertainment' },
  { id: 'rss-variety',     name: 'Variety',               url: 'https://variety.com/feed/',                                    type: 'rss', defaultCategory: 'entertainment' },

  // ── Education ────────────────────────────────────────────────────────────────
  { id: 'r-education',     name: 'r/education',           url: 'https://www.reddit.com/r/education.json?limit=25',             type: 'reddit', defaultCategory: 'education' },
  { id: 'r-learnprog',     name: 'r/learnprogramming',    url: 'https://www.reddit.com/r/learnprogramming.json?limit=25',      type: 'reddit', defaultCategory: 'education' },

  // ── Law & Policy ─────────────────────────────────────────────────────────────
  { id: 'r-law',           name: 'r/law',                 url: 'https://www.reddit.com/r/law.json?limit=25',                   type: 'reddit', defaultCategory: 'law' },
  { id: 'rss-lawfare',     name: 'Lawfare',               url: 'https://www.lawfaremedia.org/feed',                            type: 'rss', defaultCategory: 'law' },

  // ── Gaming ───────────────────────────────────────────────────────────────────
  { id: 'r-gaming',        name: 'r/gaming',              url: 'https://www.reddit.com/r/gaming.json?limit=25',                type: 'reddit', defaultCategory: 'gaming' },
  { id: 'r-pcgaming',      name: 'r/pcgaming',            url: 'https://www.reddit.com/r/pcgaming.json?limit=25',              type: 'reddit', defaultCategory: 'gaming' },
  { id: 'rss-rps',         name: 'Rock Paper Shotgun',    url: 'https://www.rockpapershotgun.com/feed',                        type: 'rss', defaultCategory: 'gaming' },

  // ── Space ────────────────────────────────────────────────────────────────────
  { id: 'r-space',         name: 'r/space',               url: 'https://www.reddit.com/r/space.json?limit=25',                 type: 'reddit', defaultCategory: 'space' },
  { id: 'r-spacex',        name: 'r/SpaceXLounge',        url: 'https://www.reddit.com/r/SpaceXLounge.json?limit=25',          type: 'reddit', defaultCategory: 'space' },
  { id: 'rss-nasa',        name: 'NASA News',             url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',               type: 'rss', defaultCategory: 'space' },
  { id: 'rss-spacenews',   name: 'SpaceNews',             url: 'https://spacenews.com/feed/',                                  type: 'rss', defaultCategory: 'space' },

  // ── Art & Creativity ─────────────────────────────────────────────────────────
  { id: 'r-art',           name: 'r/art',                 url: 'https://www.reddit.com/r/Art.json?limit=25',                   type: 'reddit', defaultCategory: 'art' },
  { id: 'r-gamedev',       name: 'r/gamedev',             url: 'https://www.reddit.com/r/gamedev.json?limit=25',               type: 'reddit', defaultCategory: 'art' },
  { id: 'rss-creativeblq', name: 'Creative Bloq',         url: 'https://www.creativebloq.com/feed',                            type: 'rss', defaultCategory: 'art' },

  // ── Robotics & Hardware ──────────────────────────────────────────────────────
  { id: 'r-robotics',      name: 'r/robotics',            url: 'https://www.reddit.com/r/robotics.json?limit=25',              type: 'reddit', defaultCategory: 'robotics' },
  { id: 'rss-ieee-rob',    name: 'IEEE Spectrum Robotics', url: 'https://spectrum.ieee.org/topic/robotics/feed',               type: 'rss', defaultCategory: 'robotics' },

  // ── Climate & Environment ────────────────────────────────────────────────────
  { id: 'r-environment',   name: 'r/environment',         url: 'https://www.reddit.com/r/environment.json?limit=25',           type: 'reddit', defaultCategory: 'climate' },
  { id: 'r-climate',       name: 'r/climate',             url: 'https://www.reddit.com/r/climate.json?limit=25',               type: 'reddit', defaultCategory: 'climate' },
  { id: 'rss-nasa-climate',name: 'NASA Climate',          url: 'https://climate.nasa.gov/feed.rss',                            type: 'rss', defaultCategory: 'climate' },
  { id: 'rss-cleantechnica',name: 'CleanTechnica',        url: 'https://cleantechnica.com/feed/',                              type: 'rss', defaultCategory: 'climate' },

  // ── Cybersecurity ────────────────────────────────────────────────────────────
  { id: 'r-netsec',        name: 'r/netsec',              url: 'https://www.reddit.com/r/netsec.json?limit=25',                type: 'reddit', defaultCategory: 'cybersecurity' },
  { id: 'r-cybersec',      name: 'r/cybersecurity',       url: 'https://www.reddit.com/r/cybersecurity.json?limit=25',         type: 'reddit', defaultCategory: 'cybersecurity' },
  { id: 'rss-krebs',       name: 'Krebs on Security',     url: 'https://krebsonsecurity.com/feed/',                            type: 'rss', defaultCategory: 'cybersecurity' },
  { id: 'rss-thhn',        name: 'The Hacker News',       url: 'https://feeds.feedburner.com/TheHackersNews',                  type: 'rss', defaultCategory: 'cybersecurity' },
  { id: 'rss-bleeping',    name: 'BleepingComputer',      url: 'https://www.bleepingcomputer.com/feed/',                       type: 'rss', defaultCategory: 'cybersecurity' },

  // ── Finance & Crypto ─────────────────────────────────────────────────────────
  { id: 'r-crypto',        name: 'r/CryptoCurrency',      url: 'https://www.reddit.com/r/CryptoCurrency.json?limit=25',        type: 'reddit', defaultCategory: 'crypto' },
  { id: 'r-bitcoin',       name: 'r/Bitcoin',             url: 'https://www.reddit.com/r/Bitcoin.json?limit=25',               type: 'reddit', defaultCategory: 'crypto' },
  { id: 'rss-coindesk',    name: 'CoinDesk',              url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',               type: 'rss', defaultCategory: 'crypto' },

  // ── Politics & Government ────────────────────────────────────────────────────
  { id: 'r-politics',      name: 'r/politics',            url: 'https://www.reddit.com/r/politics.json?limit=25',              type: 'reddit', defaultCategory: 'politics' },
  { id: 'r-worldnews',     name: 'r/worldnews',           url: 'https://www.reddit.com/r/worldnews.json?limit=25',             type: 'reddit', defaultCategory: 'politics' },
  { id: 'rss-reuters-top', name: 'Reuters Top News',      url: 'https://feeds.reuters.com/reuters/topNews',                    type: 'rss', defaultCategory: 'politics' },

  // ── Energy ───────────────────────────────────────────────────────────────────
  { id: 'r-energy',        name: 'r/energy',              url: 'https://www.reddit.com/r/energy.json?limit=25',                type: 'reddit', defaultCategory: 'energy' },
  { id: 'r-renewable',     name: 'r/RenewableEnergy',     url: 'https://www.reddit.com/r/RenewableEnergy.json?limit=25',       type: 'reddit', defaultCategory: 'energy' },

  // ── BBC News ──────────────────────────────────────────────────────────────────
  { id: 'bbc-world',      name: 'BBC World News',       url: 'http://feeds.bbci.co.uk/news/world/rss.xml',                   type: 'rss', defaultCategory: 'politics' },
  { id: 'bbc-tech',       name: 'BBC Technology',       url: 'http://feeds.bbci.co.uk/news/technology/rss.xml',              type: 'rss', defaultCategory: 'ai' },
  { id: 'bbc-science',    name: 'BBC Science',          url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml', type: 'rss', defaultCategory: 'science' },
  { id: 'bbc-sport',      name: 'BBC Sport',            url: 'http://feeds.bbci.co.uk/sport/rss.xml',                        type: 'rss', defaultCategory: 'sports' },
  { id: 'bbc-business',   name: 'BBC Business',         url: 'http://feeds.bbci.co.uk/news/business/rss.xml',                type: 'rss', defaultCategory: 'business' },
  { id: 'bbc-health',     name: 'BBC Health',           url: 'http://feeds.bbci.co.uk/news/health/rss.xml',                  type: 'rss', defaultCategory: 'health' },
  { id: 'bbc-entertain',  name: 'BBC Entertainment',    url: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',  type: 'rss', defaultCategory: 'entertainment' },

  // ── The Guardian ─────────────────────────────────────────────────────────────
  { id: 'gdn-world',      name: 'Guardian World',       url: 'https://www.theguardian.com/world/rss',                        type: 'rss', defaultCategory: 'politics' },
  { id: 'gdn-tech',       name: 'Guardian Tech',        url: 'https://www.theguardian.com/technology/rss',                   type: 'rss', defaultCategory: 'ai' },
  { id: 'gdn-science',    name: 'Guardian Science',     url: 'https://www.theguardian.com/science/rss',                      type: 'rss', defaultCategory: 'science' },
  { id: 'gdn-business',   name: 'Guardian Business',    url: 'https://www.theguardian.com/business/rss',                     type: 'rss', defaultCategory: 'business' },
  { id: 'gdn-sport',      name: 'Guardian Sport',       url: 'https://www.theguardian.com/sport/rss',                        type: 'rss', defaultCategory: 'sports' },
  { id: 'gdn-environ',    name: 'Guardian Environment', url: 'https://www.theguardian.com/environment/rss',                  type: 'rss', defaultCategory: 'climate' },
  { id: 'gdn-culture',    name: 'Guardian Culture',     url: 'https://www.theguardian.com/culture/rss',                      type: 'rss', defaultCategory: 'entertainment' },
  { id: 'gdn-health',     name: 'Guardian Health',      url: 'https://www.theguardian.com/society/health/rss',               type: 'rss', defaultCategory: 'health' },

  // ── NPR ───────────────────────────────────────────────────────────────────────
  { id: 'npr-news',       name: 'NPR News',             url: 'https://feeds.npr.org/1001/rss.xml',                           type: 'rss', defaultCategory: 'politics' },
  { id: 'npr-science',    name: 'NPR Science',          url: 'https://feeds.npr.org/1007/rss.xml',                           type: 'rss', defaultCategory: 'science' },
  { id: 'npr-health',     name: 'NPR Health',           url: 'https://feeds.npr.org/1128/rss.xml',                           type: 'rss', defaultCategory: 'health' },
  { id: 'npr-tech',       name: 'NPR Tech',             url: 'https://feeds.npr.org/1019/rss.xml',                           type: 'rss', defaultCategory: 'ai' },
  { id: 'npr-arts',       name: 'NPR Arts',             url: 'https://feeds.npr.org/1008/rss.xml',                           type: 'rss', defaultCategory: 'entertainment' },

  // ── Al Jazeera ────────────────────────────────────────────────────────────────
  { id: 'aljazeera',      name: 'Al Jazeera',           url: 'https://www.aljazeera.com/xml/rss/all.xml',                    type: 'rss', defaultCategory: 'politics' },

  // ── Science Publications ─────────────────────────────────────────────────────
  { id: 'rss-nature',     name: 'Nature',               url: 'https://www.nature.com/nature.rss',                            type: 'rss', defaultCategory: 'science' },
  { id: 'rss-newscientist',name: 'New Scientist',       url: 'https://www.newscientist.com/feed/home/',                      type: 'rss', defaultCategory: 'science' },
  { id: 'rss-popsci',     name: 'Popular Science',      url: 'https://www.popsci.com/feed/',                                 type: 'rss', defaultCategory: 'science' },
  { id: 'rss-sciam',      name: 'Scientific American',  url: 'https://www.scientificamerican.com/feed/',                     type: 'rss', defaultCategory: 'science' },
  { id: 'rss-livescience',name: 'Live Science',         url: 'https://www.livescience.com/feeds/all',                        type: 'rss', defaultCategory: 'science' },

  // ── Tech Publications ────────────────────────────────────────────────────────
  { id: 'rss-register',   name: 'The Register',         url: 'https://www.theregister.com/headlines.atom',                   type: 'rss', defaultCategory: 'cybersecurity' },
  { id: 'rss-engadget',   name: 'Engadget',             url: 'https://www.engadget.com/rss.xml',                             type: 'rss', defaultCategory: 'ai' },
  { id: 'rss-9to5google', name: '9to5Google',           url: 'https://9to5google.com/feed/',                                 type: 'rss', defaultCategory: 'ai' },
  { id: 'rss-9to5mac',    name: '9to5Mac',              url: 'https://9to5mac.com/feed/',                                    type: 'rss', defaultCategory: 'ai' },
  { id: 'rss-gizmodo',    name: 'Gizmodo',              url: 'https://gizmodo.com/rss',                                      type: 'rss', defaultCategory: 'ai' },

  // ── Gaming Publications ───────────────────────────────────────────────────────
  { id: 'rss-ign',        name: 'IGN',                  url: 'https://feeds.ign.com/ign/all',                                type: 'rss', defaultCategory: 'gaming' },
  { id: 'rss-kotaku',     name: 'Kotaku',               url: 'https://kotaku.com/rss',                                       type: 'rss', defaultCategory: 'gaming' },
  { id: 'rss-polygon',    name: 'Polygon',              url: 'https://www.polygon.com/rss/index.xml',                        type: 'rss', defaultCategory: 'gaming' },
  { id: 'rss-eurogamer',  name: 'Eurogamer',            url: 'https://www.eurogamer.net/?format=rss',                        type: 'rss', defaultCategory: 'gaming' },

  // ── Entertainment Publications ────────────────────────────────────────────────
  { id: 'rss-deadline',   name: 'Deadline',             url: 'https://deadline.com/feed/',                                   type: 'rss', defaultCategory: 'entertainment' },
  { id: 'rss-rollingstone',name: 'Rolling Stone',       url: 'https://www.rollingstone.com/feed/',                           type: 'rss', defaultCategory: 'entertainment' },
  { id: 'rss-billboard',  name: 'Billboard',            url: 'https://www.billboard.com/feed/',                              type: 'rss', defaultCategory: 'entertainment' },

  // ── Space Publications ────────────────────────────────────────────────────────
  { id: 'rss-space',      name: 'Space.com',            url: 'https://www.space.com/feeds/all',                              type: 'rss', defaultCategory: 'space' },
  { id: 'rss-skytel',     name: 'Sky & Telescope',      url: 'https://skyandtelescope.org/feed/',                            type: 'rss', defaultCategory: 'space' },

  // ── Health Publications ───────────────────────────────────────────────────────
  { id: 'rss-who',        name: 'WHO News',             url: 'https://www.who.int/rss-feeds/news-english.xml',               type: 'rss', defaultCategory: 'health' },
  { id: 'rss-medicalxpress',name: 'Medical Xpress',     url: 'https://medicalxpress.com/rss-feed/',                          type: 'rss', defaultCategory: 'health' },

  // ── Finance & Crypto ─────────────────────────────────────────────────────────
  { id: 'rss-cnbc-biz',   name: 'CNBC Business',        url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html',         type: 'rss', defaultCategory: 'business' },
  { id: 'rss-cnbc-finance',name: 'CNBC Finance',        url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',         type: 'rss', defaultCategory: 'business' },
  { id: 'rss-cointelegraph',name: 'CoinTelegraph',      url: 'https://cointelegraph.com/rss',                                type: 'rss', defaultCategory: 'crypto' },

  // ── Politics & Gov ────────────────────────────────────────────────────────────
  { id: 'rss-politico',   name: 'Politico',             url: 'https://www.politico.com/rss/politics08.xml',                  type: 'rss', defaultCategory: 'politics' },
  { id: 'rss-axios',      name: 'Axios',                url: 'https://api.axios.com/feed/',                                  type: 'rss', defaultCategory: 'politics' },
  { id: 'rss-thehill',    name: 'The Hill',             url: 'https://thehill.com/news/feed/',                               type: 'rss', defaultCategory: 'politics' },

  // ── Climate & Environment ─────────────────────────────────────────────────────
  { id: 'rss-carbon-brief',name: 'Carbon Brief',        url: 'https://www.carbonbrief.org/feed/',                            type: 'rss', defaultCategory: 'climate' },
  { id: 'rss-env-health-news',name: 'Env Health News',  url: 'https://www.ehn.org/feeds/rss',                               type: 'rss', defaultCategory: 'climate' },

  // ── More Reddit ───────────────────────────────────────────────────────────────
  { id: 'r-technology',   name: 'r/technology',         url: 'https://www.reddit.com/r/technology.json?limit=25',            type: 'reddit', defaultCategory: 'ai' },
  { id: 'r-programming',  name: 'r/programming',        url: 'https://www.reddit.com/r/programming.json?limit=25',           type: 'reddit', defaultCategory: 'education' },
  { id: 'r-news',         name: 'r/news',               url: 'https://www.reddit.com/r/news.json?limit=25',                  type: 'reddit', defaultCategory: 'politics' },
  { id: 'r-futurology',   name: 'r/Futurology',         url: 'https://www.reddit.com/r/Futurology.json?limit=25',            type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'r-datascience',  name: 'r/datascience',        url: 'https://www.reddit.com/r/datascience.json?limit=25',           type: 'reddit', defaultCategory: 'ai', alwaysAiTagged: true },
  { id: 'r-formula1',     name: 'r/formula1',           url: 'https://www.reddit.com/r/formula1.json?limit=25',              type: 'reddit', defaultCategory: 'sports' },
  { id: 'r-baseball',     name: 'r/baseball',           url: 'https://www.reddit.com/r/baseball.json?limit=25',              type: 'reddit', defaultCategory: 'sports' },
  { id: 'r-hockey',       name: 'r/hockey',             url: 'https://www.reddit.com/r/hockey.json?limit=25',                type: 'reddit', defaultCategory: 'sports' },
  { id: 'r-tennis',       name: 'r/tennis',             url: 'https://www.reddit.com/r/tennis.json?limit=25',                type: 'reddit', defaultCategory: 'sports' },
  { id: 'r-stocks',       name: 'r/stocks',             url: 'https://www.reddit.com/r/stocks.json?limit=25',                type: 'reddit', defaultCategory: 'business' },
  { id: 'r-personalfinance',name: 'r/personalfinance',  url: 'https://www.reddit.com/r/personalfinance.json?limit=25',       type: 'reddit', defaultCategory: 'business' },
  { id: 'r-neurosciencenews',name: 'r/neuroscience',    url: 'https://www.reddit.com/r/neuroscience.json?limit=25',          type: 'reddit', defaultCategory: 'science' },
  { id: 'r-diy',          name: 'r/DIY',                url: 'https://www.reddit.com/r/DIY.json?limit=25',                   type: 'reddit', defaultCategory: 'education' },
  { id: 'r-architecture', name: 'r/architecture',       url: 'https://www.reddit.com/r/architecture.json?limit=25',          type: 'reddit', defaultCategory: 'art' },

  // ── AI Ethics ────────────────────────────────────────────────────────────────
  { id: 'r-philosophy',    name: 'r/philosophy',          url: 'https://www.reddit.com/r/philosophy.json?limit=25',            type: 'reddit', defaultCategory: 'ethics' },
  { id: 'r-singularity',   name: 'r/singularity',        url: 'https://www.reddit.com/r/singularity.json?limit=25',           type: 'reddit', defaultCategory: 'ethics', alwaysAiTagged: true },
];
