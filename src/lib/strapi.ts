/**
 * Strapi data layer for Astro.
 *
 * Every function here runs on the server, inside a page's frontmatter or an
 * API route — never in the browser. The one exception is the live match view,
 * which is a Vue island calling Strapi directly from the client.
 *
 * The internal/public URL split matters: server rendering talks to Strapi over
 * the Coolify-internal hostname (stays on the host, no Cloudflare hop), while
 * every media URL handed to the browser must be public. Getting this backwards
 * gives a site that renders fine and shows broken images.
 */

import { cached } from './cache';
import type {
  Article,
  Contact,
  FixtureResponse,
  LiveMatch,
  Page,
  Person,
  Sponsor,
  StrapiMedia,
  StrapiResponse,
  Team,
  TimelineEvent,
  Whistleblow,
} from '../types/strapi';

const PUBLIC_URL = import.meta.env.PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const INTERNAL_URL = import.meta.env.STRAPI_INTERNAL_URL || PUBLIC_URL;

/** Cache windows, tuned to how often each kind of content actually changes. */
const TTL = {
  article: 5 * 60_000,
  team: 30 * 60_000,
  sponsor: 60 * 60_000,
  page: 60 * 60_000,
  frontpage: 5 * 60_000,
  club: 60 * 60_000,
  fixtures: 2 * 60_000,
  contact: 60 * 60_000,
  whistleblow: 60 * 60_000,
  person: 60 * 60_000,
} as const;

type QueryValue = string | number | boolean | undefined | null | string[];

