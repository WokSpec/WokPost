export type Category =
  | 'ai'
  | 'business'
  | 'sports'
  | 'science'
  | 'health'
  | 'nutrition'
  | 'farming'
  | 'entertainment'
  | 'education'
  | 'law'
  | 'gaming'
  | 'space'
  | 'art'
  | 'robotics'
  | 'climate'
  | 'cybersecurity'
  | 'crypto'
  | 'politics'
  | 'energy'
  | 'ethics';

export const CATEGORIES: Record<Category, { label: string; color: string; accent: string; description: string }> = {
  ai:            { label: 'AI & Research',        color: '#38bdf8', accent: 'rgba(56,189,248,0.12)',  description: 'Models, breakthroughs, and the science of AI.' },
  business:      { label: 'Business & Finance',   color: '#4ade80', accent: 'rgba(74,222,128,0.12)',  description: 'Markets, startups, and how AI reshapes commerce.' },
  sports:        { label: 'Sports',               color: '#fb923c', accent: 'rgba(251,146,60,0.12)',  description: 'AI in training, analytics, broadcasting, and fandom.' },
  science:       { label: 'Science',              color: '#a78bfa', accent: 'rgba(167,139,250,0.12)', description: 'Research, discoveries, and the future of human knowledge.' },
  health:        { label: 'Health & Fitness',     color: '#f472b6', accent: 'rgba(244,114,182,0.12)', description: 'Medicine, biotech, wellness, and AI diagnostics.' },
  nutrition:     { label: 'Nutrition',            color: '#86efac', accent: 'rgba(134,239,172,0.12)', description: 'Diet science, food tech, and AI-powered nutrition.' },
  farming:       { label: 'Agriculture',          color: '#fde047', accent: 'rgba(253,224,71,0.12)',  description: 'Precision farming, food supply, and agri-tech.' },
  entertainment: { label: 'Entertainment',        color: '#f87171', accent: 'rgba(248,113,113,0.12)', description: 'Film, music, games, and AI in creative industries.' },
  education:     { label: 'Education',            color: '#67e8f9', accent: 'rgba(103,232,249,0.12)', description: 'Learning, EdTech, and AI in the classroom.' },
  law:           { label: 'Law & Policy',         color: '#cbd5e1', accent: 'rgba(203,213,225,0.12)', description: 'Regulation, AI law, and global policy.' },
  gaming:        { label: 'Gaming',               color: '#c084fc', accent: 'rgba(192,132,252,0.12)', description: 'Games, AI NPCs, procedural worlds, and esports.' },
  space:         { label: 'Space & Exploration',  color: '#60a5fa', accent: 'rgba(96,165,250,0.12)',  description: 'NASA, SpaceX, and AI in the cosmos.' },
  art:           { label: 'Art & Creativity',     color: '#fb7185', accent: 'rgba(251,113,133,0.12)', description: 'AI art, generative creativity, and design tools.' },
  robotics:      { label: 'Robotics & Hardware',  color: '#34d399', accent: 'rgba(52,211,153,0.12)',  description: 'Robots, automation, and physical AI.' },
  climate:       { label: 'Climate & Environment',color: '#6ee7b7', accent: 'rgba(110,231,183,0.12)', description: 'AI in climate modeling, sustainability, and clean energy.' },
  cybersecurity: { label: 'Cybersecurity',        color: '#fca5a5', accent: 'rgba(252,165,165,0.12)', description: 'Threats, defenses, and AI in security.' },
  crypto:        { label: 'Finance & Crypto',     color: '#fbbf24', accent: 'rgba(251,191,36,0.12)',  description: 'DeFi, blockchain, AI trading, and fintech.' },
  politics:      { label: 'Politics & Gov',       color: '#94a3b8', accent: 'rgba(148,163,184,0.12)', description: 'Elections, governance, and AI in public policy.' },
  energy:        { label: 'Energy',               color: '#facc15', accent: 'rgba(250,204,21,0.12)',  description: 'Clean energy, grids, and AI power optimization.' },
  ethics:        { label: 'AI Ethics',            color: '#e879f9', accent: 'rgba(232,121,249,0.12)', description: 'Bias, safety, alignment, and the philosophy of AI.' },
};

export interface FeedItem {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  sourceType: 'rss' | 'reddit' | 'hn';
  category: Category;
  aiTagged: boolean;
  aiScore: number; // 1-10
  publishedAt: string; // ISO
  summary: string;
  tags: string[];
  thumbnail?: string;
  commentCount?: number;
  score?: number; // reddit/HN score
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'reddit' | 'hn';
  defaultCategory: Category;
  alwaysAiTagged?: boolean;
}

export interface FeedPage {
  items: FeedItem[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
