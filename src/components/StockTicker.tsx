'use client';

import { useEffect, useState } from 'react';
import type { StockQuote } from '@/app/api/stocks/route';

const REFRESH_MS = 5 * 60 * 1000; // 5 min

function fmt(n: number, decimals = 2): string {
  if (!n && n !== 0) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function QuoteItem({ q }: { q: StockQuote }) {
  const sign = q.change > 0 ? '+' : q.change < 0 ? '' : '';
  const cls = q.change > 0 ? 'ticker-up' : q.change < 0 ? 'ticker-down' : 'ticker-flat';
  const sym = q.symbol.replace('-USD', '');
  return (
    <span className="ticker-item">
      <span className="ticker-sym">{sym}</span>
      {q.price > 0 && <span className="ticker-price">{fmt(q.price)}</span>}
      {q.price > 0 && (
        <span className={`ticker-change ${cls}`}>
          {sign}{fmt(q.change)} ({sign}{fmt(q.changePercent)}%)
        </span>
      )}
    </span>
  );
}

export function StockTicker() {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);

  const load = async () => {
    try {
      const res = await fetch('/api/stocks');
      if (res.ok) {
        const data = await res.json() as StockQuote[];
        setQuotes(data.filter(q => q.price > 0));
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  if (quotes.length === 0) return null;

  const doubled = [...quotes, ...quotes];

  return (
    <div className="ticker-wrap" aria-hidden="true">
      <div className="ticker-label-bar">
        <span className="ticker-label-text">Markets</span>
      </div>
      <div className="ticker-track">
        {doubled.map((q, i) => <QuoteItem key={`${q.symbol}-${i}`} q={q} />)}
      </div>
    </div>
  );
}
