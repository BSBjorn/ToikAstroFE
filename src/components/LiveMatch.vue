<script setup lang="ts">
/**
 * Live match view — the one genuinely interactive part of the site.
 *
 * Mounted as an Astro island with client:load. It calls Strapi directly from
 * the browser, so the score is never baked into a cached page, and it pauses
 * polling on a hidden tab so a forgotten tab doesn't poll all night.
 *
 * Three phases:
 *  - pre-game: 2h before kickoff → countdown to start
 *  - live:     kickoff → slutt   → score, stats, goal timeline + HockeyLive link
 *  - post-game: slutt → +2h     → final score, stats + HockeyLive link
 */
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { LiveMatch } from '../types/strapi';
import { formatMatchClock } from '../lib/match-time';

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
    restartIfPhaseChanged();
  } catch {
    // Keep showing the last good state rather than blanking mid-match
    failed.value = true;
  } finally {
    pending.value = false;
  }
}

let currentIntervalMs: number | null = null;

function start() {
  if (timer) return;
  refresh();
  timer = setInterval(refresh, props.intervalMs);
  currentIntervalMs = props.intervalMs;
}

function restartIfPhaseChanged() {
  const targetInterval = state.value?.phase === 'live' ? 5_000 : props.intervalMs;
  if (currentIntervalMs !== targetInterval && timer) {
    clearInterval(timer);
    timer = setInterval(refresh, targetInterval);
    currentIntervalMs = targetInterval;
  }
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
const score = computed(() => state.value?.score ?? null);
const countdownMin = computed(() => {
  const sec = state.value?.countdownSec;
  if (!sec || sec <= 0) return null;
  return Math.ceil(sec / 60);
});

const isLive = computed(() => state.value?.phase === 'live');
const isPreGame = computed(() => state.value?.phase === 'pre-game');
const isPostGame = computed(() => state.value?.phase === 'post-game');
const stats = computed(() => state.value?.stats ?? null);
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
    </div>

    <!-- Match -->
    <div v-else>
      <header class="flex items-center justify-between gap-4 border-b border-line px-6 py-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm text-ink-muted">
            {{ match.tournament ?? 'Kamp' }} · {{ match.venue }}
          </p>
        </div>

        <!-- Phase badge -->
        <span
          v-if="isPreGame || isLive"
          class="inline-flex shrink-0 items-center gap-2 rounded-pill bg-accent-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
        >
          <span v-if="isLive" class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-white/70" />
            <span class="relative inline-flex size-2 rounded-full bg-white" />
          </span>
          Direkte
        </span>
        <span v-else-if="isPostGame" class="text-xs uppercase tracking-wide text-ink-muted">
          Ferdig
        </span>
      </header>

      <!-- Scoreline -->
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-6">
        <p class="text-right text-lg font-semibold">{{ match.homeTeam }}</p>
        <div class="text-center">
          <span v-if="isPreGame" class="font-display text-5xl tabular-nums">
            {{ countdownMin }}<span class="ml-1 text-sm text-ink-muted">min</span>
          </span>
          <span v-else class="font-display text-5xl tabular-nums">
            {{ score?.home ?? '–' }}<span class="mx-2 text-ink-muted">–</span>{{ score?.away ?? '–' }}
          </span>
        </div>
        <p class="text-lg font-semibold">{{ match.awayTeam }}</p>
      </div>

      <!-- HockeyLIVE link -->
      <div v-if="state?.hockeyLiveUrl" class="border-t border-line px-6 py-3">
        <a
          :href="state.hockeyLiveUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 text-sm font-medium text-accent-500 hover:text-accent-600"
        >
          <i class="ph ph-broadcast text-lg" />
          <span v-if="isLive">Følg kampen på hockey.no</span>
          <span v-else-if="isPostGame">Bokstat på hockey.no</span>
          <span v-else>Kampdetaljer på hockey.no</span>
          <i class="ph ph-arrow-square-out text-base" />
        </a>
      </div>

      <!-- Stats summary + goal timeline -->
      <div
        v-if="(isLive || isPostGame) && stats"
        class="border-t border-line px-6 py-3"
      >
        <p class="text-xs text-ink-muted">
          Skudd {{ stats.shots.home }}–{{ stats.shots.away }} ·
          Utvisninger {{ stats.penalties.home }}–{{ stats.penalties.away }}
          <template v-if="stats.faceoffs.total > 0">
            · Faceoffs {{ stats.faceoffs.home }}–{{ stats.faceoffs.away }}
          </template>
        </p>
        <ol v-if="stats.timeline.length > 0" class="mt-2 space-y-1 text-xs">
          <li
            v-for="(goal, i) in stats.timeline"
            :key="i"
            class="flex items-center gap-2"
          >
            <span class="shrink-0 tabular-nums text-ink-muted">
              {{ goal.period != null ? `${goal.period}. per · ` : '' }}{{ formatMatchClock(goal.time) }}
            </span>
            <span
              class="font-medium"
              :class="goal.team === 'home' ? 'text-brand-500' : 'text-accent-500'"
            >{{ goal.scorer ?? 'Ukjent' }}</span>
            <template v-if="goal.assists.length > 0">
              <span class="text-ink-muted">(+{{ goal.assists.join(', ') }})</span>
            </template>
            <span class="ml-auto tabular-nums text-ink-muted">
              {{ goal.score.home }}–{{ goal.score.away }}
            </span>
          </li>
        </ol>
      </div>

      <p v-if="failed" class="border-t border-line px-6 py-2 text-xs text-ink-muted">
        Mistet kontakt med kampdata. Viser siste kjente stilling.
      </p>
    </div>
  </section>
</template>
