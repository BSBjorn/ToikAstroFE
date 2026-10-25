export function formatMatchClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '–';

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = wholeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
