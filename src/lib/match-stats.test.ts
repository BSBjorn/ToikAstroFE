import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

test('getMatchStats requests the public Strapi stats route', async () => {
  const originalFetch = globalThis.fetch;
  let server;

  globalThis.fetch = async (input) => {
    const url = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    );

    if (url.pathname !== '/api/matches/8390493/stats') {
      return new Response('Not found', { status: 404 });
    }

    return Response.json({
      data: {
        shots: { home: 32, away: 21 },
        penalties: { home: 1, away: 2 },
        penaltyMinutes: { home: 2, away: 4 },
        faceoffs: { home: 20, away: 18, total: 38, homePct: 53 },
        timeline: [],
      },
    });
  };

  try {
    const require = createRequire(import.meta.url);
    const astroRequire = createRequire(require.resolve('astro/package.json'));
    const { createServer } = await import(astroRequire.resolve('vite'));
    server = await createServer({
      configFile: false,
      root: process.cwd(),
      logLevel: 'silent',
      server: { middlewareMode: true, watch: null },
    });
    const { getMatchStats } = await server.ssrLoadModule('/src/lib/strapi.ts');
    const stats = await getMatchStats(8390493, 825160, 188173);

    assert.equal(stats?.shots.home, 32);
    assert.equal(stats?.shots.away, 21);
  } finally {
    await server?.close();
    globalThis.fetch = originalFetch;
  }
});
