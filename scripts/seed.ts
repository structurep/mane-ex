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

// ── Constants ────────────────────────────────────────────────────────────────

const TEST_PASSWORD = 'Test1234!';
const TEST_EMAILS = ['seller@test.com', 'buyer@test.com', 'trainer@test.com'];

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86_400_000).toISOString();

// ── Helpers ──────────────────────────────────────────────────────────────────

function die(msg: string, err: unknown): never {
  console.error(`\n  ERROR: ${msg}`);
  if (err && typeof err === 'object' && 'message' in err) console.error(`  ${(err as { message: string }).message}`);
  process.exit(1);
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

async function cleanup() {
  console.log('  Cleaning up existing test data...');
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const existing = users.filter(u => TEST_EMAILS.includes(u.email!));
  if (!existing.length) { console.log('  No existing test data found\n'); return; }

  const ids = existing.map(u => u.id);

  // ISO matches (references iso_posts + listings)
  const { data: isos } = await supabase.from('iso_posts').select('id').in('user_id', ids);
  if (isos?.length) await supabase.from('iso_matches').delete().in('iso_id', isos.map(i => i.id));

  // Tour stops (references trial_requests)
  const { data: tours } = await supabase.from('tours').select('id').in('user_id', ids);
  if (tours?.length) await supabase.from('tour_stops').delete().in('tour_id', tours.map(t => t.id));

  // Escrow transactions (references offers)
  await supabase.from('escrow_transactions').delete().in('buyer_id', ids);

  // Level 2
  await supabase.from('trial_requests').delete().in('buyer_id', ids);
  await supabase.from('trial_requests').delete().in('seller_id', ids);
  await supabase.from('tours').delete().in('user_id', ids);
  await supabase.from('offers').delete().in('buyer_id', ids);
  await supabase.from('offers').delete().in('seller_id', ids);

  // Level 3
  await supabase.from('iso_posts').delete().in('user_id', ids);
  await supabase.from('reviews').delete().in('reviewer_id', ids);
  await supabase.from('reviews').delete().in('seller_id', ids);
  await supabase.from('conversations').delete().in('participant_1_id', ids);
  await supabase.from('conversations').delete().in('participant_2_id', ids);
  await supabase.from('collections').delete().in('user_id', ids);
  await supabase.from('seller_scores').delete().in('seller_id', ids);
  await supabase.from('notification_preferences').delete().in('user_id', ids);
  await supabase.from('notifications').delete().in('user_id', ids);
  await supabase.from('reports').delete().in('reporter_id', ids);
  // admin_audit_log may not be in schema cache if migration 011 is stale
  try { await supabase.from('admin_audit_log').delete().in('admin_id', ids); } catch {}
  await supabase.from('quiz_results').delete().in('user_id', ids);

  // Level 4: listings (media/docs/events/favorites cascade)
  await supabase.from('horse_listings').delete().in('seller_id', ids);

  // Level 5: farms
  const { data: farms } = await supabase.from('farms').select('id').in('owner_id', ids);
  if (farms?.length) await supabase.from('farm_staff').delete().in('farm_id', farms.map(f => f.id));
  await supabase.from('farms').delete().in('owner_id', ids);

  // Level 6: auth users (profiles cascade via ON DELETE CASCADE)
  for (const user of existing) {
    await supabase.auth.admin.deleteUser(user.id);
  }
  console.log(`  Removed ${existing.length} existing test user(s)\n`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n  ManeExchange Seed Script');
  console.log('  =======================\n');

  await cleanup();

  // ── Step 1: Create auth users ──────────────────────────────────────────────

  console.log('  1. Creating test users...');
  const userIds: Record<string, string> = {};

  for (const [key, account] of Object.entries({
    seller: { email: 'seller@test.com', name: 'Sarah Mitchell' },
    buyer: { email: 'buyer@test.com', name: 'Emily Chen' },
    trainer: { email: 'trainer@test.com', name: 'Jessica Rivera' },
  })) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: account.name },
    });
    if (error) die(`Creating ${account.email}`, error);
    userIds[key] = data.user.id;
    console.log(`     ${account.email} → ${data.user.id}`);
  }

  // ── Step 2: Update profiles ────────────────────────────────────────────────

  console.log('  2. Setting up profiles...');

  const profiles = [
    {
      id: userIds.seller,
      display_name: 'Sarah M.',
      role: 'seller',
      seller_tier: 'premium',
      city: 'Wellington',
      state: 'FL',
      zip: '33414',
      bio: 'Professional hunter/jumper trainer with 20+ years experience. Specializing in quality sport horses for competitive riders.',
      disciplines: ['Hunter', 'Jumper', 'Equitation'],
      profile_complete: true,
      instagram_handle: '@sarahmitchellequestrian',
    },
    {
      id: userIds.buyer,
      display_name: 'Emily C.',
      role: 'buyer',
      city: 'Ocala',
      state: 'FL',
      zip: '34471',
      bio: 'Amateur rider searching for my next partner. Currently competing in the 3\'0" hunters.',
      disciplines: ['Hunter', 'Dressage'],
      min_budget: 2000000,
      max_budget: 10000000,
      profile_complete: true,
    },
    {
      id: userIds.trainer,
      display_name: 'Jess R.',
      role: 'trainer',
      city: 'Aiken',
      state: 'SC',
      zip: '29801',
      bio: 'USEF licensed trainer helping amateur riders find their perfect mount.',
      disciplines: ['Hunter', 'Jumper', 'Eventing'],
      profile_complete: true,
    },
  ];

  for (const p of profiles) {
    const { id, ...fields } = p;
    const { error } = await supabase.from('profiles').update(fields).eq('id', id);
    if (error) die(`Updating profile ${id}`, error);
  }
  console.log('     3 profiles configured');

  // ── Step 3: Create farm ────────────────────────────────────────────────────

  console.log('  3. Creating farm...');

  const { data: farm, error: farmErr } = await supabase
    .from('farms')
    .insert({
      owner_id: userIds.seller,
      name: 'Whispering Willows Farm',
      slug: 'whispering-willows-farm',
      description: 'A premier hunter/jumper facility in Wellington, Florida. 40 stalls on 25 acres with two competition rings, all-weather footing, and a state-of-the-art recovery center.',
      city: 'Wellington',
      state: 'FL',
      zip: '33414',
      country: 'US',
      phone: '(561) 555-0142',
      email: 'info@whisperingwillows.com',
      disciplines: ['Hunter', 'Jumper', 'Equitation'],
      year_established: 2008,
      number_of_stalls: 40,
    })
    .select()
    .single();
  if (farmErr) die('Creating farm', farmErr);
  console.log(`     ${farm.name} (${farm.id})`);

  // Additional farms for geographic diversity
  const additionalFarms = [
    {
      name: 'Pacific Crest Dressage',
      slug: 'pacific-crest-dressage',
      description: 'Premier dressage facility in coastal Southern California.',
      city: 'San Juan Capistrano', state: 'CA', zip: '92675',
      disciplines: ['Dressage'], year_established: 2015, number_of_stalls: 24,
    },
    {
      name: 'Hudson Valley Equestrian',
      slug: 'hudson-valley-equestrian',
      description: 'Full-service eventing facility on 60 rolling acres in the Hudson Valley.',
      city: 'Millbrook', state: 'NY', zip: '12545',
      disciplines: ['Eventing', 'Hunter', 'Jumper'], year_established: 2001, number_of_stalls: 36,
    },
    {
      name: 'Tryon Ridge Stables',
      slug: 'tryon-ridge-stables',
      description: 'Sport horse facility minutes from TIEC with FEI-level footing.',
      city: 'Tryon', state: 'NC', zip: '28782',
      disciplines: ['Show Jumping', 'Dressage', 'Eventing'], year_established: 2012, number_of_stalls: 48,
    },
  ];

  const farmIds: Record<string, string> = {};
  for (const f of additionalFarms) {
    const { data, error } = await supabase
      .from('farms')
      .insert({
        owner_id: userIds.seller,
        country: 'US',
        phone: '(555) 555-0100',
        email: `info@${f.slug.replace(/-/g, '')}.com`,
        ...f,
      })
      .select()
      .single();
    if (error) die(`Creating farm ${f.name}`, error);
    farmIds[f.slug] = data.id;
    console.log(`     ${data.name} (${data.id})`);
  }

  // ── Step 4: Fetch discipline IDs ───────────────────────────────────────────

  console.log('  4. Fetching discipline map...');

  const { data: disciplines, error: discErr } = await supabase
    .from('disciplines')
    .select('id, name');
  if (discErr) die('Fetching disciplines', discErr);

  const discMap = new Map(disciplines!.map((d: { id: string; name: string }) => [d.name, d.id]));
  const disc = (names: string[]) => names.map(n => discMap.get(n)).filter(Boolean) as string[];
  console.log(`     ${discMap.size} disciplines loaded`);

  // ── Step 5: Create horse listings ──────────────────────────────────────────

  console.log('  5. Creating horse listings...');

  const horseData = [
    {
      name: "Bellissimo's Legacy",
      slug: 'bellissimos-legacy',
      breed: 'Warmblood',
      registered_name: "Bellissimo's Legacy HF",
      registration_number: 'KWPN-NA-89421',
      registry: 'KWPN-NA',
      gender: 'mare' as const,
      color: 'Bay',
      date_of_birth: '2017-04-12',
      age_years: 8,
      height_hands: 16.2,
      sire: 'Bellissimo M',
      dam: 'Laurel Springs',
      discipline_ids: disc(['Hunter', 'Jumper']),
      level: '1.10m-1.20m',
      show_experience: 'Extensive A-circuit experience. Champion at WEF 2024 Adult Amateur Hunters.',
      show_record: '2024 WEF Adult Amateur Hunter Champion, multiple top-5 at HITS Ocala, Devon Horse Show qualifier',
      price: 8500000,
      price_display: '$85,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Amanda Roberts, Wellington Equine',
      vet_phone: '(561) 555-0199',
      vaccination_status: 'Current — EWT/Rhino/Flu/Rabies, April 2025',
      coggins_date: '2025-11-01',
      coggins_expiry: '2026-11-01',
      location_city: 'Wellington',
      location_state: 'FL',
      location_zip: '33414',
      barn_name: 'Whispering Willows Farm',
      current_trainer: 'Sarah Mitchell',
      turnout_schedule: 'Daily turnout, 6AM-12PM',
      feeding_program: 'Triple Crown Senior, 2x daily with timothy/alfalfa mix',
      shoeing_schedule: 'Every 6 weeks — full set with pads',
      years_with_current_owner: 3,
      number_of_previous_owners: 1,
      reason_for_sale: 'Moving up to Grand Prix. Ideal for competitive amateur or junior rider.',
      temperament: 'Brave, willing, and forgiving. Excellent amateur ride.',
      suitable_for: 'Competitive amateur, strong junior, adult amateur',
      henneke_score: 5,
      soundness_level: 'vet_confirmed_sound' as const,
      published_at: daysAgo(5),
    },
    {
      // ── GOOD tier (~720) — missing registry/pedigree, partial trust ──
      name: 'Harbor Light',
      slug: 'harbor-light',
      breed: 'Thoroughbred',
      registered_name: 'Harbor Light',
      gender: 'gelding' as const,
      color: 'Dark Bay',
      date_of_birth: '2018-03-22',
      age_years: 7,
      height_hands: 17.0,
      discipline_ids: disc(['Eventing']),
      level: 'Preliminary',
      show_experience: 'Competed through Preliminary with clear XC rounds. OTTB retrained 2021.',
      price: 4500000,
      price_display: '$45,000',
      warranty: 'as_is' as const,
      vet_name: 'Dr. James Whitfield, Aiken Equine',
      vaccination_status: 'Current — full protocol',
      coggins_date: '2025-09-15',
      location_city: 'Aiken',
      location_state: 'SC',
      location_zip: '29801',
      barn_name: 'Highpoint Eventing Center',
      temperament: 'Bold, athletic, competitive. Wants a job.',
      suitable_for: 'Ambitious eventer, experienced rider',
      soundness_level: 'minor_findings' as const,
      reason_for_sale: 'Owner focusing on dressage horses.',
      seller_state: 'SC',
      published_at: daysAgo(4),
    },
    {
      // ── FAIR tier (~430) — no registry/pedigree, sparse trust, 3 photos ──
      name: 'Copper Creek',
      slug: 'copper-creek',
      breed: 'Quarter Horse',
      gender: 'gelding' as const,
      color: 'Sorrel',
      date_of_birth: '2016-05-08',
      age_years: 9,
      height_hands: 15.1,
      discipline_ids: disc(['Western Pleasure', 'Reining']),
      show_experience: 'AQHA World Show qualifier in Western Pleasure. Solid reining foundation.',
      price: 2800000,
      price_display: '$28,000',
      warranty: 'sound_for_use' as const,
      vet_name: 'Dr. Robert Hayes, Weatherford Equine',
      location_city: 'Weatherford',
      location_state: 'TX',
      location_zip: '76086',
      barn_name: 'Lone Star Quarter Horses',
      reason_for_sale: 'Downsizing herd.',
      soundness_level: 'vet_confirmed_sound' as const,
      seller_state: 'TX',
      published_at: daysAgo(3),
    },
    {
      name: 'Starlight Sonata',
      slug: 'starlight-sonata',
      breed: 'Hanoverian',
      registered_name: 'Starlight Sonata SF',
      registration_number: 'AHS-28914',
      registry: 'American Hanoverian Society',
      gender: 'mare' as const,
      color: 'Black',
      date_of_birth: '2015-06-15',
      age_years: 10,
      height_hands: 16.3,
      sire: 'Sandro Hit',
      dam: 'Fine Sonata',
      discipline_ids: disc(['Dressage']),
      level: 'Prix St. Georges',
      show_experience: 'Schooling Grand Prix movements. Confirmed Prix St. Georges with scores to 70%.',
      show_record: 'USDF Regional Champion PSG 2024, median score 68.5% at GP schooling shows',
      usef_number: 'USEF-5540821',
      usdf_number: 'USDF-42918',
      price: 12000000,
      price_display: '$120,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Amanda Roberts, Middleburg Equine',
      vaccination_status: 'Current — full protocol including strangles',
      coggins_date: '2025-12-01',
      coggins_expiry: '2026-12-01',
      location_city: 'Middleburg',
      location_state: 'VA',
      location_zip: '20117',
      barn_name: 'Foxcroft Dressage',
      current_trainer: 'Sarah Mitchell',
      feeding_program: 'Tribute Kalm Ultra, supplements include SmartPak joint/gut support',
      temperament: 'Sensitive but generous. Needs a tactful, educated ride.',
      suitable_for: 'Serious dressage amateur, small-tour competitor',
      henneke_score: 4,
      soundness_level: 'managed_condition' as const,
      years_with_current_owner: 5,
      reason_for_sale: 'Owner relocating internationally.',
      seller_state: 'VA',
      published_at: daysAgo(6),
    },
    {
      // ── FAIR tier (~395) — no pedigree/registry, weak trust, 2 photos ──
      name: 'Lucky Penny',
      slug: 'lucky-penny',
      breed: 'Welsh Cob',
      gender: 'mare' as const,
      date_of_birth: '2014-03-01',
      age_years: 11,
      height_hands: 14.2,
      discipline_ids: disc(['Hunter', 'Equitation']),
      price: 2200000,
      price_display: '$22,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Lisa Fernandez, Lexington Equine',
      location_city: 'Lexington',
      location_state: 'KY',
      location_zip: '40511',
      barn_name: 'Bluegrass Pony Farm',
      temperament: 'Bombproof. Perfect first horse.',
      good_with: 'Kids, dogs, clippers, trailering',
      reason_for_sale: 'Kids have outgrown her. Deserves another kid to love.',
      years_with_current_owner: 6,
      seller_state: 'KY',
      published_at: daysAgo(2),
    },
    {
      // ── INCOMPLETE tier (~155) — bare minimum listing, 1 photo, no trust ──
      name: 'Midnight Storm',
      slug: 'midnight-storm',
      breed: 'Oldenburg',
      gender: 'stallion' as const,
      discipline_ids: disc(['Show Jumping', 'Jumper']),
      price: 25000000,
      price_display: '$250,000',
      price_negotiable: false,
      warranty: 'as_is' as const,
      published_at: daysAgo(1),
    },

    // ── New listings for geographic + status diversity ──────────────────────

    {
      name: 'Royal Dorado',
      slug: 'royal-dorado',
      breed: 'Andalusian',
      registered_name: 'Royal Dorado PSA',
      registration_number: 'ANCCE-ES-20140388',
      registry: 'ANCCE',
      gender: 'stallion' as const,
      color: 'Black',
      date_of_birth: '2014-01-20',
      age_years: 12,
      height_hands: 15.3,
      sire: 'Evento III',
      dam: 'Faraona VII',
      discipline_ids: disc(['Dressage']),
      level: 'Fourth Level',
      show_experience: 'Schooling PSG movements. Confirmed through Fourth Level with scores to 68%.',
      show_record: 'USDF Region 7 Championships Fourth Level, multiple open show champion',
      usef_number: 'USEF-6682104',
      price: 7500000,
      price_display: '$75,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Maria Santos, San Juan Capistrano Equine',
      vaccination_status: 'Current — full protocol',
      coggins_date: '2025-11-01',
      coggins_expiry: '2026-11-01',
      location_city: 'San Juan Capistrano',
      location_state: 'CA',
      location_zip: '92675',
      barn_name: 'Pacific Crest Dressage',
      current_trainer: 'Carolina Vega',
      temperament: 'Proud, willing, and rhythmic. Beautiful mover with natural collection.',
      suitable_for: 'Serious dressage amateur, FEI aspirant',
      henneke_score: 5,
      soundness_level: 'vet_confirmed_sound' as const,
      years_with_current_owner: 4,
      reason_for_sale: 'Owner pursuing breeding program; focusing on mares.',
      seller_state: 'CA',
      farm_id: farmIds['pacific-crest-dressage'],
      published_at: daysAgo(10),
    },
    {
      // ── GOOD tier (~665) — no pedigree/registry, weak trust ──
      name: 'Galway Bay',
      slug: 'galway-bay',
      breed: 'Irish Sport Horse',
      registered_name: 'Donavans Galway Bay',
      gender: 'gelding' as const,
      color: 'Grey',
      date_of_birth: '2018-06-10',
      age_years: 7,
      height_hands: 16.1,
      discipline_ids: disc(['Eventing']),
      level: 'Training',
      show_experience: 'Consistent finisher at Training level. Bold cross-country horse with clean SJ rounds.',
      price: 5500000,
      price_display: '$55,000',
      warranty: 'as_is' as const,
      vet_name: 'Dr. Karen Bell, Hudson Valley Equine',
      vaccination_status: 'Current — full protocol',
      coggins_date: '2025-10-15',
      location_city: 'Millbrook',
      location_state: 'NY',
      location_zip: '12545',
      barn_name: 'Hudson Valley Equestrian',
      temperament: 'Honest, brave cross-country. Relaxed flatwork. Loves trail hacking.',
      reason_for_sale: 'Owner bought a more experienced horse for Prelim.',
      seller_state: 'NY',
      farm_id: farmIds['hudson-valley-equestrian'],
      published_at: daysAgo(8),
    },
    {
      // ── INCOMPLETE tier (~235) — casual owner, minimal info, 1 photo, no trust ──
      name: 'Painted Sky',
      slug: 'painted-sky',
      breed: 'Paint Horse',
      gender: 'mare' as const,
      color: 'Tobiano',
      height_hands: 15.0,
      discipline_ids: disc(['Western Pleasure']),
      price: 1500000,
      price_display: '$15,000',
      warranty: 'as_is' as const,
      location_city: 'Fort Collins',
      location_state: 'CO',
      location_zip: '80525',
      reason_for_sale: 'Owner moving to apartment. Horse deserves acreage.',
      seller_state: 'CO',
      published_at: daysAgo(14),
    },
    {
      name: 'Valkenswaard',
      slug: 'valkenswaard',
      breed: 'Dutch Warmblood',
      registered_name: 'Valkenswaard',
      registration_number: 'KWPN-2017-28841',
      registry: 'KWPN',
      gender: 'gelding' as const,
      color: 'Bay',
      date_of_birth: '2017-03-04',
      age_years: 9,
      height_hands: 17.0,
      sire: 'Cornet Obolensky',
      dam: 'Walküre',
      discipline_ids: disc(['Show Jumping', 'Jumper']),
      level: '1.35m-1.40m',
      show_experience: 'Consistent at 1.35m, schooling 1.40m. Scope for Grand Prix development.',
      show_record: '1.35m CSI2* clear rounds at Tryon, HITS Ocala top-8, USEF Zone 3 finalist',
      fei_id: 'FEI-109128',
      price: 18000000,
      price_display: '$180,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Steven Craig, Tryon Equine Hospital',
      vet_phone: '(828) 555-0177',
      vaccination_status: 'Current — full FEI protocol',
      coggins_date: '2025-12-15',
      coggins_expiry: '2026-12-15',
      location_city: 'Tryon',
      location_state: 'NC',
      location_zip: '28782',
      barn_name: 'Tryon Ridge Stables',
      temperament: 'Scopey, careful, loves the ring. Competitive but rideable.',
      suitable_for: 'Ambitious amateur, developing professional',
      henneke_score: 5,
      soundness_level: 'vet_confirmed_sound' as const,
      years_with_current_owner: 3,
      reason_for_sale: 'Rider stepping back from competition.',
      seller_state: 'NC',
      farm_id: farmIds['tryon-ridge-stables'],
      published_at: daysAgo(9),
    },
    {
      // ── GOOD tier (~560) — no pedigree, minimal trust, strong media ──
      name: 'Heritage Brass',
      slug: 'heritage-brass',
      breed: 'Morgan',
      gender: 'gelding' as const,
      date_of_birth: '2015-05-12',
      age_years: 10,
      height_hands: 15.0,
      discipline_ids: disc(['Dressage', 'Equitation']),
      show_experience: 'Versatile Morgan competing in dressage and sport horse in-hand. Beautiful mover.',
      price: 2200000,
      price_display: '$22,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Maria Santos, San Juan Capistrano Equine',
      coggins_date: '2025-09-01',
      location_city: 'San Juan Capistrano',
      location_state: 'CA',
      location_zip: '92675',
      barn_name: 'Pacific Crest Dressage',
      reason_for_sale: 'Owner transitioning to warmbloods for upper-level dressage.',
      status: 'under_offer' as const,
      seller_state: 'CA',
      farm_id: farmIds['pacific-crest-dressage'],
      published_at: daysAgo(12),
    },
    {
      // ── GOOD tier (~630) — no pedigree, partial trust, strong media ──
      name: 'Dark Raven',
      slug: 'dark-raven',
      breed: 'Friesian',
      registered_name: 'Dark Raven fan de Zandloper',
      gender: 'gelding' as const,
      date_of_birth: '2016-02-14',
      age_years: 10,
      height_hands: 16.0,
      discipline_ids: disc(['Dressage']),
      level: 'Third Level',
      show_experience: 'Confirmed Third Level with extension work. Show-ring presence that stops traffic.',
      usdf_number: 'USDF-51002',
      price: 6500000,
      price_display: '$65,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Amanda Roberts, Wellington Equine',
      vaccination_status: 'Current — full protocol',
      coggins_date: '2025-08-01',
      location_city: 'Ocala',
      location_state: 'FL',
      location_zip: '34471',
      barn_name: 'Whispering Willows Farm',
      reason_for_sale: 'Successfully sold through ManeExchange.',
      status: 'sold' as const,
      published_at: daysAgo(30),
    },
    {
      // ── FAIR tier (~315) — minimal details, zero trust, 2 photos ──
      name: 'Spotted Eagle',
      slug: 'spotted-eagle',
      breed: 'Appaloosa',
      gender: 'mare' as const,
      color: 'Leopard Appaloosa',
      date_of_birth: '2019-07-22',
      age_years: 6,
      height_hands: 15.2,
      discipline_ids: disc(['Western Pleasure']),
      price: 1800000,
      price_display: '$18,000',
      warranty: 'as_is' as const,
      location_city: 'Pilot Point',
      location_state: 'TX',
      location_zip: '76258',
      seller_state: 'TX',
      published_at: daysAgo(7),
    },
    {
      // ── GOOD tier (~740) — missing dam/show record, partial trust ──
      name: 'Königsberg',
      slug: 'konigsberg',
      breed: 'Trakehner',
      registered_name: 'Königsberg TSF',
      registration_number: 'ATA-2020-4412',
      registry: 'American Trakehner Association',
      gender: 'mare' as const,
      color: 'Chestnut',
      date_of_birth: '2020-04-18',
      age_years: 5,
      height_hands: 16.2,
      sire: 'Hirtentanz TSF',
      discipline_ids: disc(['Eventing', 'Dressage']),
      level: 'Training',
      show_experience: 'Talented young horse. Completing Training level with top-5 finishes. Brave cross-country.',
      price: 25000000,
      price_display: '$250,000',
      price_negotiable: false,
      warranty: 'as_is' as const,
      vet_name: 'Dr. Steven Craig, Tryon Equine Hospital',
      vet_phone: '(828) 555-0177',
      vaccination_status: 'Current — full protocol',
      coggins_date: '2026-01-01',
      location_city: 'Southern Pines',
      location_state: 'NC',
      location_zip: '28387',
      barn_name: 'Tryon Ridge Stables',
      temperament: 'Brave, elastic, and athletic. Blood horse with a brain. Upper-level prospect.',
      soundness_level: 'minor_findings' as const,
      reason_for_sale: 'Estate sale. Trainer placing horses in appropriate programs.',
      seller_state: 'NC',
      farm_id: farmIds['tryon-ridge-stables'],
      published_at: daysAgo(3),
    },

    // ── CTA demo: LOW-MEDIA — strong basics/details/trust, only 1 photo ──
    {
      name: 'Silver Cascade',
      slug: 'silver-cascade',
      breed: 'Holsteiner',
      registered_name: 'Silver Cascade H',
      registration_number: 'AHS-2019-07112',
      registry: 'American Holsteiner Horse Association',
      gender: 'gelding' as const,
      color: 'Grey',
      date_of_birth: '2019-09-03',
      age_years: 6,
      height_hands: 16.3,
      sire: 'Casall ASK',
      dam: 'Silbermond',
      discipline_ids: disc(['Show Jumping', 'Jumper']),
      level: '1.20m',
      show_experience: 'Careful and scopey. Finishing 1.20m with top-10 placings. Schooling 1.30m.',
      show_record: 'Multiple 1.20m clear rounds at WEF Schooling, zone finalist',
      price: 9500000,
      price_display: '$95,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. James Crawford, Palm Beach Equine Clinic',
      vaccination_status: 'Current — full protocol',
      coggins_date: '2025-12-20',
      coggins_expiry: '2026-12-20',
      henneke_score: 5,
      soundness_level: 'vet_confirmed_sound' as const,
      location_city: 'Wellington',
      location_state: 'FL',
      location_zip: '33414',
      barn_name: 'Whispering Willows Farm',
      temperament: 'Careful, competitive, and easy in the barn. Auto lead changes.',
      suitable_for: 'Ambitious junior/amateur',
      years_with_current_owner: 2,
      reason_for_sale: 'Rider moving up to Grand Prix horses.',
      seller_state: 'FL',
      farm_id: farmIds['whispering-willows-farm'],
      published_at: daysAgo(4),
    },

    // ── CTA demo: LOW-DETAILS — strong basics/trust/media, minimal show info ──
    {
      name: 'Autumn Ember',
      slug: 'autumn-ember',
      breed: 'Thoroughbred',
      registered_name: 'Autumn Ember',
      registration_number: 'JC-A543218',
      registry: 'The Jockey Club',
      gender: 'mare' as const,
      color: 'Chestnut',
      date_of_birth: '2018-04-11',
      age_years: 8,
      height_hands: 16.1,
      sire: 'Into Mischief',
      dam: 'Ember Glow',
      price: 3500000,
      price_display: '$35,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Karen Bell, Hudson Valley Equine',
      vaccination_status: 'Current — full protocol',
      coggins_date: '2026-01-10',
      coggins_expiry: '2027-01-10',
      henneke_score: 5,
      soundness_level: 'vet_confirmed_sound' as const,
      location_city: 'Millbrook',
      location_state: 'NY',
      location_zip: '12545',
      barn_name: 'Hudson Valley Equestrian',
      reason_for_sale: 'OTTB transitioning to second career. Sound and sane.',
      seller_state: 'NY',
      farm_id: farmIds['hudson-valley-equestrian'],
      published_at: daysAgo(5),
    },

    // ── CTA demo: LOW-BASICS — no DOB/height/color/registry/sire/dam, strong everything else ──
    {
      name: 'Canyon Drift',
      slug: 'canyon-drift',
      breed: 'Quarter Horse',
      // Intentionally omitting: date_of_birth, height_hands, color,
      // registered_name, registration_number, registry, sire, dam
      // Basics score: name(20) + breed(20) + gender(15) + price(30) = 85/200 = 42.5%
      gender: 'gelding' as const,
      discipline_ids: disc(['Western Pleasure', 'Trail']),
      level: 'Intermediate',
      show_experience: 'Experienced trail horse with over 50 competitive trail miles. Steady on terrain.',
      show_record: 'AQHA trail versatility champion, multiple ranch riding placings',
      price: 2800000,
      price_display: '$28,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Robert Hale, Scottsdale Equine',
      vaccination_status: 'Current — full protocol',
      coggins_date: '2026-01-15',
      coggins_expiry: '2027-01-15',
      henneke_score: 5,
      soundness_level: 'vet_confirmed_sound' as const,
      location_city: 'Scottsdale',
      location_state: 'AZ',
      location_zip: '85255',
      barn_name: 'Tryon Ridge Stables',
      temperament: 'Steady, confident, and traffic-safe. Will go anywhere you point him.',
      suitable_for: 'Trail rider, ranch work, beginner-safe',
      years_with_current_owner: 5,
      reason_for_sale: 'Owner downsizing herd.',
      seller_state: 'AZ',
      farm_id: farmIds['tryon-ridge-stables'],
      published_at: daysAgo(6),
    },
  ];

  const listingIds: string[] = [];

  for (const horse of horseData) {
    const { data, error } = await supabase
      .from('horse_listings')
      .insert({
        seller_id: userIds.seller,
        farm_id: farm.id,
        status: 'active',
        seller_state: horse.seller_state ?? 'FL',
        expires_at: daysFromNow(90),
        ...horse,
      })
      .select('id, name, completeness_score, completeness_grade')
      .single();
    if (error) die(`Creating listing "${horse.name}"`, error);
    listingIds.push(data.id);
    console.log(`     ${data.name} — score ${data.completeness_score} (${data.completeness_grade})`);
  }

  // ── Step 6: Create listing media ───────────────────────────────────────────

  console.log('  6. Adding listing media...');

  const img = (id: string, w = 1200, h = 800) =>
    `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop`;

  // Verified Unsplash photo IDs + Mixkit horse video URLs
  const listingMedia: { listing: number; type: 'photo' | 'video'; url: string; alt: string; primary?: boolean; w?: number; h?: number }[] = [
    // ── Bellissimo's Legacy (4 photos + 1 video) ──
    { listing: 0, type: 'photo', url: img('photo-1553284965-83fd3e82fa5a'), alt: 'Conformation shot — bay warmblood mare', primary: true },
    { listing: 0, type: 'photo', url: img('photo-1762590856097-000961e62704'), alt: 'Head portrait — attentive expression' },
    { listing: 0, type: 'photo', url: img('photo-1598974357801-cbca100e65d3'), alt: 'In the arena — flatwork' },
    { listing: 0, type: 'photo', url: img('photo-1692111067438-a1913e601bca'), alt: 'Turnout — morning in the paddock' },
    { listing: 0, type: 'video', url: 'https://assets.mixkit.co/videos/4856/4856-720.mp4', alt: 'Jumping round at WEF', w: 1280, h: 720 },

    // ── Harbor Light (4 photos + 1 video) ──
    { listing: 1, type: 'photo', url: img('photo-1551884831-bbf3cdc6469e'), alt: 'Conformation — dark bay thoroughbred gelding', primary: true },
    { listing: 1, type: 'photo', url: img('photo-1632137958301-b113943bce71'), alt: 'Silhouette — evening gallop' },
    { listing: 1, type: 'photo', url: img('photo-1719932397218-73c69f83db63'), alt: 'Cross-country schooling' },
    { listing: 1, type: 'photo', url: img('photo-1618774871025-9656f3b25220'), alt: 'Close-up in the barn aisle' },
    { listing: 1, type: 'video', url: 'https://assets.mixkit.co/videos/1484/1484-720.mp4', alt: 'Galloping in the field', w: 1280, h: 720 },

    // ── Copper Creek (3 photos — FAIR tier) ──
    { listing: 2, type: 'photo', url: img('photo-1566824871434-85201e8430ef'), alt: 'Conformation — sorrel quarter horse gelding', primary: true },
    { listing: 2, type: 'photo', url: img('photo-1759174727484-85977922f406'), alt: 'Western pleasure under saddle' },
    { listing: 2, type: 'photo', url: img('photo-1763130063555-1544100e84d7'), alt: 'Relaxed in the pasture' },

    // ── Starlight Sonata (4 photos + 1 video) ──
    { listing: 3, type: 'photo', url: img('photo-1760041870912-70bc0a65edca'), alt: 'Conformation — black Hanoverian mare', primary: true },
    { listing: 3, type: 'photo', url: img('photo-1760041871081-7d709a3967ab'), alt: 'Extended trot — dressage arena' },
    { listing: 3, type: 'photo', url: img('photo-1571140023829-46c8b61e071c'), alt: 'Portrait in morning light' },
    { listing: 3, type: 'photo', url: img('photo-1628996084452-deb83cb04988'), alt: 'Grazing in the field' },
    { listing: 3, type: 'video', url: 'https://assets.mixkit.co/videos/34479/34479-720.mp4', alt: 'Dressage schooling session', w: 1280, h: 720 },

    // ── Lucky Penny (2 photos — FAIR tier) ──
    { listing: 4, type: 'photo', url: img('photo-1686075876492-f19c1d18f6e1'), alt: 'Conformation — chestnut Welsh Cob mare', primary: true },
    { listing: 4, type: 'photo', url: img('photo-1574174170574-c3a7955a227a'), alt: 'With young rider at show' },

    // ── Midnight Storm (1 photo, no alt — INCOMPLETE tier) ──
    { listing: 5, type: 'photo', url: img('photo-1766130463702-81aadcbad71f'), alt: '', primary: true },

    // ── Royal Dorado (6 photos + 1 video) ──
    { listing: 6, type: 'photo', url: img('photo-1550785330-003a9afa3bd9'), alt: 'Conformation — black Andalusian stallion', primary: true },
    { listing: 6, type: 'photo', url: img('photo-1450052590821-8bf91254a353'), alt: 'Extended trot on the diagonal' },
    { listing: 6, type: 'photo', url: img('photo-1559295928-6964f905e9c7'), alt: 'Portrait — proud stallion head' },
    { listing: 6, type: 'photo', url: img('photo-1561361649-c86e8a408c95'), alt: 'Passage work in outdoor arena' },
    { listing: 6, type: 'photo', url: img('photo-1520580413066-ac45756bdc71'), alt: 'Turnout in California sunshine' },
    { listing: 6, type: 'photo', url: img('photo-1563884039302-72cf7bae6cd8'), alt: 'Under saddle — collected canter' },
    { listing: 6, type: 'video', url: 'https://assets.mixkit.co/videos/4857/4857-720.mp4', alt: 'Dressage schooling session', w: 1280, h: 720 },

    // ── Galway Bay (6 photos + 1 video) ──
    { listing: 7, type: 'photo', url: img('photo-1761245048376-ddbcc776176b'), alt: 'Conformation — grey Irish Sport Horse', primary: true },
    { listing: 7, type: 'photo', url: img('photo-1567367409966-1f1d990e087b'), alt: 'Cross-country water jump' },
    { listing: 7, type: 'photo', url: img('photo-1568910866193-8240a89e9648'), alt: 'Stadium jumping round' },
    { listing: 7, type: 'photo', url: img('photo-1714994632313-f6da9b1310b2'), alt: 'Dressage warm-up at HT' },
    { listing: 7, type: 'photo', url: img('photo-1766735141566-3ea5388c3ee3'), alt: 'Relaxing in the paddock' },
    { listing: 7, type: 'photo', url: img('photo-1759562082235-56fb856fd42f'), alt: 'Portrait — kind eye' },
    { listing: 7, type: 'video', url: 'https://assets.mixkit.co/videos/4858/4858-720.mp4', alt: 'Cross-country schooling round', w: 1280, h: 720 },

    // ── Painted Sky (1 photo, no alt — INCOMPLETE tier) ──
    { listing: 8, type: 'photo', url: img('photo-1580216501592-7493ce4d6b58'), alt: '', primary: true },

    // ── Valkenswaard (6 photos + 1 video) ──
    { listing: 9, type: 'photo', url: img('photo-1594768816441-1dd241ffaa67'), alt: 'Conformation — bay Dutch Warmblood gelding', primary: true },
    { listing: 9, type: 'photo', url: img('photo-1595675759752-a743a9b71d93'), alt: 'Jumping 1.35m at Tryon' },
    { listing: 9, type: 'photo', url: img('photo-1650397305945-3385080fb1f7'), alt: 'Head portrait — alert expression' },
    { listing: 9, type: 'photo', url: img('photo-1650397306022-097627d330d1'), alt: 'Flatwork — collected canter' },
    { listing: 9, type: 'photo', url: img('photo-1600757490188-1eb2bab4cf4a'), alt: 'Walking course at CSI' },
    { listing: 9, type: 'photo', url: img('photo-1604566076816-e65490d4c536'), alt: 'In the wash stall after show' },
    { listing: 9, type: 'video', url: 'https://assets.mixkit.co/videos/4859/4859-720.mp4', alt: '1.35m show jumping round', w: 1280, h: 720 },

    // ── Heritage Brass (6 photos + 1 video) ──
    { listing: 10, type: 'photo', url: img('photo-1605264522799-1996bdbe5f72'), alt: 'Conformation — chestnut Morgan gelding', primary: true },
    { listing: 10, type: 'photo', url: img('photo-1609128231746-356e747a53bc'), alt: 'Sport horse in-hand' },
    { listing: 10, type: 'photo', url: img('photo-1742672631920-453848314a67'), alt: 'Dressage test — medium trot' },
    { listing: 10, type: 'photo', url: img('photo-1559659087-8c54ca81ed78'), alt: 'Portrait — Morgan character' },
    { listing: 10, type: 'photo', url: img('photo-1580974582235-4996ef109bbe'), alt: 'Grazing in California hills' },
    { listing: 10, type: 'photo', url: img('photo-1613533583658-62e7947373b2'), alt: 'Tacked up and ready' },
    { listing: 10, type: 'video', url: 'https://assets.mixkit.co/videos/1486/1486-720.mp4', alt: 'Dressage schooling at home', w: 1280, h: 720 },

    // ── Dark Raven (6 photos + 1 video) ──
    { listing: 11, type: 'photo', url: img('photo-1770635263259-f27acc408b22'), alt: 'Conformation — black Friesian gelding', primary: true },
    { listing: 11, type: 'photo', url: img('photo-1622205656486-0b6263050c27'), alt: 'Extended trot — mane flowing' },
    { listing: 11, type: 'photo', url: img('photo-1634436411978-4fa22337a302'), alt: 'In the barn aisle — gentle giant' },
    { listing: 11, type: 'photo', url: img('photo-1762512383383-bdc409ea7923'), alt: 'Liberty work in the arena' },
    { listing: 11, type: 'photo', url: img('photo-1721471543348-cc76e7fd858b'), alt: 'Head portrait — Friesian presence' },
    { listing: 11, type: 'photo', url: img('photo-1648632658054-3c670fd053d5'), alt: 'Under saddle at dressage show' },
    { listing: 11, type: 'video', url: 'https://assets.mixkit.co/videos/34480/34480-720.mp4', alt: 'Third Level dressage test', w: 1280, h: 720 },

    // ── Spotted Eagle (2 photos — FAIR tier) ──
    { listing: 12, type: 'photo', url: img('photo-1649966836663-572ec8b093e8'), alt: 'Conformation — leopard Appaloosa mare', primary: true },
    { listing: 12, type: 'photo', url: img('photo-1761470628137-0ee8360ea381'), alt: 'Western pleasure jog' },

    // ── Königsberg (6 photos + 1 video) ──
    { listing: 13, type: 'photo', url: img('photo-1659814975326-90fbd6f601fd'), alt: 'Conformation — chestnut Trakehner mare', primary: true },
    { listing: 13, type: 'photo', url: img('photo-1666280254768-bc0fa68eef1c'), alt: 'Cross-country gallop' },
    { listing: 13, type: 'photo', url: img('photo-1487730116645-74489c95b41b'), alt: 'Stadium jumping — scope for days' },
    { listing: 13, type: 'photo', url: img('photo-1667842580940-dabf4bf3cc31'), alt: 'Dressage phase at HT' },
    { listing: 13, type: 'photo', url: img('photo-1674759325222-51d433a4e8da'), alt: 'Portrait — elegant Trakehner head' },
    { listing: 13, type: 'photo', url: img('photo-1657285265140-6af28439633f'), alt: 'Turnout — morning gallop' },
    { listing: 13, type: 'video', url: 'https://assets.mixkit.co/videos/1487/1487-720.mp4', alt: 'Eventing highlight reel', w: 1280, h: 720 },

    // ── Silver Cascade (1 photo only — LOW MEDIA demo) ──
    { listing: 14, type: 'photo', url: img('photo-1594768816441-1dd241ffaa67'), alt: 'Conformation — grey Holsteiner gelding', primary: true },

    // ── Canyon Drift (6 photos + 1 video — strong media, LOW BASICS demo) ──
    { listing: 16, type: 'photo', url: img('photo-1566824871434-85201e8430ef'), alt: 'Conformation — Quarter Horse gelding', primary: true },
    { listing: 16, type: 'photo', url: img('photo-1759174727484-85977922f406'), alt: 'Trail riding in the canyon' },
    { listing: 16, type: 'photo', url: img('photo-1763130063555-1544100e84d7'), alt: 'Relaxed in the pasture' },
    { listing: 16, type: 'photo', url: img('photo-1580216501592-7493ce4d6b58'), alt: 'Under saddle — western pleasure' },
    { listing: 16, type: 'photo', url: img('photo-1574174170574-c3a7955a227a'), alt: 'At the water crossing' },
    { listing: 16, type: 'photo', url: img('photo-1686075876492-f19c1d18f6e1'), alt: 'Head portrait — calm expression' },
    { listing: 16, type: 'video', url: 'https://assets.mixkit.co/videos/1484/1484-720.mp4', alt: 'Trail riding highlight', w: 1280, h: 720 },

    // ── Autumn Ember (6 photos + 1 video — strong media, LOW DETAILS demo) ──
    { listing: 15, type: 'photo', url: img('photo-1553284965-83fd3e82fa5a'), alt: 'Conformation — chestnut Thoroughbred mare', primary: true },
    { listing: 15, type: 'photo', url: img('photo-1551884831-bbf3cdc6469e'), alt: 'Portrait — soft expression' },
    { listing: 15, type: 'photo', url: img('photo-1632137958301-b113943bce71'), alt: 'Galloping in the field' },
    { listing: 15, type: 'photo', url: img('photo-1571140023829-46c8b61e071c'), alt: 'Grazing at turnout' },
    { listing: 15, type: 'photo', url: img('photo-1628996084452-deb83cb04988'), alt: 'Under saddle — trot work' },
    { listing: 15, type: 'photo', url: img('photo-1598974357801-cbca100e65d3'), alt: 'Cross-country schooling' },
    { listing: 15, type: 'video', url: 'https://assets.mixkit.co/videos/4856/4856-720.mp4', alt: 'Flatwork schooling session', w: 1280, h: 720 },
  ];

  const mediaRows = listingMedia.map((m, i) => ({
    listing_id: listingIds[m.listing],
    type: m.type,
    url: m.url,
    alt_text: m.alt,
    sort_order: listingMedia.filter((x, j) => x.listing === m.listing && j < i).length,
    is_primary: m.primary ?? false,
    width: m.w ?? 1200,
    height: m.h ?? 800,
  }));

  const { error: mediaErr } = await supabase.from('listing_media').insert(mediaRows);
  if (mediaErr) die('Creating listing media', mediaErr);
  const videoCount = listingMedia.filter(m => m.type === 'video').length;
  console.log(`     ${listingMedia.length - videoCount} photos + ${videoCount} videos across ${horseData.length} listings`);

  // ── Step 6b: Registry verification records ─────────────────────────────────

  console.log('  6b. Adding registry records...');
  const registryRows = [
    { listing_id: listingIds[0], registry: 'AQHA', registry_number: '5678901', registered_name: "Bellissimo's Legacy", status: 'verified', verified_at: new Date().toISOString() },
    { listing_id: listingIds[0], registry: 'USEF', registry_number: '5234567', status: 'pending' },
    { listing_id: listingIds[2], registry: 'USDF', registry_number: '12345', status: 'unverified' },
    { listing_id: listingIds[4], registry: 'USHJA', registry_number: '8901234', status: 'verified', verified_at: new Date().toISOString() },
  ];
  const { error: regErr } = await supabase.from('listing_registry_records').insert(registryRows);
  if (regErr) die('Creating registry records', regErr);
  console.log(`     ${registryRows.length} registry records across ${new Set(registryRows.map(r => r.listing_id)).size} listings`);

  // ── Step 7: Create conversations ───────────────────────────────────────────

  console.log('  7. Creating conversations...');

  const convData = [
    { listing_id: listingIds[0], listingName: horseData[0].name },
    { listing_id: listingIds[3], listingName: horseData[3].name },
  ];

  const convIds: string[] = [];
  for (const c of convData) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: userIds.buyer,
        participant_2_id: userIds.seller,
        listing_id: c.listing_id,
      })
      .select('id')
      .single();
    if (error) die(`Creating conversation about ${c.listingName}`, error);
    convIds.push(data.id);
    console.log(`     Conversation about ${c.listingName}`);
  }

  // ── Step 8: Create messages ────────────────────────────────────────────────

  console.log('  8. Sending messages...');

  // Conversation 1: Buyer asks about Bellissimo's Legacy
  const conv1Messages = [
    { conversation_id: convIds[0], sender_id: userIds.buyer, body: "Hi Sarah! I saw Bellissimo's Legacy on ManeExchange and she looks incredible. I'm currently competing in the 3'0\" hunters and looking to move up. Would she be a good fit for an ambitious amateur? I'd love to schedule a trial ride.", created_at: daysAgo(2) },
    { conversation_id: convIds[0], sender_id: userIds.seller, body: "Hi Emily! Thanks for reaching out. Bella is an absolute dream for an amateur looking to step up. She's super brave and forgiving — she'll carry you up to the 3'6\" and beyond. She's clean on X-rays and I have a full PPE from November. Would you like to come try her this week? We're at Whispering Willows in Wellington.", created_at: daysAgo(1) },
    { conversation_id: convIds[0], sender_id: userIds.buyer, body: "That sounds amazing! I'd love to come try her. Would Thursday morning work? I can be there by 9am. Also, would you mind sending over the PPE results? My trainer wants to review before I come out.", created_at: hoursAgo(8) },
  ];

  // Conversation 2: Buyer asks about Starlight Sonata
  const conv2Messages = [
    { conversation_id: convIds[1], sender_id: userIds.buyer, body: "Hi again! I know I'm already looking at Bella, but Starlight Sonata caught my eye too. I've always wanted to try dressage. Is she suitable for someone transitioning from hunters?", created_at: daysAgo(1) },
    { conversation_id: convIds[1], sender_id: userIds.seller, body: "Emily, great question! Starlight is a phenomenal horse but she's an upper-level dressage horse — she needs a rider with a solid dressage seat. She'd be a project for a hunter rider. Honestly, Bella is a much better match for where you are right now. But if you're serious about dressage down the road, I can recommend some schoolmasters in your budget.", created_at: hoursAgo(20) },
    { conversation_id: convIds[1], sender_id: userIds.buyer, body: "That's really helpful, thank you for being honest! Let's focus on Bella for now. I'll circle back on dressage next year. See you Thursday!", created_at: hoursAgo(4) },
  ];

  // Insert in chronological order so the last_message trigger works correctly
  for (const msg of [...conv1Messages, ...conv2Messages].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    const { error } = await supabase.from('messages').insert(msg);
    if (error) die('Sending message', error);
  }
  console.log('     6 messages sent across 2 conversations');

  // ── Step 9: Create offer ───────────────────────────────────────────────────

  console.log('  9. Creating offer...');

  const { error: offerErr } = await supabase.from('offers').insert({
    listing_id: listingIds[0],
    buyer_id: userIds.buyer,
    seller_id: userIds.seller,
    amount_cents: 8000000,
    message: "Hi Sarah, I'd like to make an offer on Bellissimo's Legacy. She's exactly what I've been looking for. Offering $80,000 — happy to do a full PPE and close through ManeVault escrow.",
    payment_method: 'ach',
    status: 'pending',
    expires_at: daysFromNow(3),
  });
  if (offerErr) die('Creating offer', offerErr);
  console.log("     $80,000 offer on Bellissimo's Legacy (pending)");

  // Offer for Heritage Brass (under_offer)
  const { error: offerErr2 } = await supabase.from('offers').insert({
    listing_id: listingIds[10],
    buyer_id: userIds.buyer,
    seller_id: userIds.seller,
    amount_cents: 2000000,
    message: "Interested in Heritage Brass for my daughter's dressage program. Offering $20,000. Can do PPE this week.",
    payment_method: 'ach',
    status: 'pending',
    expires_at: daysFromNow(5),
  });
  if (offerErr2) die('Creating offer for Heritage Brass', offerErr2);
  console.log('     $20,000 offer on Heritage Brass (pending — under_offer)');

  // Offer for Dark Raven (sold)
  const { error: offerErr3 } = await supabase.from('offers').insert({
    listing_id: listingIds[11],
    buyer_id: userIds.buyer,
    seller_id: userIds.seller,
    amount_cents: 6200000,
    message: "Dark Raven is exactly what I've been looking for. Offering $62,000 through ManeVault.",
    payment_method: 'ach',
    status: 'accepted',
    expires_at: daysAgo(15),
  });
  if (offerErr3) die('Creating offer for Dark Raven', offerErr3);
  console.log('     $62,000 offer on Dark Raven (accepted — sold)');

  // ── Steps 10-13: Engagement data (requires migrations 009-011 in schema cache) ──

  const skipped: string[] = [];

  // Step 10: Reviews
  console.log('  10. Creating reviews...');
  const { error: reviewErr } = await supabase.from('reviews').insert([
    {
      reviewer_id: userIds.buyer,
      seller_id: userIds.seller,
      listing_id: listingIds[4],
      stage: 'completion',
      rating: 5,
      title: 'Incredible experience from start to finish',
      body: 'Sarah was so transparent and helpful throughout the entire process. She sent videos, vet records, and even arranged multiple trial rides. Lucky Penny was exactly as described. The escrow process through ManeExchange made everything smooth and secure. Highly recommend!',
      is_verified_purchase: true,
      created_at: daysAgo(30),
    },
    {
      reviewer_id: userIds.buyer,
      seller_id: userIds.seller,
      listing_id: listingIds[2],
      stage: 'inquiry',
      rating: 4,
      title: 'Very responsive and knowledgeable',
      body: "Reached out about Copper Creek. Sarah was quick to respond and very upfront about the horse's strengths and limitations. Ultimately went a different direction but would absolutely buy from her in the future.",
      is_verified_purchase: false,
      created_at: daysAgo(15),
    },
  ]);
  if (reviewErr) {
    console.log(`     SKIPPED — ${reviewErr.message}`);
    skipped.push('reviews');
  } else {
    console.log('     2 reviews created (5-star and 4-star)');
  }

  // Step 11: ISO
  console.log('  11. Creating ISO post...');
  const { error: isoErr } = await supabase.from('iso_posts').insert({
    user_id: userIds.buyer,
    title: 'Schoolmaster Dressage Horse for Transitioning Hunter Rider',
    description: "Looking for a well-schooled dressage horse suitable for a rider transitioning from hunters. Ideally confirmed through Second or Third Level with a patient temperament. I'm an adult amateur with a solid position but limited dressage-specific experience. Prefer something in the Wellington/Ocala area but willing to travel for the right horse. Would love a mare or gelding, 15.2-16.3hh. Budget is flexible for the right match.",
    discipline_ids: disc(['Dressage']),
    min_price: 2000000,
    max_price: 6000000,
    min_height_hands: 15.2,
    max_height_hands: 16.3,
    gender: ['mare', 'gelding'],
    breeds: ['Hanoverian', 'Warmblood', 'KWPN', 'Oldenburg'],
    preferred_states: ['FL'],
    level: 'Second Level - Third Level',
    status: 'active',
    expires_at: daysFromNow(90),
  });
  if (isoErr) {
    console.log('     SKIPPED — iso_posts table not in schema cache');
    skipped.push('ISO post');
  } else {
    console.log('     ISO: "Schoolmaster Dressage Horse" posted');
  }

  // Step 12: Dream Barn
  console.log('  12. Creating Dream Barn collection...');
  const { data: collection, error: collErr } = await supabase
    .from('collections')
    .insert({
      user_id: userIds.buyer,
      name: 'Top Picks',
      slug: 'top-picks',
      description: 'My favorite horses on ManeExchange',
      visibility: 'private',
    })
    .select('id')
    .single();

  if (collErr) {
    console.log('     SKIPPED — collections table not in schema cache');
    skipped.push('Dream Barn collection');
  } else {
    await supabase.from('collection_items').insert([
      { collection_id: collection.id, listing_id: listingIds[0], price_at_added: 8500000 },
      { collection_id: collection.id, listing_id: listingIds[3], price_at_added: 12000000 },
      { collection_id: collection.id, listing_id: listingIds[4], price_at_added: 2200000 },
    ]);
    await supabase.from('collections').update({ item_count: 3 }).eq('id', collection.id);
    console.log('     "Top Picks" collection with 3 horses');
  }

  // Step 13: Admin access
  console.log('  13. Setting admin access...');
  const { error: adminErr } = await supabase
    .from('profiles')
    .update({ is_admin: true } as Record<string, unknown>)
    .eq('id', userIds.seller);

  if (adminErr) {
    console.log('     SKIPPED — is_admin column not in schema cache');
    skipped.push('admin access');
  } else {
    console.log('     seller@test.com granted admin access');
  }

  // ── Done ───────────────────────────────────────────────────────────────────

  console.log('\n  ===========================');
  console.log('  Seed complete!\n');
  console.log('  Test accounts:');
  console.log('  ┌──────────────────────┬────────────┬───────┐');
  console.log('  │ Email                │ Password   │ Admin │');
  console.log('  ├──────────────────────┼────────────┼───────┤');
  console.log('  │ seller@test.com      │ Test1234!  │ Yes   │');
  console.log('  │ buyer@test.com       │ Test1234!  │ No    │');
  console.log('  │ trainer@test.com     │ Test1234!  │ No    │');
  console.log('  └──────────────────────┴────────────┴───────┘\n');
  const totalListings = horseData.length;
  const nonActive = horseData.filter((h) => 'status' in h).length;
  const activeListings = totalListings - nonActive;

  console.log('  Verification:');
  console.log(`  1. seller@test.com  → Dashboard with ${totalListings} listings, messages, offers`);
  console.log('  2. buyer@test.com   → Messages, offers, Dream Barn');
  console.log(`  3. /browse          → ${activeListings} active listings (+ ${nonActive} non-active)`);
  console.log('  4. /admin (seller)  → Admin panel with stats');
  console.log('  5. /horses/bellissimos-legacy → Full listing detail');
  console.log('  6. /just-sold       → Dark Raven (sold listing)\n');

  if (skipped.length) {
    console.log('  !! Schema cache issue !!');
    console.log(`  Skipped: ${skipped.join(', ')}`);
    console.log('  Fix: Open Supabase Dashboard → SQL Editor → run any query (e.g. SELECT 1)');
    console.log('  This forces PostgREST to reload its schema cache.');
    console.log('  Then re-run: npm run seed\n');
  }
}

main().catch((err) => {
  console.error('\nSeed failed:', err);
  process.exit(1);
});
