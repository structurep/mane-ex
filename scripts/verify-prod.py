#!/usr/bin/env python3
"""Production smoke check — run before demos.

Usage:
  python scripts/verify-prod.py [BASE_URL]

Default BASE_URL: https://mane-ex.vercel.app
"""

import json
import sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://mane-ex.vercel.app"

results: list[tuple[str, bool]] = []


def check(name: str, cond: bool) -> None:
    results.append((name, cond))
    print(f"  {'✓' if cond else '✗'} {name}")


print(f"\n🔍 Smoke-checking {BASE}\n")

# ── 1. Homepage ──
print("Homepage")
try:
    resp = urllib.request.urlopen(f"{BASE}/")
    html = resp.read().decode()
    check("200 OK", resp.status == 200)
    check("ManeExchange in title", "ManeExchange" in html)
except Exception as e:
    check(f"Homepage reachable ({e})", False)

# ── 2. Browse ──
print("Browse")
try:
    resp = urllib.request.urlopen(f"{BASE}/browse")
    html = resp.read().decode()
    check("200 OK", resp.status == 200)
    check("listings grid present", "horses available" in html or "No horses found" in html)
except Exception as e:
    check(f"Browse reachable ({e})", False)

# ── 3. Public barns API ──
print("API /api/public/barns")
try:
    resp = urllib.request.urlopen(f"{BASE}/api/public/barns")
    data = json.loads(resp.read())
    barns = data.get("barns", [])
    check("200 OK", resp.status == 200)
    check(">= 1 barn returned", len(barns) >= 1)
    check("only safe fields (id, name, slug)", all(set(b.keys()) == {"id", "name", "slug"} for b in barns))

    # Cache header
    cache = resp.headers.get("Cache-Control", "")
    check("Cache-Control header present", "s-maxage" in cache)
except Exception as e:
    check(f"Barns API reachable ({e})", False)
    barns = []

# ── 4. Public barn page (first slug from API) ──
if barns:
    slug = barns[0]["slug"]
    name = barns[0]["name"]
    print(f"Barn page /farms/{slug}")
    try:
        resp = urllib.request.urlopen(f"{BASE}/farms/{slug}")
        html = resp.read().decode()
        check("200 OK", resp.status == 200)
        check(f"barn name '{name}' in page", name in html)
        check("'Barn Owner' present", "Barn Owner" in html)
        check("no 'Farm Owner' remnant", "Farm Owner" not in html)
    except Exception as e:
        check(f"Barn page reachable ({e})", False)

# ── 5. Listing detail (first from browse) ──
print("Listing detail")
try:
    resp = urllib.request.urlopen(f"{BASE}/browse")
    html = resp.read().decode()
    # Extract first /horses/ link
    import re
    match = re.search(r'href="/horses/([^"]+)"', html)
    if match:
        horse_slug = match.group(1)
        resp2 = urllib.request.urlopen(f"{BASE}/horses/{horse_slug}")
        html2 = resp2.read().decode()
        check(f"200 OK for /horses/{horse_slug}", resp2.status == 200)
        check("Mane Score section present", "Mane Score" in html2 or "completeness" in html2.lower())
    else:
        check("found a horse slug in browse", False)
except Exception as e:
    check(f"Listing detail reachable ({e})", False)

# ── Summary ──
passed = sum(1 for _, c in results if c)
failed = sum(1 for _, c in results if not c)
print(f"\n{'=' * 40}")
print(f"  {passed} passed, {failed} failed / {len(results)} total")
if failed:
    print(f"\n  Failures:")
    for name, c in results:
        if not c:
            print(f"    ✗ {name}")
print()
sys.exit(1 if failed else 0)
