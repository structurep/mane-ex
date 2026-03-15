/**
 * Transport cost estimator — heuristic model for equine shipping.
 *
 * Distance tiers (per mile):
 *   0–150 mi  → $2.50
 *   150–600 mi → $1.85
 *   600+ mi   → $1.25
 *
 * Minimum charge: $350
 * Range: low = base × 0.9, high = base × 1.15
 */

export type TransportEstimate = {
  distanceMiles: number;
  estimatedCostLow: number;
  estimatedCostHigh: number;
};

// ── State centroid coordinates (lat, lng) ──
// Used for approximate distance when ZIP-level geocoding isn't available.

const STATE_CENTROIDS: Record<string, [number, number]> = {
  AL: [32.806, -86.791], AK: [61.370, -152.404], AZ: [33.729, -111.431],
  AR: [34.970, -92.373], CA: [36.116, -119.681], CO: [39.059, -105.311],
  CT: [41.597, -72.755], DE: [39.318, -75.507], FL: [27.766, -81.686],
  GA: [33.040, -83.643], HI: [21.094, -157.498], ID: [44.240, -114.478],
  IL: [40.349, -88.986], IN: [39.849, -86.258], IA: [42.011, -93.210],
  KS: [38.526, -96.726], KY: [37.668, -84.670], LA: [31.169, -91.867],
  ME: [44.694, -69.382], MD: [39.063, -76.802], MA: [42.230, -71.530],
  MI: [43.327, -84.536], MN: [45.694, -93.900], MS: [32.741, -89.678],
  MO: [38.456, -92.288], MT: [46.921, -110.454], NE: [41.125, -98.268],
  NV: [38.313, -117.055], NH: [43.452, -71.563], NJ: [40.298, -74.521],
  NM: [34.840, -106.248], NY: [42.165, -74.948], NC: [35.630, -79.806],
  ND: [47.528, -99.784], OH: [40.388, -82.764], OK: [35.565, -96.928],
  OR: [44.572, -122.071], PA: [40.590, -77.210], RI: [41.680, -71.511],
  SC: [33.856, -80.945], SD: [44.300, -99.439], TN: [35.747, -86.692],
  TX: [31.054, -97.563], UT: [40.150, -111.862], VT: [44.045, -72.710],
  VA: [37.769, -78.170], WA: [47.400, -121.490], WV: [38.491, -80.954],
  WI: [44.269, -89.616], WY: [42.756, -107.302], DC: [38.907, -77.037],
};

/**
 * Haversine formula — great-circle distance between two points.
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate tiered per-mile cost.
 */
function tieredCost(miles: number): number {
  const MIN_CHARGE = 350;

  let cost = 0;
  if (miles <= 150) {
    cost = miles * 2.5;
  } else if (miles <= 600) {
    cost = 150 * 2.5 + (miles - 150) * 1.85;
  } else {
    cost = 150 * 2.5 + 450 * 1.85 + (miles - 600) * 1.25;
  }

  return Math.max(MIN_CHARGE, cost);
}

/**
 * Estimate transport cost between two US states.
 */
export function estimateTransportByState(
  originState: string,
  destinationState: string
): TransportEstimate | null {
  const origin = STATE_CENTROIDS[originState.toUpperCase()];
  const dest = STATE_CENTROIDS[destinationState.toUpperCase()];

  if (!origin || !dest) return null;

  // Road distance is typically ~1.3× great-circle distance
  const straightLine = haversineDistance(origin[0], origin[1], dest[0], dest[1]);
  const distanceMiles = Math.round(straightLine * 1.3);

  const baseCost = tieredCost(distanceMiles);

  return {
    distanceMiles,
    estimatedCostLow: Math.max(350, Math.round(baseCost * 0.9)),
    estimatedCostHigh: Math.round(baseCost * 1.15),
  };
}

/**
 * Get all US state abbreviations for the destination selector.
 */
export function getUSStates(): { value: string; label: string }[] {
  return Object.keys(STATE_CENTROIDS)
    .filter((s) => s !== "DC")
    .sort()
    .map((s) => ({ value: s, label: s }));
}
