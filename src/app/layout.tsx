import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader, SiteFooter } from '@/components/FeedComponents';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: { default: 'WokPost', template: '%s — WokPost' },
  description: 'Open source, unbiased news across 20 categories. No algorithms. No sponsored content.',
  metadataBase: new URL('https://wokpost.wokspec.org'),
  openGraph: {
    type: 'website',
    siteName: 'WokPost',
    url: 'https://wokpost.wokspec.org',
    title: 'WokPost — Open Source Unbiased News',
    description: 'Verified, unbiased news across 20 categories.',
    images: [{ url: '/og.png' }],
  },
  twitter: { card: 'summary_large_image', site: '@wokspec' },
  icons: { icon: '/favicon.ico' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
