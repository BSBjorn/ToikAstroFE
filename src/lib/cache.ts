/**
 * TTL cache for Strapi responses, living in the Node process.
 *
 * Astro's server output renders every request fresh, so without this each page
 * view would hit Strapi several times. With it, a burst of traffic costs one
 * upstream call per entry per TTL window.
 *
 * Replaces what Nitro's routeRules/SWR would have done, with one advantage:
 * the Strapi webhook can purge by tag, so an editor's change appears on the
 * next request rather than after the window expires.
 *
 * Single-process only. If the app is ever scaled to several replicas, swap the
 * Map for Redis — the interface below stays the same.
 */

interface Entry<T> {
  value: T;
  expires: number;
  /** Coarse labels ("article", "sponsor") used for targeted purges. */
  tags: string[];
}

const store = new Map<string, Entry<unknown>>();

/** In-flight requests, so a cold key hit by 50 concurrent requests fetches once. */
const inflight = new Map<string, Promise<unknown>>();

export const DEFAULT_TTL_MS = 5 * 60 * 1000;

export async function cached<T>(
  key: string,
  ttlMs: number,
  tags: string[],
  produce: () => Promise<T>
): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const promise = produce()
    .then((value) => {
      store.set(key, { value, expires: Date.now() + ttlMs, tags });
      return value;
    })
    .catch((err) => {
      // Stale data beats an error page for a club site
      if (hit) {
        console.error(`[cache] ${key} failed, serving stale:`, err);
        return hit.value;
      }
      throw err;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

/** Drop every entry carrying any of these tags. Returns how many went. */
export function purgeTags(tags: string[]): number {
  if (!tags.length) return 0;
  let removed = 0;
  for (const [key, entry] of store) {
    if (entry.tags.some((tag) => tags.includes(tag))) {
      store.delete(key);
      removed += 1;
    }
  }
  return removed;
}

export function purgeAll(): number {
  const size = store.size;
  store.clear();
  return size;
}

export const cacheStats = () => ({ entries: store.size, inflight: inflight.size });
