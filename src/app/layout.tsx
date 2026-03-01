import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Space_Grotesk, DM_Sans, DM_Mono } from 'next/font/google';
import { SiteHeader, SiteFooter } from '@/components/FeedComponents';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { ToastProvider } from '@/components/ToastProvider';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import Script from 'next/script';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0d0d',
};

export const metadata: Metadata = {
  title: {
    template: '%s — WokPost',
    default: 'WokPost — Workflow insights for builders',
  },
  description: 'Curated workflow tips, tools, and tutorials for indie developers, creators, and businesses.',
  metadataBase: new URL('https://wokpost.wokspec.org'),
  openGraph: {
    type: 'website',
    siteName: 'WokPost',
    url: 'https://wokpost.wokspec.org',
    title: 'WokPost — Workflow insights for builders',
    description: 'Curated workflow tips, tools, and tutorials for indie developers, creators, and businesses.',
    images: [{ url: '/og.png' }],
  },
  twitter: { card: 'summary_large_image', site: '@wokspec' },
  icons: { icon: '/favicon.ico' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} ${dmMono.variable}`}>
        <SessionProvider session={session}>
          <ToastProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <KeyboardHelp />
          </ToastProvider>
        </SessionProvider>
        {process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN && (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN}"}`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
