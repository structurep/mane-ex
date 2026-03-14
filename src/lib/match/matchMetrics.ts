"use client";

export type SessionMatchMetrics = {
  cardsSeen: number;
  favorites: number;
  passes: number;
  opens: number;
};

const METRICS_KEY = "mane-match-metrics";

function load(): SessionMatchMetrics {
  try {
    const raw = sessionStorage.getItem(METRICS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { cardsSeen: 0, favorites: 0, passes: 0, opens: 0 };
}

function save(m: SessionMatchMetrics) {
  try { sessionStorage.setItem(METRICS_KEY, JSON.stringify(m)); } catch { /* noop */ }
}

export function recordMetric(type: "favorite" | "pass" | "open") {
  const m = load();
  if (type === "favorite") { m.favorites++; m.cardsSeen++; }
  else if (type === "pass") { m.passes++; m.cardsSeen++; }
  else if (type === "open") { m.opens++; }
  save(m);
}

export function getSessionMatchMetrics(): SessionMatchMetrics & { openRate: number } {
  const m = load();
  return {
    ...m,
    openRate: m.cardsSeen > 0 ? m.opens / m.cardsSeen : 0,
  };
}

export function resetSessionMetrics() {
  try { sessionStorage.removeItem(METRICS_KEY); } catch { /* noop */ }
}
