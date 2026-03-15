/**
 * Dev-only: seed swipe_events with realistic interaction data
 * so trending, Hot badges, and ranking algorithms activate.
 *
 * Usage: npm run seed:swipes
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ──────────────────────────────────────
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

function randomTimestamp72h(): string {
  const ms = Date.now() - rand(0, 72 * 60 * 60 * 1000);
  return new Date(ms).toISOString();
}

// ── Main ─────────────────────────────────────────
async function main() {
  // Fetch active listings with context
  const { data: listings, error } = await supabase
    .from("horse_listings")
    .select("id, discipline_ids, price, location_state, seller_id")
    .eq("status", "active")
    .limit(50);

  if (error || !listings?.length) {
    console.error("Failed to fetch listings:", error?.message ?? "no active listings");
    process.exit(1);
  }

  console.log(`Found ${listings.length} active listings`);

  const rows: Record<string, unknown>[] = [];

  for (const listing of listings) {
    const count = rand(5, 25);
    for (let i = 0; i < count; i++) {
      // 60% pass, 30% favorite, 10% open (open mapped to pass direction)
      const roll = Math.random();
      const direction = roll < 0.6 ? "pass" : "favorite";
      const commitReason = pick(["distance", "velocity"] as const);
      const discipline = listing.discipline_ids?.[0] ?? null;

      rows.push({
        listing_id: listing.id,
        direction,
        commit_reason: commitReason,
        drag_distance_px: rand(40, 300),
        velocity_x: Math.round((Math.random() * 1.5 + 0.2) * 1000) / 1000,
        swipe_duration_ms: rand(200, 2500),
        discipline,
        price: listing.price,
        location: listing.location_state,
        seller_id: listing.seller_id,
        created_at: randomTimestamp72h(),
      });
    }
  }

  // Batch insert in chunks of 200
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error: insertError } = await supabase
      .from("swipe_events")
      .insert(chunk);
    if (insertError) {
      console.error(`Insert failed at chunk ${i}:`, insertError.message);
      process.exit(1);
    }
    inserted += chunk.length;
  }

  console.log(`Inserted ${inserted} swipe events across ${listings.length} listings`);

  // Quick stats
  const { count } = await supabase
    .from("swipe_events")
    .select("*", { count: "exact", head: true });
  console.log(`Total swipe_events in table: ${count}`);
}

main().catch(console.error);
