/**
 * Cloudflare runtime helpers.
 * Uses getCloudflareContext() from @opennextjs/cloudflare (async mode)
 * instead of the now-deprecated globalThis.__env__ pattern.
 */
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function getDB(): Promise<D1Database | undefined> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env.DB as D1Database | undefined;
  } catch { return undefined; }
}

export async function getKV(): Promise<KVNamespace | undefined> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env.FEED_CACHE as KVNamespace | undefined;
  } catch { return undefined; }
}
