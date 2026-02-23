// State-specific equine sale disclosure requirements.
// Shared between server (bill of sale generation) and client (display).

const STATE_DISCLOSURE_RULES: Record<
  string,
  { name: string; statute: string; requirements: string[] }
> = {
  FL: {
    name: "Florida",
    statute: "Fla. Admin. Code 5H-26",
    requirements: [
      "Written bill of sale required",
      "Seller must disclose medical treatments within 7 days of sale",
      "Dual agency requires prior written consent from both parties",
      "Commission disclosure required for amounts exceeding $500",
    ],
  },
  CA: {
    name: "California",
    statute: "Cal. Bus. & Prof. Code § 19525",
    requirements: [
      "Written bill of sale required",
      "Full disclosure of known defects and health issues",
      "Commission disclosure required",
    ],
  },
  KY: {
    name: "Kentucky",
    statute: "KRS 230.357",
    requirements: [
      "Written bill of sale required",
      "Disclosure of known health conditions",
      "Treble damages available for violations (sales over $10K)",
    ],
  },
};

/**
 * Get the applicable state disclosure rules for a transaction.
 */
export function getStateDisclosureRules(sellerState: string, buyerState: string) {
  const rules: { state: string; statute: string; requirements: string[] }[] = [];

  const sellerStateUpper = sellerState?.toUpperCase();
  const buyerStateUpper = buyerState?.toUpperCase();

  if (sellerStateUpper && STATE_DISCLOSURE_RULES[sellerStateUpper]) {
    const r = STATE_DISCLOSURE_RULES[sellerStateUpper];
    rules.push({ state: r.name, statute: r.statute, requirements: r.requirements });
  }

  if (
    buyerStateUpper &&
    buyerStateUpper !== sellerStateUpper &&
    STATE_DISCLOSURE_RULES[buyerStateUpper]
  ) {
    const r = STATE_DISCLOSURE_RULES[buyerStateUpper];
    rules.push({ state: r.name, statute: r.statute, requirements: r.requirements });
  }

  return rules;
}
