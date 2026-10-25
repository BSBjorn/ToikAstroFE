import test from 'node:test';
import assert from 'node:assert/strict';

test('formatMatchClock renders remaining game time as mm:ss', async () => {
  const { formatMatchClock } = await import('./match-time.ts').catch(() => ({} as any));

  assert.equal(typeof formatMatchClock, 'function');
  assert.equal(formatMatchClock(1091), '18:11');
  assert.equal(formatMatchClock(401), '06:41');
  assert.equal(formatMatchClock(0), '00:00');
  assert.equal(formatMatchClock(Number.NaN), '–');
  assert.equal(formatMatchClock(-1), '–');
});