function buildQuery(query: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function request<T>(path: string, query: Record<string, QueryValue> = {}): Promise<T> {
  const url = `${INTERNAL_URL}${path}${buildQuery(query)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Strapi ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

/** Cached GET. `tag` drives webhook purges. */
function get<T>(
  tag: string,
  ttl: number,
  path: string,
  query: Record<string, QueryValue> = {}
): Promise<T> {
  const key = `${path}${buildQuery(query)}`;
  return cached<T>(key, ttl, [tag], () => request<T>(path, query));
}

// --- Media -------------------------------------------------------------

/** Absolute URL for a Strapi upload. Always public — the browser loads it. */
export function mediaUrl(
  media: StrapiMedia | null | undefined,
  format?: 'thumbnail' | 'small' | 'medium' | 'large'
): string | null {
  if (!media) return null;
  const path = (format && media.formats?.[format]?.url) || media.url;
  if (!path) return null;
  return path.startsWith('http') ? path : `${PUBLIC_URL}${path}`;
}

/** Alt text, falling back to caption. Empty string means decorative. */
export const mediaAlt = (media: StrapiMedia | null | undefined): string =>
  media?.alternativeText ?? media?.caption ?? '';

// --- Articles ----------------------------------------------------------

export async function getArticles(options: {
  section?: string;
  category?: string;
  team?: string;
  search?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const { section, category, team, search, page = 1, pageSize = 12 } = options;

  const query: Record<string, QueryValue> = {
    'populate[cover]': 'true',
    'populate[team][fields][0]': 'name',
    'populate[team][fields][1]': 'slug',
    'sort[0]': 'publishDate:desc',
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
  };

  if (section) query['filters[section][$eq]'] = section;
  if (category) query['filters[category][$eq]'] = category;
  if (team) query['filters[team][slug][$eq]'] = team;
  if (search) {
    query['filters[$or][0][title][$containsi]'] = search;
    query['filters[$or][1][excerpt][$containsi]'] = search;
  }

  return get<StrapiResponse<Article[]>>('article', TTL.article, '/api/articles', query);
}

export async function getArticle(slug: string): Promise<Article | null> {
  const res = await get<StrapiResponse<Article[]>>('article', TTL.article, '/api/articles', {
    'filters[slug][$eq]': slug,
    'populate[cover]': 'true',
    'populate[team][fields][0]': 'name',
    'populate[team][fields][1]': 'slug',
    'pagination[pageSize]': 1,
  });
  return res.data[0] ?? null;
}

/** Slugs for prerendering or the sitemap. */
export async function getArticleSlugs(): Promise<string[]> {
  const res = await get<StrapiResponse<Array<{ slug: string }>>>(
    'article',
    TTL.article,
    '/api/articles',
    { 'fields[0]': 'slug', 'pagination[pageSize]': 500 }
  );
  return res.data.map((a) => a.slug);
}

// --- Teams and players -------------------------------------------------

export async function getTeams(category?: string) {
  return get<StrapiResponse<Team[]>>('team', TTL.team, '/api/teams', {
    'populate[photo]': 'true',
    'filters[category][$eq]': category,
    'filters[active][$eq]': true,
    'sort[0]': 'sortOrder:asc',
    'sort[1]': 'name:asc',
    'pagination[pageSize]': 100,
  });
}

export async function getTeam(slug: string): Promise<Team | null> {
  const res = await get<StrapiResponse<Team[]>>('team', TTL.team, '/api/teams', {
    'filters[slug][$eq]': slug,
    'populate[photo]': 'true',
    'populate[players][populate][photo]': 'true',
    'populate[players][sort][0]': 'number:asc',
    'pagination[pageSize]': 1,
  });
  return res.data[0] ?? null;
}

export async function getPlayers(teamSlug: string) {
  return get<StrapiResponse<Player[]>>('player', TTL.team, '/api/players', {
    'filters[team][slug][$eq]': teamSlug,
    'filters[active][$eq]': true,
    'populate[photo]': 'true',
    'sort[0]': 'number:asc',
    'pagination[pageSize]': 100,
  });
}

// --- Sponsors ----------------------------------------------------------

/**
 * Sponsors currently in contract. The `$or` keeps sponsors with no end date
 * visible — the common case, since agreements usually run until someone says
 * otherwise.
 */
export async function getSponsors(tier?: string) {
  const today = new Date().toISOString().slice(0, 10);

  return get<StrapiResponse<Sponsor[]>>('sponsor', TTL.sponsor, '/api/sponsors', {
    'populate[logo]': 'true',
    'filters[tier][$eq]': tier,
    'filters[$or][0][activeTo][$null]': true,
    'filters[$or][1][activeTo][$gte]': today,
    'sort[0]': 'sortOrder:asc',
    'sort[1]': 'name:asc',
    'pagination[pageSize]': 100,
  });
}

// --- Pages -------------------------------------------------------------

export async function getPage(slug: string): Promise<Page | null> {
  const res = await get<StrapiResponse<Page[]>>('page', TTL.page, '/api/pages', {
    'filters[slug][$eq]': slug,
    'populate[content][populate]': '*',
    'populate[parent][fields][0]': 'title',
    'populate[parent][fields][1]': 'slug',
    'populate[children][fields][0]': 'title',
    'populate[children][fields][1]': 'slug',
    'pagination[page]': 1,
    'pagination[pageSize]': 1,
  });
  return res.data[0] ?? null;
}

// --- Single types ------------------------------------------------------

export async function getSingle<T>(name: string, populate = '*'): Promise<T | null> {
  const res = await get<StrapiResponse<T>>(name, TTL.page, `/api/${name}`, { populate });
  return res.data ?? null;
}

/** Fetch frontpage with explicit component/media population. */
export async function getFrontpage(): Promise<StrapiResponse<Frontpage> | null> {
  return get<StrapiResponse<Frontpage>>(
    'frontpage',
    TTL.frontpage,
    '/api/frontpage',
    {
      'populate[hero][populate]': 'image',
      'populate[pinnedArticle][populate]': ['cover', 'team'],
      'populate[sections][populate]': '*',
    }
  );
}

/** Fetch club with explicit component/media population. */
export async function getClub(): Promise<StrapiResponse<Club> | null> {
  return get<StrapiResponse<Club>>(
    'club',
    TTL.club,
    '/api/club',
    {
      'populate[0]': 'logo',
      'populate[1]': 'socialLinks',
    }
  );
}

export async function getContact(): Promise<Contact | null> {
  const res = await get<StrapiResponse<Contact>>('contact', TTL.contact, '/api/contact');
  return res.data ?? null;
}

export async function getWhistleblow(): Promise<Whistleblow | null> {
  const res = await get<StrapiResponse<Whistleblow>>('whistleblow', TTL.whistleblow, '/api/whistleblow');
  return res.data ?? null;
}

export async function getPages(options: { slug?: string; parent?: string } = {}) {
  const { slug, parent } = options;
  const query: Record<string, QueryValue> = {
    'sort[0]': 'sortOrder:asc',
    'pagination[page]': 1,
    'pagination[pageSize]': 100,
  };
  if (slug) query['filters[slug][$eq]'] = slug;
  // parent-based filtering is unreliable (Strapi v5 self-ref bug), skip

  const res = await get<StrapiResponse<Page[]>>('page', TTL.page, '/api/pages', query);
  if (slug) return res.data[0] ?? null;
  return res.data;
}

/** Page tree with proper parent→children hierarchy. Uses custom endpoint to bypass Strapi v5 ORM self-ref bug. */
export interface TreeNode extends Omit<Page, 'content' | 'parent'> {
  children: TreeNode[];
}

export async function getPageTree(): Promise<TreeNode[]> {
  const res = await get<{ data: TreeNode[] }>('page', TTL.page, '/pages/tree');
  return res.data ?? [];
}

export async function getPersons(): Promise<Person[]> {
  const res = await get<StrapiResponse<Person[]>>('person', TTL.person, '/api/persons', {
    'populate[photo]': 'true',
    'sort[0]': 'name:asc',
    'pagination[page]': 1,
    'pagination[pageSize]': 100,
  });
  return res.data;
}

// --- Matches -----------------------------------------------------------

/** Fetch fixtures for a team. Returns empty array if the team or fixture API is unavailable. */
export async function getFixtures(
  team: string,
  type: 'upcoming' | 'completed' = 'upcoming',
  limit = 5
): Promise<FixtureResponse> {
  try {
    return await get<FixtureResponse>('fixtures', TTL.fixtures, '/api/matches', { team, type, limit });
  } catch (err: any) {
    if (err?.message?.includes('-> 404') || err?.status === 404) return { data: [] };
    throw err;
  }
}

export async function getMatchStats(matchId: number) {
  try {
    const res = await fetch(`${INTERNAL_URL}/api/matches/live?matchId=${matchId}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data: LiveMatch | null };
    if (!body?.data) return null;
    const d = body.data;
    return {
      shots: d.shots ?? undefined,
      penalties: d.penalties ?? undefined,
      penaltyMinutes: d.penaltyMinutes ?? undefined,
      faceoffs: d.faceoffs ?? undefined,
      timeline: d.timeline
        .filter((e): e is TimelineEvent => (e as { type?: string }).type === 'goal')
        .map((e) => ({
          period: e.period,
          time: e.time ?? 0,
          team: e.team,
          scorer: e.scorer ?? null,
          assists: e.assists ?? [],
          flags: e.flags ?? [],
          score: { ...e.score },
        })),
    };
  } catch {
    return null;
  }
}

/** Return type of `getMatchStats`. */
export type MatchStats = ReturnType<typeof getMatchStats>;

/** Enrich completed fixtures with match stats (goals, shots, penalties, faceoffs). */
export async function enrichFixturesWithStats(fixtures: Fixture[]) {
  return Promise.all(
    fixtures.map(async (f) => ({
      ...f,
      stats: f.id ? (await getMatchStats(f.id)) ?? null : null,
    }))
  );
}

// --- Formatting --------------------------------------------------------

const NB_DATE = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Oslo',
});

const NB_DATE_SHORT = new Intl.DateTimeFormat('nb-NO', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/Oslo',
});

export const formatDate = (iso: string) => NB_DATE.format(new Date(iso));
export const formatDateShort = (iso: string) => NB_DATE_SHORT.format(new Date(iso));

/** The public URL, for anything the browser must call directly. */
export const publicStrapiUrl = () => PUBLIC_URL;
