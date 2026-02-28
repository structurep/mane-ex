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
      name: 'Harbor Light',
      slug: 'harbor-light',
      breed: 'Thoroughbred',
      registered_name: 'Harbor Light',
      registration_number: 'JC-2018-44821',
      registry: 'Jockey Club',
      gender: 'gelding' as const,
      color: 'Dark Bay',
      date_of_birth: '2018-03-22',
      age_years: 7,
      height_hands: 17.0,
      sire: 'Curlin',
      dam: 'Quiet Harbor',
      discipline_ids: disc(['Eventing']),
      level: 'Preliminary',
      show_experience: 'Competed through Preliminary with clear XC rounds. OTTB retrained 2021.',
      show_record: 'Top-10 AEC Preliminary 2025, multiple HT wins at Training level',
      price: 4500000,
      price_display: '$45,000',
      warranty: 'as_is' as const,
      vet_name: 'Dr. James Whitfield, Ocala Equine',
      vaccination_status: 'Current — full protocol',
      coggins_date: '2025-09-15',
      coggins_expiry: '2026-09-15',
      location_city: 'Wellington',
      location_state: 'FL',
      location_zip: '33414',
      barn_name: 'Whispering Willows Farm',
      temperament: 'Bold, athletic, competitive. Wants a job.',
      suitable_for: 'Ambitious eventer, experienced rider',
      henneke_score: 6,
      soundness_level: 'minor_findings' as const,
      years_with_current_owner: 2,
      reason_for_sale: 'Owner focusing on dressage horses.',
      published_at: daysAgo(4),
    },
    {
      name: 'Copper Creek',
      slug: 'copper-creek',
      breed: 'Quarter Horse',
      registered_name: 'Docs Copper Creek',
      registration_number: 'AQHA-6021448',
      registry: 'AQHA',
      gender: 'gelding' as const,
      color: 'Sorrel',
      date_of_birth: '2016-05-08',
      age_years: 9,
      height_hands: 15.1,
      sire: 'Docs Prescription',
      dam: 'Creek Side Annie',
      discipline_ids: disc(['Western Pleasure', 'Reining']),
      level: 'Open',
      show_experience: 'AQHA World Show qualifier in Western Pleasure. Solid reining foundation.',
      show_record: 'AQHA World Show qualifier 2024, multiple Congress top-10',
      price: 2800000,
      price_display: '$28,000',
      warranty: 'sound_for_use' as const,
      vet_name: 'Dr. Robert Hayes, Ocala Equine',
      vaccination_status: 'Current',
      coggins_date: '2025-10-01',
      coggins_expiry: '2026-10-01',
      location_city: 'Wellington',
      location_state: 'FL',
      location_zip: '33414',
      barn_name: 'Whispering Willows Farm',
      temperament: 'Quiet, steady, kid-safe. Great trail horse too.',
      suitable_for: 'Amateur, youth, beginner',
      henneke_score: 5,
      soundness_level: 'vet_confirmed_sound' as const,
      years_with_current_owner: 4,
      reason_for_sale: 'Downsizing herd.',
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
      vet_name: 'Dr. Amanda Roberts, Wellington Equine',
      vaccination_status: 'Current — full protocol including strangles',
      coggins_date: '2025-12-01',
      coggins_expiry: '2026-12-01',
      location_city: 'Wellington',
      location_state: 'FL',
      location_zip: '33414',
      barn_name: 'Whispering Willows Farm',
      current_trainer: 'Sarah Mitchell',
      feeding_program: 'Tribute Kalm Ultra, supplements include SmartPak joint/gut support',
      temperament: 'Sensitive but generous. Needs a tactful, educated ride.',
      suitable_for: 'Serious dressage amateur, small-tour competitor',
      henneke_score: 4,
      soundness_level: 'managed_condition' as const,
      years_with_current_owner: 5,
      reason_for_sale: 'Owner relocating internationally.',
      published_at: daysAgo(6),
    },
    {
      name: 'Lucky Penny',
      slug: 'lucky-penny',
      breed: 'Welsh Cob',
      registered_name: "Lucky Penny's Gold",
      registration_number: 'WPCSA-18422',
      registry: 'WPCSA',
      gender: 'mare' as const,
      color: 'Chestnut',
      date_of_birth: '2014-03-01',
      age_years: 11,
      height_hands: 14.2,
      sire: 'Dorian Gold',
      dam: 'Penny Lane',
      discipline_ids: disc(['Hunter', 'Equitation']),
      level: 'Children\'s/Short Stirrup',
      show_experience: 'Packer. Has taken two kids from leadline to the 2\'6" hunters.',
      show_record: 'Multiple Champion in Short Stirrup and Children\'s Hunter at local A shows',
      price: 2200000,
      price_display: '$22,000',
      warranty: 'sound_at_sale' as const,
      vet_name: 'Dr. Lisa Fernandez',
      vaccination_status: 'Current',
      coggins_date: '2025-08-15',
      coggins_expiry: '2026-08-15',
      location_city: 'Wellington',
      location_state: 'FL',
      location_zip: '33414',
      barn_name: 'Whispering Willows Farm',
      temperament: 'Bombproof. Perfect first horse.',
      suitable_for: 'Children, beginners, small adults',
      good_with: 'Kids, dogs, clippers, trailering',
      henneke_score: 6,
      soundness_level: 'vet_confirmed_sound' as const,
      years_with_current_owner: 6,
      reason_for_sale: 'Kids have outgrown her. Deserves another kid to love.',
      published_at: daysAgo(2),
    },
    {
      name: 'Midnight Storm',
      slug: 'midnight-storm',
      breed: 'Oldenburg',
      registered_name: 'Midnight Storm GOV',
      registration_number: 'GOV-2019-5528',
      registry: 'GOV',
      gender: 'stallion' as const,
      color: 'Dark Bay',
      date_of_birth: '2019-02-28',
      age_years: 6,
      height_hands: 17.1,
      sire: 'Cornet Obolensky',
      dam: 'Midnight Mist',
      discipline_ids: disc(['Show Jumping', 'Jumper']),
      level: '1.40m',
      show_experience: 'Fast-tracked young horse. Clear rounds at 1.40m. Grand Prix potential.',
      show_record: '7-year-old YH Final qualifier, multiple 1.35m wins, clear at 1.40m CSI2*',
      fei_id: 'FEI-108442',
      price: 25000000,
      price_display: '$250,000',
      price_negotiable: false,
      warranty: 'as_is' as const,
      vet_name: 'Dr. Amanda Roberts, Wellington Equine',
      vet_phone: '(561) 555-0199',
      vaccination_status: 'Current — full FEI protocol',
      coggins_date: '2026-01-15',
      coggins_expiry: '2027-01-15',
      location_city: 'Wellington',
      location_state: 'FL',
      location_zip: '33414',
      barn_name: 'Whispering Willows Farm',
      current_trainer: 'Sarah Mitchell',
      temperament: 'Scopey, careful, and competitive. Needs experienced professional.',
      suitable_for: 'Professional rider, Grand Prix program',
      henneke_score: 5,
      soundness_level: 'not_assessed' as const,
      years_with_current_owner: 2,
      reason_for_sale: 'Syndicate offering approved stallion to serious GP program.',
      published_at: daysAgo(1),
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
        seller_state: 'FL',
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

  // 24 verified Unsplash photo IDs + 3 Mixkit horse video URLs
  const listingMedia: { listing: number; type: 'photo' | 'video'; url: string; alt: string; primary?: boolean; w?: number; h?: number }[] = [
    // ── Bellissimo's Legacy (4 photos + 1 video) ──
    { listing: 0, type: 'photo', url: img('photo-1553284965-83fd3e82fa5a'), alt: 'Conformation shot — bay warmblood mare', primary: true },
    { listing: 0, type: 'photo', url: img('photo-1534307671554-9a6d81f4d629'), alt: 'Head portrait — attentive expression' },
    { listing: 0, type: 'photo', url: img('photo-1598974357801-cbca100e65d3'), alt: 'In the arena — flatwork' },
    { listing: 0, type: 'photo', url: img('photo-1516466723877-e4ec1d736c8a'), alt: 'Turnout — morning in the paddock' },
    { listing: 0, type: 'video', url: 'https://assets.mixkit.co/videos/4856/4856-720.mp4', alt: 'Jumping round at WEF', w: 1280, h: 720 },

    // ── Harbor Light (4 photos + 1 video) ──
    { listing: 1, type: 'photo', url: img('photo-1551884831-bbf3cdc6469e'), alt: 'Conformation — dark bay thoroughbred gelding', primary: true },
    { listing: 1, type: 'photo', url: img('photo-1508739773434-c26b3d09e071'), alt: 'Silhouette — evening gallop' },
    { listing: 1, type: 'photo', url: img('photo-1508214751196-bcfd4ca60f91'), alt: 'Cross-country schooling' },
    { listing: 1, type: 'photo', url: img('photo-1589656966895-2f33e7653819'), alt: 'Close-up in the barn aisle' },
    { listing: 1, type: 'video', url: 'https://assets.mixkit.co/videos/1484/1484-720.mp4', alt: 'Galloping in the field', w: 1280, h: 720 },

    // ── Copper Creek (4 photos) ──
    { listing: 2, type: 'photo', url: img('photo-1577114995803-d8ce0e2b4aa9'), alt: 'Conformation — sorrel quarter horse gelding', primary: true },
    { listing: 2, type: 'photo', url: img('photo-1543965170-4c01a586684e'), alt: 'Western pleasure under saddle' },
    { listing: 2, type: 'photo', url: img('photo-1548767797-d8c844163c4c'), alt: 'Relaxed in the pasture' },
    { listing: 2, type: 'photo', url: img('photo-1526047932273-341f2a7631f9'), alt: 'Head portrait with halter' },

    // ── Starlight Sonata (4 photos + 1 video) ──
    { listing: 3, type: 'photo', url: img('photo-1541746972996-4e0b0f43e02a'), alt: 'Conformation — black Hanoverian mare', primary: true },
    { listing: 3, type: 'photo', url: img('photo-1513360371669-4adf3dd7dff8'), alt: 'Extended trot — dressage arena' },
    { listing: 3, type: 'photo', url: img('photo-1506220926022-cc5c12acdb35'), alt: 'Portrait in morning light' },
    { listing: 3, type: 'photo', url: img('photo-1496861083958-175bb1bd5702'), alt: 'Grazing in the field' },
    { listing: 3, type: 'video', url: 'https://assets.mixkit.co/videos/34479/34479-720.mp4', alt: 'Dressage schooling session', w: 1280, h: 720 },

    // ── Lucky Penny (4 photos) ──
    { listing: 4, type: 'photo', url: img('photo-1476718406336-bb5a9690ee2a'), alt: 'Conformation — chestnut Welsh Cob mare', primary: true },
    { listing: 4, type: 'photo', url: img('photo-1444212477490-ca407925329e'), alt: 'With young rider at show' },
    { listing: 4, type: 'photo', url: img('photo-1513026705753-bc3fffca8bf4'), alt: 'Sweet face close-up' },
    { listing: 4, type: 'photo', url: img('photo-1495578942200-c5f5d2137def'), alt: 'Happy in the field' },

    // ── Midnight Storm (4 photos) ──
    { listing: 5, type: 'photo', url: img('photo-1515606378517-3451a4fa2e12'), alt: 'Conformation — dark bay Oldenburg stallion', primary: true },
    { listing: 5, type: 'photo', url: img('photo-1501706362039-c06b2d715385'), alt: 'Jumping 1.40m at CSI2*' },
    { listing: 5, type: 'photo', url: img('photo-1569098644584-210bcd375b59'), alt: 'Head portrait — stallion presence' },
    { listing: 5, type: 'photo', url: img('photo-1557438159-51eec7a6c9e8'), alt: 'Trot work in the ring' },
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
  console.log(`     ${listingMedia.length - videoCount} photos + ${videoCount} videos across 6 listings`);

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
  console.log('  Verification:');
  console.log('  1. seller@test.com  → Dashboard with 6 listings, messages, offer');
  console.log('  2. buyer@test.com   → Messages, offer, Dream Barn');
  console.log('  3. /browse          → 6 active listings');
  console.log('  4. /admin (seller)  → Admin panel with stats');
  console.log('  5. /horses/bellissimos-legacy → Full listing detail\n');

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
