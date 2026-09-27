#!/usr/bin/env node
/**
 * Contract check: do the queries this site actually makes still work?
 *
 * Generated types tell you the CMS schema. They do NOT tell you whether the
 * `populate` and `filters` strings in src/lib/strapi.ts still line up with it.
 * Rename `excerpt` to `ingress` in the Content-Type Builder and every generated
 * type updates happily while the front page quietly renders blank summaries.
 *
 * This runs the real queries against a real Strapi and asserts the fields the
 * templates read are present. Run it locally after any schema change, and in CI.
 *
 * Usage:
 *   node scripts/check-contract.mjs --strapi http://localhost:1337
 *   node scripts/check-contract.mjs --strapi https://toik-strapi.bking.no --team a-lag
 *
 * Exit code 1 if any contract is broken, so CI fails.
 */

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, arg, i, arr) => {
    if (!arg.startsWith('--')) return acc;
    const next = arr[i + 1];
    acc.push([arg.slice(2), !next || next.startsWith('--') ? true : next]);
    return acc;
  }, [])
);

const STRAPI = (args.strapi || process.env.STRAPI_INTERNAL_URL || 'http://localhost:1337').replace(/\/$/, '');
const TEAM = args.team || process.env.PUBLIC_FEATURED_TEAM_SLUG || 'a-lag';

/**
 * Each check names the query the site makes and the fields templates read.
 *
 * `required`  — missing means a broken page. Fails the build.
 * `optional`  — nice to have; reported but tolerated (an empty CMS is not a bug).
 * `at`        — where in the response body to look for the entity.
 */
const CHECKS = [
  {
    name: 'articles (front page + /nyheter)',
    path: '/api/articles',
    query: {
      'populate[cover]': 'true',
      'populate[team][fields][0]': 'name',
      'populate[team][fields][1]': 'slug',
      'sort[0]': 'publishDate:desc',
      'pagination[pageSize]': 1,
    },
    at: (body) => body?.data?.[0],
    required: ['title', 'slug', 'excerpt', 'section', 'category', 'publishDate'],
    optional: ['cover', 'team'],
  },
  {
    name: 'article detail (body blocks)',
    path: '/api/articles',
    query: { 'populate[body][populate]': '*', 'pagination[pageSize]': 1 },
    at: (body) => body?.data?.[0],
    required: ['body'],
    // A blocks field must be an array, or RichText renders nothing
    assert: (entry) =>
      Array.isArray(entry.body) ? null : `body is ${typeof entry.body}, expected an array of blocks`,
  },
  {
    name: 'teams (/lag)',
    path: '/api/teams',
    query: { 'populate[photo]': 'true', 'sort[0]': 'sortOrder:asc', 'pagination[pageSize]': 1 },
    at: (body) => body?.data?.[0],
    required: ['name', 'slug'],
    optional: ['photo', 'tournamentId', 'teamId', 'category', 'active', 'sortOrder'],
  },
  {
    name: 'sponsors (front page grid)',
    path: '/api/sponsors',
    query: { 'populate[logo]': 'true', 'sort[0]': 'sortOrder:asc', 'pagination[pageSize]': 1 },
    at: (body) => body?.data?.[0],
    required: ['name', 'tier'],
    optional: ['logo', 'url', 'activeFrom', 'activeTo', 'sortOrder'],
  },
  {
    name: 'sponsor active-date filter',
    path: '/api/sponsors',
    query: {
      'filters[$or][0][activeTo][$null]': 'true',
      'filters[$or][1][activeTo][$gte]': new Date().toISOString().slice(0, 10),
      'pagination[pageSize]': 1,
    },
    at: (body) => body,
    required: ['data'],
    // A malformed $or filter returns 400, not an empty list — that is the real risk
  },
  {
    name: 'players',
    path: '/api/players',
    query: { 'populate[photo]': 'true', 'sort[0]': 'number:asc', 'pagination[pageSize]': 1 },
    at: (body) => body?.data?.[0],
    required: ['name'],
    optional: ['number', 'position', 'photo', 'active'],
  },
  {
    name: 'pages (/klubben)',
    path: '/api/pages',
    query: { 'populate[body][populate]': '*', 'pagination[pageSize]': 1 },
    at: (body) => body?.data?.[0],
    required: ['title', 'slug'],
    optional: ['body', 'parent', 'children'],
  },
  {
    name: 'matches — upcoming (custom route)',
    path: '/api/matches',
    query: { team: TEAM, type: 'upcoming', limit: 1 },
    at: (body) => body,
    required: ['data', 'meta'],
    assert: (body) => {
      if (!Array.isArray(body.data)) return 'data is not an array';
      const first = body.data[0];
      if (!first) return null; // out of season is fine
      const missing = ['id', 'date', 'homeTeam', 'awayTeam', 'isHome'].filter((k) => !(k in first));
      return missing.length ? `fixture missing ${missing.join(', ')}` : null;
    },
  },
  {
    name: 'matches — live (custom route)',
    path: '/api/matches/live',
    query: {},
    at: (body) => body?.data,
    required: ['active', 'arena', 'timeline'],
    assert: (state) =>
      Array.isArray(state.timeline) ? null : 'timeline is not an array',
  },
];

