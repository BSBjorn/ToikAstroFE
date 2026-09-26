// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Server output, not static.
 *
 * Static would mean editors wait for a CI rebuild after every publish, which
 * undercuts the whole reason we picked a CMS with a good admin. Server rendering
 * plus the TTL cache in src/lib/cache.ts gives fast pages AND immediate updates:
 * the Strapi webhook purges the cache, the next request re-renders.
 *
 * Pages are still fully static HTML to the browser — no client JS except the
 * islands that need it.
 */
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',

  integrations: [vue(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  image: {
    // Strapi serves uploads from its own origin; allow optimisation of those
    domains: ['localhost'],
    remotePatterns: [{ protocol: 'https' }],
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  server: {
    port: 4321,
    host: true,
  },
});
