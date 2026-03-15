export type VerificationTier = "none" | "bronze" | "silver" | "gold";

export type VerificationResult = {
  tier: VerificationTier;
  label: string;
};

const TIER_LABELS: Record<VerificationTier, string> = {
  none: "Unverified",
  bronze: "HorseProof Bronze",
  silver: "HorseProof Silver",
  gold: "HorseProof Gold",
};

type VerificationInput = {
  seller_identity_verified?: boolean;
  trainer_endorsed?: boolean;
  standardized_video_complete?: boolean;
  ppe_on_file?: boolean;
  show_record_linked?: boolean;
};

/**
 * Deterministic verification tier computation.
 *
 * Bronze: seller identity verified
 * Silver: bronze + trainer endorsed + standardized video
 * Gold:   silver + PPE on file + show record linked
 */
export function computeVerificationTier(listing: VerificationInput): VerificationResult {
  const identity = listing.seller_identity_verified === true;
  const trainer = listing.trainer_endorsed === true;
  const video = listing.standardized_video_complete === true;
  const ppe = listing.ppe_on_file === true;
  const showRecord = listing.show_record_linked === true;

  let tier: VerificationTier = "none";

  if (identity) {
    tier = "bronze";
    if (trainer && video) {
      tier = "silver";
      if (ppe && showRecord) {
        tier = "gold";
      }
    }
  }

  return { tier, label: TIER_LABELS[tier] };
}
