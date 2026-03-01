import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — WokPost',
  description: 'How WokPost handles your data. Your reading stays private — we never sell or share personal information.',
};

const LAST_UPDATED = 'March 1, 2026';

export default function PrivacyPage() {
  return (
    <div className="site-container" style={{ maxWidth: 740, paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          Legal
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="prose-content">
        <Section title="Overview">
          <p>WokPost is a curated news aggregation platform built by <a href="https://wokspec.org" target="_blank" rel="noopener noreferrer">Wok Specialists</a>. We believe your reading habits are your business. We collect the minimum data needed to operate the service and never sell or share your personal information.</p>
        </Section>

        <Section title="Information We Collect">
          <h3>Account Information</h3>
          <p>When you sign in via OAuth (Google, GitHub, Facebook, or Apple), we receive and store:</p>
          <ul>
            <li>Your name and email address</li>
            <li>Your profile image URL</li>
            <li>Which provider you used to sign in</li>
          </ul>
          <p>This information is used to identify your account and is never shared with third parties.</p>

          <h3>Usage Data</h3>
          <p>When you interact with WokPost we may store:</p>
          <ul>
            <li><strong>Bookmarks</strong> — articles you explicitly save</li>
            <li><strong>Saved Feeds</strong> — filter presets you create</li>
            <li><strong>Votes</strong> — upvotes you cast (stored as a hashed IP, not linked to your account)</li>
            <li><strong>Comments</strong> — public discussion you post on stories</li>
          </ul>

          <h3>Newsletter Subscriptions</h3>
          <p>If you subscribe to the WokPost Digest we store your email address and topic preferences. You can unsubscribe at any time by replying to any digest email.</p>
        </Section>

        <Section title="Cookies &amp; Session Data">
          <p>WokPost uses a single session cookie to maintain your signed-in state. No advertising or tracking cookies are used. Anonymous bookmarks are stored in your browser&apos;s <code>localStorage</code> and never sent to our servers.</p>
        </Section>

        <Section title="Third-Party Services">
          <ul>
            <li><strong>Cloudflare</strong> — We run on Cloudflare Pages and D1. Cloudflare processes request metadata (IP addresses) to serve and protect the site. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare&apos;s Privacy Policy</a>.</li>
            <li><strong>OAuth Providers</strong> — Google, GitHub, Facebook, and Apple handle authentication. Their privacy policies apply to the login flow.</li>
            <li><strong>Favicons</strong> — We load favicon images from Google&apos;s S2 service (<code>www.google.com/s2/favicons</code>) to show source icons.</li>
          </ul>
        </Section>

        <Section title="Data Retention">
          <p>Your account data is retained as long as your account exists. Bookmarks and saved feeds are deleted when you remove them or delete your account. Comments are public and may be retained even if your account is removed. Votes are stored as anonymous IP hashes with no retention schedule.</p>
        </Section>

        <Section title="Your Rights">
          <p>You can:</p>
          <ul>
            <li>Delete bookmarks and saved feeds directly from your <Link href="/profile">Profile</Link> page</li>
            <li>Request deletion of your account and all associated data by emailing <a href="mailto:privacy@wokspec.org">privacy@wokspec.org</a></li>
            <li>Unsubscribe from the newsletter at any time</li>
          </ul>
        </Section>

        <Section title="Children's Privacy">
          <p>WokPost is not directed at children under 13. We do not knowingly collect personal information from children.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>We may update this policy as the service evolves. Material changes will be reflected in the &ldquo;Last updated&rdquo; date at the top of this page.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about this policy? Reach us at <a href="mailto:privacy@wokspec.org">privacy@wokspec.org</a> or via <a href="https://wokspec.org" target="_blank" rel="noopener noreferrer">wokspec.org</a>.</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
        {title}
      </h2>
      <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.875rem' }}>
        {children}
      </div>
    </section>
  );
}
