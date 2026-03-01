export type QuizArchetype =
  | "casual_rider"
  | "weekend_warrior"
  | "pro_seller"
  | "barn_manager"
  | "elite_seller";

export type TierRecommendation = "basic" | "standard" | "premium";

export interface QuizResult {
  id: string;
  user_id: string | null;
  session_id: string | null;
  answers: Record<string, string>;
  archetype: QuizArchetype;
  recommended_tier: TierRecommendation;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    points: Record<QuizArchetype, number>;
  }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "barn_size",
    question: "How many horses are in your barn right now?",
    options: [
      {
        value: "just_looking",
        label: "Zero — I'm shopping!",
        points: { casual_rider: 3, weekend_warrior: 2, pro_seller: 0, barn_manager: 0, elite_seller: 0 },
      },
      {
        value: "few",
        label: "1-3 — my personal string",
        points: { casual_rider: 1, weekend_warrior: 3, pro_seller: 1, barn_manager: 0, elite_seller: 0 },
      },
      {
        value: "medium",
        label: "4-10 — I'm always trading",
        points: { casual_rider: 0, weekend_warrior: 0, pro_seller: 3, barn_manager: 2, elite_seller: 1 },
      },
      {
        value: "large",
        label: "10+ — it's a whole operation",
        points: { casual_rider: 0, weekend_warrior: 0, pro_seller: 1, barn_manager: 3, elite_seller: 3 },
      },
    ],
  },
  {
    id: "buying_frequency",
    question: "How often do you buy or sell a horse?",
    options: [
      {
        value: "rarely",
        label: "Once every few years — it's a big deal",
        points: { casual_rider: 3, weekend_warrior: 2, pro_seller: 0, barn_manager: 0, elite_seller: 0 },
      },
      {
        value: "yearly",
        label: "Once or twice a year",
        points: { casual_rider: 1, weekend_warrior: 3, pro_seller: 1, barn_manager: 0, elite_seller: 0 },
      },
      {
        value: "quarterly",
        label: "Every few months — always something moving",
        points: { casual_rider: 0, weekend_warrior: 0, pro_seller: 3, barn_manager: 2, elite_seller: 1 },
      },
      {
        value: "constantly",
        label: "Weekly — horses are my whole business",
        points: { casual_rider: 0, weekend_warrior: 0, pro_seller: 1, barn_manager: 2, elite_seller: 3 },
      },
    ],
  },
  {
    id: "pain_point",
    question: "What's the most annoying part of buying/selling horses?",
    options: [
      {
        value: "finding",
        label: "Finding the right horse takes forever",
        points: { casual_rider: 3, weekend_warrior: 3, pro_seller: 0, barn_manager: 0, elite_seller: 0 },
      },
      {
        value: "trust",
        label: "Not knowing if the seller is legit",
        points: { casual_rider: 2, weekend_warrior: 2, pro_seller: 1, barn_manager: 1, elite_seller: 0 },
      },
      {
        value: "payment",
        label: "The money part — wire transfers stress me out",
        points: { casual_rider: 1, weekend_warrior: 1, pro_seller: 2, barn_manager: 2, elite_seller: 1 },
      },
      {
        value: "scale",
        label: "Managing listings across multiple platforms",
        points: { casual_rider: 0, weekend_warrior: 0, pro_seller: 2, barn_manager: 3, elite_seller: 3 },
      },
    ],
  },
  {
    id: "budget",
    question: "What's your typical horse budget?",
    options: [
      {
        value: "entry",
        label: "Under $15K — quality without breaking the bank",
        points: { casual_rider: 3, weekend_warrior: 2, pro_seller: 0, barn_manager: 0, elite_seller: 0 },
      },
      {
        value: "mid",
        label: "$15K-$50K — solid show horses",
        points: { casual_rider: 0, weekend_warrior: 3, pro_seller: 2, barn_manager: 1, elite_seller: 0 },
      },
      {
        value: "upper",
        label: "$50K-$150K — competitive athletes",
        points: { casual_rider: 0, weekend_warrior: 0, pro_seller: 3, barn_manager: 2, elite_seller: 2 },
      },
      {
        value: "premium",
        label: "$150K+ — top of the sport",
        points: { casual_rider: 0, weekend_warrior: 0, pro_seller: 1, barn_manager: 2, elite_seller: 3 },
      },
    ],
  },
  {
    id: "feature_priority",
    question: "Which feature would make your life easiest?",
    options: [
      {
        value: "dream_barn",
        label: "Saving favorites and getting alerts",
        points: { casual_rider: 3, weekend_warrior: 3, pro_seller: 0, barn_manager: 0, elite_seller: 0 },
      },
      {
        value: "escrow",
        label: "Secure escrow — no more sketchy wire transfers",
        points: { casual_rider: 1, weekend_warrior: 2, pro_seller: 3, barn_manager: 2, elite_seller: 1 },
      },
      {
        value: "analytics",
        label: "Analytics to see who's viewing my listings",
        points: { casual_rider: 0, weekend_warrior: 0, pro_seller: 2, barn_manager: 3, elite_seller: 2 },
      },
      {
        value: "branding",
        label: "A branded barn page and featured placement",
        points: { casual_rider: 0, weekend_warrior: 0, pro_seller: 1, barn_manager: 2, elite_seller: 3 },
      },
    ],
  },
];

export const ARCHETYPE_INFO: Record<
  QuizArchetype,
  {
    title: string;
    description: string;
    recommended_tier: TierRecommendation;
    emoji: string;
  }
> = {
  casual_rider: {
    title: "The Casual Rider",
    description:
      "You're shopping for the right partner — not running a business. Our free Starter plan gives you everything you need to find your next horse.",
    recommended_tier: "basic",
    emoji: "🐴",
  },
  weekend_warrior: {
    title: "The Weekend Warrior",
    description:
      "You take your riding seriously and want quality options. Pro gives you priority search and more listings to browse.",
    recommended_tier: "standard",
    emoji: "🏇",
  },
  pro_seller: {
    title: "The Pro Seller",
    description:
      "You buy and sell regularly. You need escrow, ISO matching, and analytics to run your operation smoothly.",
    recommended_tier: "standard",
    emoji: "💼",
  },
  barn_manager: {
    title: "The Barn Manager",
    description:
      "You're managing an inventory. Elite gives you unlimited listings, a branded barn page, and featured placement.",
    recommended_tier: "premium",
    emoji: "🏠",
  },
  elite_seller: {
    title: "The Elite Seller",
    description:
      "Top of the sport. You need every tool we offer — unlimited everything, premium branding, and dedicated support.",
    recommended_tier: "premium",
    emoji: "🏆",
  },
};

/**
 * Score quiz answers and determine archetype.
 */
export function scoreQuiz(
  answers: Record<string, string>
): { archetype: QuizArchetype; scores: Record<QuizArchetype, number> } {
  const scores: Record<QuizArchetype, number> = {
    casual_rider: 0,
    weekend_warrior: 0,
    pro_seller: 0,
    barn_manager: 0,
    elite_seller: 0,
  };

  for (const question of QUIZ_QUESTIONS) {
    const answer = answers[question.id];
    if (!answer) continue;

    const option = question.options.find((o) => o.value === answer);
    if (!option) continue;

    for (const [archetype, points] of Object.entries(option.points)) {
      scores[archetype as QuizArchetype] += points;
    }
  }

  const archetype = (Object.entries(scores) as [QuizArchetype, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  return { archetype, scores };
}
