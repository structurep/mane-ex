/**
 * Per-session swipe statistics + adaptive ranking penalties.
 * All in-memory — resets when Match Mode closes or page refreshes.
 */

export type SessionStats = {
  cards_seen: number;
  favorites: number;
  passes: number;
  avg_swipe_time: number;
  avg_drag_distance: number;
  favorite_rate: number;
};

type SessionState = {
  swipeTimes: number[];
  dragDistances: number[];
  favorites: number;
  passes: number;
  /** Recent pass streak discipline tracking */
  consecutivePasses: number;
  /** Disciplines passed in current streak */
  recentPassDisciplines: string[];
  /** Price bands passed in current streak */
  recentPassPriceBands: string[];
  /** Accumulated discipline penalties (discipline → multiplier) */
  disciplinePenalties: Map<string, number>;
  /** Accumulated price-band penalties (band → multiplier) */
  priceBandPenalties: Map<string, number>;
};

let state: SessionState = freshState();

function freshState(): SessionState {
  return {
    swipeTimes: [],
    dragDistances: [],
    favorites: 0,
    passes: 0,
    consecutivePasses: 0,
    recentPassDisciplines: [],
    recentPassPriceBands: [],
    disciplinePenalties: new Map(),
    priceBandPenalties: new Map(),
  };
}

function priceBand(cents: number | null | undefined): string {
  if (!cents) return "unknown";
  const k = cents / 100;
  if (k < 5000) return "under-5k";
  if (k < 15000) return "5k-15k";
  if (k < 30000) return "15k-30k";
  if (k < 75000) return "30k-75k";
  return "75k-plus";
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// ── Public API ────────────────────────────────

/**
 * Record a swipe result with telemetry data.
 */
export function recordSwipe(input: {
  result: "favorite" | "pass";
  swipe_duration_ms: number;
  drag_distance_px: number;
  discipline?: string | null;
  price?: number | null;
}) {
  state.swipeTimes.push(input.swipe_duration_ms);
  state.dragDistances.push(input.drag_distance_px);

  if (input.result === "favorite") {
    state.favorites++;
    // Reset pass streak on favorite
    state.consecutivePasses = 0;
    state.recentPassDisciplines = [];
    state.recentPassPriceBands = [];
  } else {
    state.passes++;
    state.consecutivePasses++;

    if (input.discipline) {
      state.recentPassDisciplines.push(input.discipline);
    }
    state.recentPassPriceBands.push(priceBand(input.price));

    // 3 consecutive passes → discipline penalty
    if (state.consecutivePasses >= 3 && state.recentPassDisciplines.length >= 3) {
      const last3 = state.recentPassDisciplines.slice(-3);
      const freq = new Map<string, number>();
      for (const d of last3) freq.set(d, (freq.get(d) ?? 0) + 1);
      for (const [disc, count] of freq) {
        if (count >= 2) {
          const current = state.disciplinePenalties.get(disc) ?? 1;
          state.disciplinePenalties.set(disc, current * 0.85);
        }
      }
    }

    // 5 consecutive passes → price-band penalty
    if (state.consecutivePasses >= 5) {
      const last5 = state.recentPassPriceBands.slice(-5);
      const freq = new Map<string, number>();
      for (const b of last5) freq.set(b, (freq.get(b) ?? 0) + 1);
      for (const [band, count] of freq) {
        if (count >= 3) {
          const current = state.priceBandPenalties.get(band) ?? 1;
          state.priceBandPenalties.set(band, current * 0.8);
        }
      }
    }
  }
}

/**
 * Get current session statistics.
 */
export function getSessionStats(): SessionStats {
  const total = state.favorites + state.passes;
  return {
    cards_seen: total,
    favorites: state.favorites,
    passes: state.passes,
    avg_swipe_time: avg(state.swipeTimes),
    avg_drag_distance: avg(state.dragDistances),
    favorite_rate: total > 0 ? Math.round((state.favorites / total) * 100) : 0,
  };
}

/**
 * Get discipline penalty for ranking adjustment.
 * Returns multiplier (1.0 = no penalty, 0.85 = one penalty, etc.)
 */
export function getDisciplinePenalty(discipline: string): number {
  return state.disciplinePenalties.get(discipline) ?? 1;
}

/**
 * Get price-band penalty for ranking adjustment.
 */
export function getPriceBandPenalty(priceCents: number | null | undefined): number {
  return state.priceBandPenalties.get(priceBand(priceCents)) ?? 1;
}

/**
 * Reset session (call on Match Mode close or reload).
 */
export function resetSession() {
  state = freshState();
}
