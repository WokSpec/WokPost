import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Facebook from 'next-auth/providers/facebook';
import Apple from 'next-auth/providers/apple';

// Build provider list from available env vars — only include configured providers
const providers = [
  process.env.AUTH_GOOGLE_ID && Google,
  process.env.AUTH_GITHUB_ID && GitHub,
  process.env.AUTH_FACEBOOK_ID && Facebook,
  process.env.AUTH_APPLE_ID && Apple({
    clientId: process.env.AUTH_APPLE_ID!,
    clientSecret: process.env.AUTH_APPLE_SECRET!,
  }),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
].filter(Boolean) as any[];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },

  callbacks: {
    jwt({ token, account }) {
      // Persist provider name into the JWT so sessions can surface it
      if (account) token.provider = account.provider;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.provider) (session.user as unknown as Record<string, unknown>).provider = token.provider;
      return session;
    },
  },

  events: {
    async signIn({ user, account }) {
      if (!user.id || !user.email) return;
      try {
        // @ts-expect-error — Cloudflare D1 injected at runtime
        const db = globalThis.__env__?.DB;
        if (!db) return;
        await db
          .prepare(
            `INSERT INTO users (id, email, name, image, provider)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(email) DO UPDATE SET
               name     = excluded.name,
               image    = excluded.image,
               provider = excluded.provider`
          )
          .bind(user.id, user.email, user.name ?? '', user.image ?? '', account?.provider ?? '')
          .run();
      } catch {
        // Non-fatal — user can still be authenticated via JWT
      }
    },
  },
});
