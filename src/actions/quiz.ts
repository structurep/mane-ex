"use server";

import { createClient } from "@/lib/supabase/server";
import { submitQuizSchema } from "@/lib/validators/quiz";
import { scoreQuiz, ARCHETYPE_INFO } from "@/types/quiz";

export type QuizActionState = {
  error?: string;
  data?: {
    archetype: string;
    title: string;
    description: string;
    recommended_tier: string;
    emoji: string;
  };
};

export async function submitQuiz(
  formData: FormData
): Promise<QuizActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Parse answers from form data
  const answers: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key.startsWith("q_")) {
      answers[key.replace("q_", "")] = value as string;
    }
  });

  const sessionId = formData.get("session_id") as string | null;

  const parsed = submitQuizSchema.safeParse({
    answers,
    session_id: sessionId ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { archetype } = scoreQuiz(parsed.data.answers);
  const info = ARCHETYPE_INFO[archetype];

  // Save result
  await supabase.from("quiz_results").insert({
    user_id: user?.id ?? null,
    session_id: parsed.data.session_id ?? null,
    answers: parsed.data.answers,
    archetype,
    recommended_tier: info.recommended_tier,
  });

  return {
    data: {
      archetype,
      title: info.title,
      description: info.description,
      recommended_tier: info.recommended_tier,
      emoji: info.emoji,
    },
  };
}
