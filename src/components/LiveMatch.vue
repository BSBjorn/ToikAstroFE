<script setup lang="ts">
/**
 * Live match view — the one genuinely interactive part of the site.
 *
 * Mounted as an Astro island with client:load. It calls Strapi directly from
 * the browser, so the score is never baked into a cached page, and it pauses
 * polling on a hidden tab so a forgotten tab doesn't poll all night.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { LiveMatch, TimelineEvent } from '../types/strapi';

const props = withDefaults(
  defineProps<{
    /** Public Strapi URL — passed from Astro, since the island runs client-side. */
    strapiUrl: string;
    /** Inspect a specific match instead of auto-detecting the active one. */
    matchId?: string;
    /** Team slug or document ID for auto-detection (overrides arena default). */
    team?: string;
    intervalMs?: number;
  }>(),
  { intervalMs: 15_000 }
);

const state = ref<LiveMatch | null>(null);
const pending = ref(true);
const failed = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const endpoint = computed(() => {
  const url = new URL('/api/matches/live', props.strapiUrl);
  if (props.matchId) url.searchParams.set('matchId', props.matchId);
  if (props.team) url.searchParams.set('team', props.team);
  return url.toString();
});

async function refresh() {
  try {
    const res = await fetch(endpoint.value, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(String(res.status));
    state.value = (await res.json()).data as LiveMatch;
    failed.value = false;
  } catch {
    // Keep showing the last good state rather than blanking mid-match
    failed.value = true;
  } finally {
    pending.value = false;
  }
}

function start() {
  if (timer) return;
  refresh();
  timer = setInterval(refresh, props.intervalMs);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

function onVisibility() {
  document.hidden ? stop() : start();
}

onMounted(() => {
  start();
  document.addEventListener('visibilitychange', onVisibility);
});

onUnmounted(() => {
  stop();
  document.removeEventListener('visibilitychange', onVisibility);
});

const match = computed(() => state.value?.match ?? null);
const score = computed(() => state.value?.score ?? { home: 0, away: 0 });

/** Group the timeline by period so each gets its own heading. */
const byPeriod = computed(() => {
  const groups = new Map<number | null, TimelineEvent[]>();
  for (const event of state.value?.timeline ?? []) {
    const bucket = groups.get(event.period);
    if (bucket) bucket.push(event);
    else groups.set(event.period, [event]);
  }
  return [...groups.entries()];
});

/**
 * `time` is wall-clock seconds within the period, not a game clock, so it is
 * never rendered as a minute marker — only used for ordering, done server-side.
 */
const flagLabel = (flag: string) =>
  ({
    PP1: 'Overtall',
    'Empty net': 'Tomt bur',
    'Game Winning Goal': 'Seiersmål',
  })[flag] ?? null;
</script>

<template>
  <section
    class="rounded-card border border-line bg-surface-raised shadow-card"
    aria-live="polite"
  >
    <!-- Loading -->
    <div v-if="pending" class="p-6">
      <div class="h-5 w-32 animate-pulse rounded bg-surface-sunken" />
      <div class="mt-4 h-12 w-48 animate-pulse rounded bg-surface-sunken" />
    </div>

    <!-- Nothing on -->
    <div v-else-if="!match" class="p-6 text-ink-muted">
      <p class="font-medium text-ink">Ingen kamp akkurat nå</p>
      <p class="mt-1 text-sm">Live-resultater vises her når det spilles i {{ state?.arena }}.</p>
    </div>

    <!-- Match -->
    <div v-else>
      <header class="flex items-center justify-between gap-4 border-b border-line px-6 py-3">
        <p class="text-sm text-ink-muted">
          {{ match.tournament ?? 'Kamp' }} · {{ match.venue }}
        </p>
        <span
          v-if="state?.active"
          class="inline-flex items-center gap-2 rounded-pill bg-accent-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
        >
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-white/70" />
            <span class="relative inline-flex size-2 rounded-full bg-white" />
          </span>
          Direkte
        </span>
        <span v-else class="text-xs uppercase tracking-wide text-ink-muted">Ferdig</span>
      </header>

      <!-- Scoreline -->
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-6">
        <p class="text-right text-lg font-semibold">{{ match.homeTeam }}</p>
        <p class="font-display text-5xl tabular-nums">
          {{ score.home }}<span class="mx-2 text-ink-muted">–</span>{{ score.away }}
        </p>
        <p class="text-lg font-semibold">{{ match.awayTeam }}</p>
      </div>

      <!-- Stats -->
      <dl
        v-if="state?.shots"
        class="grid grid-cols-3 gap-px border-y border-line bg-line text-center"
      >
        <div class="bg-surface-raised px-3 py-3">
          <dt class="text-xs uppercase tracking-wide text-ink-muted">Skudd</dt>
          <dd class="mt-1 font-semibold tabular-nums">
            {{ state.shots.home }}–{{ state.shots.away }}
          </dd>
        </div>
        <div class="bg-surface-raised px-3 py-3">
          <dt class="text-xs uppercase tracking-wide text-ink-muted">Utvisninger</dt>
          <dd class="mt-1 font-semibold tabular-nums">
            {{ state.penalties?.home }}–{{ state.penalties?.away }}
          </dd>
        </div>
        <div class="bg-surface-raised px-3 py-3">
          <dt class="text-xs uppercase tracking-wide text-ink-muted">Tekninger</dt>
          <dd class="mt-1 font-semibold tabular-nums">
            {{ state.faceoffs?.homePct ?? '–' }}%
          </dd>
        </div>
      </dl>

      <!-- Timeline -->
      <div v-if="byPeriod.length" class="px-6 py-5">
        <div v-for="[period, events] in byPeriod" :key="period ?? 'x'" class="mb-5 last:mb-0">
          <h3 class="mb-2 text-xs uppercase tracking-wide text-ink-muted">
            {{ period ? `${period}. periode` : 'Øvrig' }}
          </h3>
          <ul class="space-y-2">
            <li
              v-for="(event, i) in events"
              :key="i"
              class="flex items-baseline gap-3 text-sm"
              :class="event.team === 'home' ? '' : 'flex-row-reverse text-right'"
            >
              <span
                class="shrink-0 font-display tabular-nums"
                :class="event.type === 'goal' ? 'text-accent-500' : 'text-ink-muted'"
              >
                {{ event.type === 'goal' ? `${event.score.home}–${event.score.away}` : '2 min' }}
              </span>
              <span v-if="event.type === 'goal'">
                <strong>{{ event.scorer }}</strong>
                <span v-if="event.assists.length" class="text-ink-muted">
                  ({{ event.assists.join(', ') }})
                </span>
                <template v-for="flag in event.flags" :key="flag">
                  <span
                    v-if="flagLabel(flag)"
                    class="ml-2 rounded-pill bg-surface-sunken px-2 py-0.5 text-xs"
                  >{{ flagLabel(flag) }}</span>
                </template>
              </span>
              <span v-else class="text-ink-muted">
                {{ event.player }} — {{ event.reason }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <p v-if="failed" class="border-t border-line px-6 py-2 text-xs text-ink-muted">
        Mistet kontakt med kampdata. Viser siste kjente stilling.
      </p>
    </div>
  </section>
</template>
