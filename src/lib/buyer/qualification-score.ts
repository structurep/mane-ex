export type QualificationBadge = "Unverified" | "Verified Buyer" | "Qualified Buyer";

export type QualificationResult = {
  score: number;
  badge: QualificationBadge;
};

type ProfileFields = {
  riding_level?: string | null;
  trainer_reference?: string | null;
  min_budget?: number | null;
  max_budget?: number | null;
  facility_type?: string | null;
  disciplines?: string[] | null;
};

/**
 * Compute buyer qualification score from profile completeness.
 * Each meaningful field adds 1 point. Badge thresholds:
 *   0–1 → Unverified
 *   2–3 → Verified Buyer
 *   4+  → Qualified Buyer
 */
export function computeQualification(profile: ProfileFields): QualificationResult {
  let score = 0;

  if (profile.riding_level) score++;
  if (profile.trainer_reference?.trim()) score++;
  if (profile.min_budget != null || profile.max_budget != null) score++;
  if (profile.facility_type && profile.facility_type !== "unknown") score++;
  if (profile.disciplines && profile.disciplines.length > 0) score++;

  const badge: QualificationBadge =
    score >= 4 ? "Qualified Buyer" : score >= 2 ? "Verified Buyer" : "Unverified";

  return { score, badge };
}

export function badgeVariant(badge: QualificationBadge): "gold" | "blue" | "gray" {
  if (badge === "Qualified Buyer") return "gold";
  if (badge === "Verified Buyer") return "blue";
  return "gray";
}
