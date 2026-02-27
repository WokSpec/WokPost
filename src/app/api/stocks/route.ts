import { NextResponse } from 'next/server';

const SYMBOLS = ['SPY','QQQ','NVDA','AAPL','MSFT','GOOGL','META','AMZN','TSLA','BTC-USD','ETH-USD'];
const CACHE_TTL = 300;

function getKV(): KVNamespace | null {
  try {
    // @ts-expect-error
    return globalThis.__env__?.FEED_CACHE ?? null;
  } catch { return null; }
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

async function fetchQuotes(): Promise<StockQuote[]> {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${SYMBOLS.join(',')}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent&lang=en-US&region=US`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WokPost/1.0)',
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Yahoo Finance HTTP ${res.status}`);
  const json = await res.json() as {
    quoteResponse?: {
      result?: Array<{
        symbol: string;
        regularMarketPrice: number;
        regularMarketChange: number;
        regularMarketChangePercent: number;
      }>;
    };
  };
  const results = json?.quoteResponse?.result ?? [];
  return results.map(q => ({
    symbol: q.symbol,
    price: q.regularMarketPrice ?? 0,
    change: q.regularMarketChange ?? 0,
    changePercent: q.regularMarketChangePercent ?? 0,
  }));
}

export async function GET() {
  const kv = getKV();
  const cacheKey = 'stocks:quotes:v1';

  if (kv) {
    try {
      const cached = await kv.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached), {
          headers: { 'Cache-Control': 'public, max-age=60', 'X-Cache': 'HIT' },
        });
      }
    } catch { /* ignore */ }
  }

  try {
    const quotes = await fetchQuotes();
    if (kv && quotes.length > 0) {
      try { await kv.put(cacheKey, JSON.stringify(quotes), { expirationTtl: CACHE_TTL }); } catch { /* ignore */ }
    }
    return NextResponse.json(quotes, {
      headers: { 'Cache-Control': 'public, max-age=60', 'X-Cache': 'MISS' },
    });
  } catch {
    const fallback: StockQuote[] = SYMBOLS.map(symbol => ({
      symbol, price: 0, change: 0, changePercent: 0,
    }));
    return NextResponse.json(fallback, { headers: { 'Cache-Control': 'public, max-age=30' } });
  }
}
