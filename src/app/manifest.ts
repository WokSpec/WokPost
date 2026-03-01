import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WokPost',
    short_name: 'WokPost',
    description: 'Workflow insights for builders — curated news, analysis, and editorial from Eral.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d0d',
    theme_color: '#0d0d0d',
    orientation: 'portrait-primary',
    categories: ['news', 'productivity', 'technology'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    shortcuts: [
      {
        name: 'Editorial',
        short_name: 'Editorial',
        description: 'Read Eral editorial posts',
        url: '/editorial',
      },
      {
        name: 'Trending',
        short_name: 'Trending',
        description: 'See trending stories',
        url: '/trending',
      },
      {
        name: 'Bookmarks',
        short_name: 'Saved',
        description: 'Your saved stories',
        url: '/bookmarks',
      },
    ],
  };
}
