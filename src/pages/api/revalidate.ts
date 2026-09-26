/**
 * Strapi publish webhook -> purge the TTL cache.
 *
 * In Strapi: Settings -> Webhooks -> Create
 *   URL     https://toik.no/api/revalidate
 *   Events  entry.publish, entry.unpublish, entry.update, entry.delete
 *   Header  x-revalidate-secret: <REVALIDATE_SECRET>
 *
 * Without it the site still updates on its own within the TTL window from
 * src/lib/strapi.ts. This makes an editor's change appear on the next request.
 */

import type { APIRoute } from 'astro';
import { purgeAll, purgeTags, cacheStats } from '../../lib/cache';

export const prerender = false;

/** Strapi model name -> cache tags it can affect. */
const TAGS_BY_MODEL: Record<string, string[]> = {
  article: ['article'],
  team: ['team', 'fixtures'],
  player: ['player', 'team'],
  sponsor: ['sponsor'],
  page: ['page'],
};

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.REVALIDATE_SECRET;

  if (!secret) {
    return json({ error: 'Revalidation is not configured' }, 501);
  }
  if (request.headers.get('x-revalidate-secret') !== secret) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body: { model?: string; event?: string } = {};
  try {
    body = await request.json();
  } catch {
    // An empty body is treated as "purge everything"
  }

  const model = body.model ?? '';
  const tags = TAGS_BY_MODEL[model];

  // Unknown model, or a single type (forside, klubb, kontakt): clear the lot.
  // The cache is small and refills on the next request, so this is cheap.
  const purged = tags ? purgeTags(tags) : purgeAll();

  return json({
    ok: true,
    model: model || null,
    event: body.event ?? null,
    tags: tags ?? 'all',
    purged,
    remaining: cacheStats().entries,
  });
};

/** Health/debug: how warm is the cache right now. */
export const GET: APIRoute = async ({ request }) => {
  const secret = import.meta.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return json({ error: 'Unauthorized' }, 401);
  }
  return json(cacheStats());
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
