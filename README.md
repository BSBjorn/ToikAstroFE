# TOIK Web

Public website for Tønsberg og Omegn Ishockeyklubb, built with Astro 7, Vue 3, and Tailwind CSS 4. Content and match data come from `toik-strapi`.

## Development

```bash
pnpm install
cp env.example .env
pnpm dev
```

The site runs at `http://localhost:4321`. Start the Strapi CMS at `http://localhost:1337` as well.

Important environment variables:

| Variable | Purpose |
|----------|---------|
| `PUBLIC_STRAPI_URL` | Public Strapi URL used by the browser and media links |
| `STRAPI_INTERNAL_URL` | Server-side Strapi URL |
| `PUBLIC_SITE_URL` | Canonical public site URL |
| `REVALIDATE_SECRET` | Shared secret for the cache-revalidation webhook |
| `PUBLIC_FEATURED_TEAM_SLUG` | Team used for front-page fixtures (default `a-lag`) |

## Commands

```bash
pnpm dev                 # Development server
pnpm build               # Production build
pnpm preview             # Preview the production build
pnpm run types:gen       # Regenerate types from Strapi OpenAPI
pnpm run check:contract  # Verify real CMS and match API queries
pnpm test                # Run unit and data-layer regression tests
```

## Match data

The site uses three custom Strapi endpoints:

- `/api/matches` for upcoming and completed fixtures.
- `/api/matches/live` for the LiveMatch Vue island's phase, score, and statistics.
- `/api/matches/:matchId/stats` for completed-fixture statistics.

The LiveMatch island polls every 5 seconds during live play and every 15 seconds otherwise. All other Strapi requests run server-side through Astro's cached data layer.

See [`../docs/match-api.md`](../docs/match-api.md) for the complete API contract and upstream data flow, and [`AGENTS.md`](AGENTS.md) for architecture and coding conventions.
