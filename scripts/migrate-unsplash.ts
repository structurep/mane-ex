/**
 * One-time migration: replace Unsplash URLs in listing_media with local placeholders.
 *
 * Usage: npx tsx scripts/migrate-unsplash.ts
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const placeholders = Array.from({ length: 8 }, (_, i) => `/placeholders/horses/horse-${i + 1}.jpg`);

async function main() {
  console.log('Fetching listing_media rows with Unsplash URLs...');

  const { data: rows, error } = await supabase
    .from('listing_media')
    .select('id, url, listing_id')
    .like('url', '%images.unsplash.com%');

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('No Unsplash URLs found in listing_media. Nothing to migrate.');
    return;
  }

  console.log(`Found ${rows.length} rows to migrate.\n`);

  let updated = 0;
  let failed = 0;

  for (const row of rows) {
    // Deterministic placeholder based on row id to spread images across listings
    const hash = simpleHash(row.id);
    const placeholder = placeholders[Math.abs(hash) % placeholders.length];

    const { error: updateError } = await supabase
      .from('listing_media')
      .update({ url: placeholder })
      .eq('id', row.id);

    if (updateError) {
      console.error(`  FAILED row ${row.id}: ${updateError.message}`);
      failed++;
    } else {
      updated++;
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Total:   ${rows.length}`);
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
