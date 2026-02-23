import {
  BADGE_DEFINITIONS,
  type SellerBadge,
  type BadgeDefinition,
  type ScoreGrade,
  GRADE_LABELS,
} from "@/types/scoring";

/**
 * Get badge definition by ID.
 */
export function getBadgeDefinition(
  badgeId: SellerBadge
): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
}

/**
 * Get all badges with earned/unearned status for a seller.
 * Used to render the badge showcase on the analytics dashboard.
 */
export function getBadgeShowcase(earnedBadges: SellerBadge[]): {
  earned: BadgeDefinition[];
  unearned: BadgeDefinition[];
} {
  const earnedSet = new Set(earnedBadges);
  const earned: BadgeDefinition[] = [];
  const unearned: BadgeDefinition[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (earnedSet.has(badge.id)) {
      earned.push(badge);
    } else {
      unearned.push(badge);
    }
  }

  return { earned, unearned };
}

/**
 * Get the grade label and styling for a score grade.
 */
export function getGradeDisplay(grade: ScoreGrade): {
  label: string;
  color: string;
} {
  return GRADE_LABELS[grade];
}

/**
 * Calculate the percentage fill for a score component progress bar.
 */
export function componentPercentage(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(Math.round((value / max) * 100), 100);
}

/**
 * Format a Mane Score for display (e.g., "847").
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Get a short description of score change for notifications.
 */
export function getScoreChangeLabel(oldScore: number, newScore: number): string {
  const diff = newScore - oldScore;
  if (diff === 0) return "No change";
  if (diff > 0) return `+${diff} pts`;
  return `${diff} pts`;
}
