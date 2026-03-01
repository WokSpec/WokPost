'use client';

import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 58, // below sticky header
        left: 0,
        right: 0,
        height: 2,
        zIndex: 99,
        background: 'var(--border)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--violet))',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
}
