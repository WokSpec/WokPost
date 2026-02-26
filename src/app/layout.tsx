import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader, SiteFooter } from '@/components/FeedComponents';
import { AdSlot } from '@/components/AdSlot';

export const metadata: Metadata = {
  title: { default: 'WokPost', template: '%s — WokPost' },
  description: 'AI in everything. News across 20 categories, powered by WokSpec.',
  openGraph: {
    type: 'website',
    siteName: 'WokPost',
    url: 'https://wokpost.wokspec.org',
    title: 'WokPost',
    description: 'AI in everything. News across 20 categories.',
    images: [{ url: '/og.png' }],
  },
  twitter: { card: 'summary_large_image', site: '@wokspec' },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <div style={{ borderBottom: '1px solid var(--border)', padding: '2px 0' }}>
          <div className="site-container">
            <AdSlot variant="leaderboard" />
          </div>
        </div>
        <main>{children}</main>
        <SiteFooter />
        <AdSlot variant="sticky" />
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