// ---------------------------------------------------------------------------

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function url(path, query) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) params.set(k, String(v));
  const qs = params.toString();
  return `${STRAPI}${path}${qs ? `?${qs}` : ''}`;
}

let failures = 0;
let warnings = 0;

console.log(`\n  Contract check against ${STRAPI}`);
console.log(`  ${DIM}featured team: ${TEAM}${RESET}\n`);

for (const check of CHECKS) {
  const target = url(check.path, check.query);
  let body;

  try {
    const res = await fetch(target, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      // 403 means the Public role lost a permission — a real, common breakage
      const hint =
        res.status === 403
          ? ' (Public role missing find/findOne?)'
          : res.status === 400
            ? ' (malformed filter or populate?)'
            : '';
      console.log(`  ${RED}FAIL${RESET}  ${check.name}`);
      console.log(`        HTTP ${res.status}${hint}`);
      console.log(`        ${DIM}${target}${RESET}`);
      failures += 1;
      continue;
    }

    body = await res.json();
  } catch (err) {
    console.log(`  ${RED}FAIL${RESET}  ${check.name}`);
    console.log(`        ${err.message}`);
    failures += 1;
    continue;
  }

  const entry = check.at(body);

  if (!entry) {
    // No content yet is not a contract breach — it just cannot be verified
    console.log(`  ${YELLOW}SKIP${RESET}  ${check.name}  ${DIM}no entries to inspect${RESET}`);
    warnings += 1;
    continue;
  }

  const missing = (check.required ?? []).filter((field) => !(field in entry));
  const absent = (check.optional ?? []).filter((field) => !(field in entry));
  const assertion = check.assert ? check.assert(entry) : null;

  if (missing.length || assertion) {
    console.log(`  ${RED}FAIL${RESET}  ${check.name}`);
    if (missing.length) {
      console.log(`        missing required: ${missing.join(', ')}`);
      console.log(`        ${DIM}present: ${Object.keys(entry).join(', ')}${RESET}`);
    }
    if (assertion) console.log(`        ${assertion}`);
    console.log(`        ${DIM}${target}${RESET}`);
    failures += 1;
    continue;
  }

  const note = absent.length ? `  ${DIM}(not populated: ${absent.join(', ')})${RESET}` : '';
  console.log(`  ${GREEN}ok${RESET}    ${check.name}${note}`);
}

console.log(
  `\n  ${failures ? RED : GREEN}${CHECKS.length - failures - warnings} passed${RESET}` +
    `${warnings ? `, ${YELLOW}${warnings} skipped${RESET}` : ''}` +
    `${failures ? `, ${RED}${failures} failed${RESET}` : ''}\n`
);

process.exit(failures > 0 ? 1 : 0);
