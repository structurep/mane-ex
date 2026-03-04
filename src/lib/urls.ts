/**
 * Centralized URL builders for CTA links and navigation.
 * Change routing here once — all CTA contexts update automatically.
 */

export function getCreateListingUrl(): string {
  return "/dashboard/listings/new";
}

export function getEditListingUrl(listingId: string): string {
  return `/dashboard/listings/${listingId}/edit`;
}

export function getPublicListingUrl(
  slug: string,
  tab?: "basics" | "performance" | "health" | "media"
): string {
  if (tab) return `/horses/${slug}?tab=${tab}`;
  return `/horses/${slug}`;
}

export function getDashboardUrl(section?: string): string {
  if (section) return `/dashboard/${section}`;
  return "/dashboard";
}

export function getImproveManeScoreUrl(opts: {
  listingId?: string;
  slug?: string;
  weakestTab?: "basics" | "performance" | "health" | "media";
}): string {
  if (opts.listingId) return getEditListingUrl(opts.listingId);
  if (opts.slug && opts.weakestTab) return getPublicListingUrl(opts.slug, opts.weakestTab);
  return getDashboardUrl();
}
