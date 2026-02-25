export type Category =
  | 'ai' | 'business' | 'sports' | 'science' | 'health' | 'nutrition'
  | 'farming' | 'entertainment' | 'education' | 'law' | 'gaming' | 'space'
  | 'art' | 'robotics' | 'climate' | 'cybersecurity' | 'crypto' | 'politics'
  | 'energy' | 'ethics';

export interface FeedItem {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  sourceType: 'rss' | 'reddit' | 'hn';
  category: Category;
  aiTagged: boolean;
  aiScore: number;
  publishedAt: string;
  summary: string;
  tags: string[];
  score?: number;
  commentCount?: number;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'reddit' | 'hn';
  defaultCategory: Category;
  alwaysAiTagged?: boolean;
}

export const CATEGORIES: Record<Category, { label: string; color: string; accent: string; description: string }> = {
  ai:            { label: 'AI',            color: '#38bdf8', accent: 'rgba(56,189,248,0.1)',   description: 'Artificial intelligence, LLMs, machine learning breakthroughs and tools.' },
  business:      { label: 'Business',      color: '#4ade80', accent: 'rgba(74,222,128,0.1)',   description: 'Startups, funding, enterprise AI, market trends and the future of work.' },
  sports:        { label: 'Sports',        color: '#fb923c', accent: 'rgba(251,146,60,0.1)',   description: 'AI in sports analytics, performance coaching, referee tech and broadcasting.' },
  science:       { label: 'Science',       color: '#a78bfa', accent: 'rgba(167,139,250,0.1)',  description: 'Research breakthroughs, AI-accelerated discovery, quantum and biotech.' },
  health:        { label: 'Health',        color: '#f472b6', accent: 'rgba(244,114,182,0.1)',  description: 'Medical AI, diagnostics, drug discovery, mental health tech.' },
  nutrition:     { label: 'Nutrition',     color: '#86efac', accent: 'rgba(134,239,172,0.1)',  description: 'Diet science, gut health, AI-powered nutrition and personalized eating.' },
  farming:       { label: 'Farming',       color: '#fde047', accent: 'rgba(253,224,71,0.1)',   description: 'AgriTech, precision farming, food supply chain and sustainable agriculture.' },
  entertainment: { label: 'Entertainment', color: '#f87171', accent: 'rgba(248,113,113,0.1)',  description: 'AI in film, music, gaming culture, streaming and creative industries.' },
  education:     { label: 'Education',     color: '#67e8f9', accent: 'rgba(103,232,249,0.1)',  description: 'EdTech, AI tutors, curriculum changes and the future of learning.' },
  law:           { label: 'Law',           color: '#cbd5e1', accent: 'rgba(203,213,225,0.1)',  description: 'AI regulation, legal tech, policy, compliance and court decisions.' },
  gaming:        { label: 'Gaming',        color: '#c084fc', accent: 'rgba(192,132,252,0.1)',  description: 'Game AI, esports analytics, procedural generation and dev tooling.' },
  space:         { label: 'Space',         color: '#60a5fa', accent: 'rgba(96,165,250,0.1)',   description: 'AI in space exploration, satellite tech, rocket science and astronomy.' },
  art:           { label: 'Art',           color: '#fb7185', accent: 'rgba(251,113,133,0.1)',  description: 'Generative art, AI creative tools, design and digital culture.' },
  robotics:      { label: 'Robotics',      color: '#34d399', accent: 'rgba(52,211,153,0.1)',   description: 'Humanoid robots, drones, industrial automation and hardware breakthroughs.' },
  climate:       { label: 'Climate',       color: '#6ee7b7', accent: 'rgba(110,231,179,0.1)',  description: 'AI for climate solutions, renewable energy, carbon tech and sustainability.' },
  cybersecurity: { label: 'Cyber',         color: '#fca5a5', accent: 'rgba(252,165,165,0.1)',  description: 'AI-powered threats, defense, vulnerabilities and the future of InfoSec.' },
  crypto:        { label: 'Crypto',        color: '#fbbf24', accent: 'rgba(251,191,36,0.1)',   description: 'Blockchain, DeFi, AI+Web3 intersections, tokenomics and regulation.' },
  politics:      { label: 'Politics',      color: '#94a3b8', accent: 'rgba(148,163,184,0.1)',  description: 'AI in elections, governance, policy debates and geopolitical tech race.' },
  energy:        { label: 'Energy',        color: '#facc15', accent: 'rgba(250,204,21,0.1)',   description: 'AI and the grid, EVs, nuclear, solar and the energy transition.' },
  ethics:        { label: 'Ethics',        color: '#e879f9', accent: 'rgba(232,121,249,0.1)',  description: 'AI alignment, bias, accountability, privacy and the big philosophical questions.' },
};
