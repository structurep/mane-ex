import { z } from "zod";

export const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.string()).refine(
    (answers) => Object.keys(answers).length >= 3,
    "Please answer at least 3 questions"
  ),
  session_id: z.string().optional(),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
