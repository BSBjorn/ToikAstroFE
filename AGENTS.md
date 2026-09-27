# TOIK Web — Agent Guidelines

## Overview

This is the public website for **Tønsberg og Omegn Ishockeyklubb (TOIK)**, a club site built with **Astro 7 + Vue 3 + Tailwind CSS 4**, backed by a **Strapi CMS**. The server renders on Node (standalone adapter) — not fully static — so editors see changes immediately via a Strapi webhook that purges the in-process TTL cache.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 7 (server output, `@astrojs/node` standalone adapter) |
| UI | Astro components (`.astro`) + Vue 3 islands (`.vue`) |
| Styling | Tailwind CSS 4 via Vite plugin, custom design tokens in `src/styles/main.css` |
| CMS | Strapi (content fetched via REST at build/request time) |
| Cache | In-process TTL cache with tag-based purge via Strapi webhook (`src/lib/cache.ts`) |
| Package manager | pnpm (Node >= 22.12.0) |

## Project Structure

```
public/            # Static assets (favicon)
src/
  components/
    ArticleCard.astro      # News/article card (featured variant on front page)
    FixtureList.astro      # Upcoming / completed match list
    Grasrot.astro          # Norsk Tipping grasrot call-to-action
    LiveMatch.vue          # Live match score island (Vue, polls Strapi)
    RichText.astro         # Strapi blocks rich-text renderer (recursive)
    SiteFooter.astro       # Multi-column footer with club links
    SiteHeader.astro       # Sticky header, hardcoded nav
    SponsorGrid.astro      # Tiered sponsor logo grid
  layouts/
    Base.astro             # Document shell, cache headers, metadata, OG tags
  lib/
    cache.ts               # TTL cache with tag purge (replaced by Redis if scaled)
    strapi.ts              # All Strapi API calls, media helpers, date formatters
  pages/
    index.astro            # Front page — hero, live match, fixtures, news, sponsors
    api/revalidate.ts      # POST webhook endpoint for Strapi cache purging
  styles/
    main.css               # Design tokens (brand, accent, ice), dark mode, prose
  types/
    strapi.ts              # Hand-written types for Strapi REST response shapes
```

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (use `astro dev --background` per AGENTS.md)
pnpm build            # Production build to ./dist/
pnpm preview          # Preview production build locally
```

## Environment Variables

Copy `env.example` to `.env`. Required variables:

| Variable | Purpose |
|----------|---------|
| `PUBLIC_STRAPI_URL` | Strapi public URL (browser-facing, for media & LiveMatch island) |
| `STRAPI_INTERNAL_URL` | Strapi internal URL (server-side, stays on host in Coolify) |
| `PUBLIC_SITE_URL` | Site's own public URL (canonical links, sitemap, OG) |
| `REVALIDATE_SECRET` | Shared secret for Strapi webhook auth (generate with `openssl rand -hex 32`) |
| `PUBLIC_FEATURED_TEAM_SLUG` | Team slug for front-page fixtures (default: `"a-lag"`) |

## Architecture Notes

### Caching Strategy

- **In-process cache** (`src/lib/cache.ts`): Every Strapi GET call goes through `cached(key, ttl, tags, produce)`. TTLs are tuned per content type (articles 5 min, teams 30 min, sponsors 60 min, fixtures 2 min).
- **Edge cache**: `Base.astro` sets `Cache-Control: public, max-age=0, s-maxage=<N>, stale-while-revalidate=<4N>`. Cloudflare serves stale-while-revalidate on top.
- **Webhook purge**: When an editor publishes in Strapi, a webhook fires `POST /api/revalidate`. The endpoint authenticates via `x-revalidate-secret` and purges affected cache tags. Unknown models (single types) clear everything.
- **Fail-open**: If a Strapi call fails, stale cached data is served rather than showing an error page.

### Server vs Client

- All Strapi calls happen on the server in Astro frontmatter. The browser never calls Strapi directly.
- The **one exception** is `LiveMatch.vue`, a Vue island that polls Strapi from the client for live scores. It receives `PUBLIC_STRAPI_URL` as a prop.
- The site ships zero JavaScript except for the LiveMatch island.

### Design Tokens

All colors are defined in `src/styles/main.css` as CSS custom properties:

- `--color-brand-*` — Navy ramp (primary brand color)
- `--color-accent-*` — Rink red ramp (scores, CTAs, live state)
- `--color-ice-*` — Cool neutrals (surfaces, text, lines)
- Semantic tokens (`--color-surface`, `--color-ink`, `--color-line`) derive from the ramps

Dark mode is supported via `prefers-color-scheme: dark` and `data-theme="dark"`.

### Content Models (Strapi)

The front end expects these Strapi content types:

| Type | Description | Key Fields |
|------|-------------|------------|
| `article` | News, match reports, announcements | title, slug, publishDate, excerpt, cover, body, section, category, team |
| `team` | Hockey teams (youth, senior, etc.) | name, slug, photo, category, players[] |
| `player` | Individual players | name, number, position, photo, team |
| `sponsor` | Club sponsors | name, logo, tier (hoved/partner/stotte), activeFrom, activeTo |
| `page` | Static pages (klubben/*) | title, slug, body, parent, children |
| `forside` (single) | Front page hero content | title, text, image |
| `klubb` (single) | Club info (org number, email, address) | orgNumber, email, address |

Match data comes from a custom Strapi endpoint (`/api/matches`) — not a standard Strapi content type.

### Page Routes

| Route | Source | Notes |
|-------|--------|-------|
| `/` | `src/pages/index.astro` | Front page |
| `/nyheter` | Dynamic — uses `getArticles()` | Article listing |
| `/nyhem/[slug]` | Dynamic — uses `getArticle(slug)` | Single article |
| `/lag` | Dynamic — uses `getTeams()` | Team listing |
| `/lag/[slug]` | Dynamic — uses `getTeam(slug)` | Single team with players |
| `/kamper` | Dynamic — uses `getFixtures()` | Fixtures/results |
| `/klubben/*` | Dynamic — uses `getPage(slug)` | Static pages (styre, historie, etc.) |
| `/sponsorer` | Dynamic — uses `getSponsors()` | Sponsor listing |
| `/kontakt` | Dynamic — uses `getPage('kontakt')` | Contact page |

The exact route structure depends on Astro file conventions and any dynamic routes not yet created.

## Coding Conventions

- **No comments unless necessary.** The codebase is intentionally self-documenting.
- **Type safety is hand-written.** Types in `src/types/strapi.ts` describe the REST API response shape, not Strapi's admin schema. Keep them in sync with the CMS.
- **Defensive rendering.** Front page sections use `Promise.allSettled` so one failing source doesn't break the whole page.
- **No CMS-driven navigation.** The header nav is hardcoded in `SiteHeader.astro`. Move it to a single type later if the board wants control.
- **Norwegian locale.** All dates use `nb-NO` locale with `Europe/Oslo` timezone.
- **Components are single-purpose.** Each component handles one UI element. Composition happens in pages.

## Deployment

Built with Docker (multi-stage). Requires `PUBLIC_STRAPI_URL` and `PUBLIC_SITE_URL` as build args. Runs on port 4321. Health check hits `/`.

Deployed behind Cloudflare for edge caching. The Coolify internal network routes server-to-Strapi traffic without leaving the host.

## Current Site

Reference: https://toik.no — use for layout/content inspiration. The site is in Norwegian (bokmål).
