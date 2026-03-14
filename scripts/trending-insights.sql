-- =============================================
-- Trending & Engagement Insight Queries
-- Run against production Supabase (read-only)
-- =============================================

-- 1. Top 20 Listings by Favorite Rate (last 7 days)
-- Shows listings with highest favorite-to-total-swipe ratio
SELECT
  hl.name,
  hl.slug,
  hl.breed,
  hl.price / 100 AS price_dollars,
  COUNT(*) FILTER (WHERE se.direction = 'favorite') AS favorites,
  COUNT(*) FILTER (WHERE se.direction = 'pass') AS passes,
  COUNT(*) AS total_swipes,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE se.direction = 'favorite') / NULLIF(COUNT(*), 0),
    1
  ) AS favorite_rate_pct
FROM swipe_events se
JOIN horse_listings hl ON hl.id = se.listing_id
WHERE se.created_at >= NOW() - INTERVAL '7 days'
GROUP BY hl.id, hl.name, hl.slug, hl.breed, hl.price
HAVING COUNT(*) >= 5
ORDER BY favorite_rate_pct DESC
LIMIT 20;


-- 2. Top 20 Sellers by Engagement (last 30 days)
-- Aggregates swipe activity across all of a seller's listings
SELECT
  p.display_name AS seller_name,
  se.seller_id,
  COUNT(DISTINCT se.listing_id) AS active_listings,
  COUNT(*) AS total_swipes,
  COUNT(*) FILTER (WHERE se.direction = 'favorite') AS total_favorites,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE se.direction = 'favorite') / NULLIF(COUNT(*), 0),
    1
  ) AS favorite_rate_pct,
  ROUND(AVG(se.swipe_duration_ms)) AS avg_swipe_duration_ms
FROM swipe_events se
LEFT JOIN profiles p ON p.id = se.seller_id
WHERE se.created_at >= NOW() - INTERVAL '30 days'
  AND se.seller_id IS NOT NULL
GROUP BY se.seller_id, p.display_name
HAVING COUNT(*) >= 10
ORDER BY total_favorites DESC
LIMIT 20;


-- 3. Discipline Demand Distribution (last 30 days)
-- Shows which disciplines attract the most swipe engagement
SELECT
  se.discipline,
  COUNT(*) AS total_swipes,
  COUNT(*) FILTER (WHERE se.direction = 'favorite') AS favorites,
  COUNT(*) FILTER (WHERE se.direction = 'pass') AS passes,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE se.direction = 'favorite') / NULLIF(COUNT(*), 0),
    1
  ) AS favorite_rate_pct,
  ROUND(AVG(se.drag_distance_px)) AS avg_drag_px,
  ROUND(AVG(se.swipe_duration_ms)) AS avg_duration_ms
FROM swipe_events se
WHERE se.created_at >= NOW() - INTERVAL '30 days'
  AND se.discipline IS NOT NULL
GROUP BY se.discipline
ORDER BY total_swipes DESC;


-- 4. Price Band Engagement (last 30 days)
-- Shows which price ranges get the most love
SELECT
  CASE
    WHEN se.price IS NULL THEN 'Unknown'
    WHEN se.price < 500000 THEN 'Under $5k'
    WHEN se.price < 1500000 THEN '$5k–$15k'
    WHEN se.price < 3000000 THEN '$15k–$30k'
    WHEN se.price < 7500000 THEN '$30k–$75k'
    ELSE '$75k+'
  END AS price_band,
  COUNT(*) AS total_swipes,
  COUNT(*) FILTER (WHERE se.direction = 'favorite') AS favorites,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE se.direction = 'favorite') / NULLIF(COUNT(*), 0),
    1
  ) AS favorite_rate_pct
FROM swipe_events se
WHERE se.created_at >= NOW() - INTERVAL '30 days'
GROUP BY price_band
ORDER BY total_swipes DESC;


-- 5. Swipe Commit Method Distribution
-- How users are committing swipes: distance threshold vs velocity flick
SELECT
  se.commit_reason,
  COUNT(*) AS total,
  ROUND(AVG(se.drag_distance_px)) AS avg_drag_px,
  ROUND(AVG(ABS(se.velocity_x) * 1000)) AS avg_velocity,
  ROUND(AVG(se.swipe_duration_ms)) AS avg_duration_ms
FROM swipe_events se
WHERE se.created_at >= NOW() - INTERVAL '7 days'
GROUP BY se.commit_reason
ORDER BY total DESC;
