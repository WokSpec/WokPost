'use client';

import { useEffect, useState } from 'react';

interface Heading { id: string; text: string; level: number; }

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.editorial-content h2, .editorial-content h3')) as HTMLHeadingElement[];
    if (els.length < 2) return;

    const list: Heading[] = els.map((el, i) => {
      if (!el.id) el.id = `heading-${i}`;
      return { id: el.id, text: el.textContent ?? '', level: parseInt(el.tagName[1]) };
    });
    setHeadings(list);

    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  if (headings.length < 2) return null;

  return (
    <aside className="toc-sidebar" aria-label="Table of contents">
      <div className="toc-label">Contents</div>
      <nav>
        {headings.map(h => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`toc-link${h.level === 3 ? ' toc-sub' : ''}${active === h.id ? ' toc-active' : ''}`}
            onClick={e => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
