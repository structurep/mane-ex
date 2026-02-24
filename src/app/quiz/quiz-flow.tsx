"use client";

import { useState } from "react";
import { submitQuiz } from "@/actions/quiz";
import { QUIZ_QUESTIONS } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export function QuizFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    title: string;
    description: string;
    recommended_tier: string;
    emoji: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const isLastQuestion = step === totalQuestions - 1;
  const currentQuestion = QUIZ_QUESTIONS[step];
  const progress = result
    ? 100
    : ((step + (answers[currentQuestion?.id] ? 1 : 0)) / totalQuestions) * 100;

  function selectAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    if (!isLastQuestion) {
      setTimeout(() => setStep((s) => s + 1), 300);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    const formData = new FormData();
    for (const [key, value] of Object.entries(answers)) {
      formData.append(`q_${key}`, value);
    }
    formData.append("session_id", crypto.randomUUID());

    const res = await submitQuiz(formData);
    if (res.data) {
      setResult(res.data);
    }
    setLoading(false);
  }

  const tierPriceMap: Record<string, string> = {
    basic: "Free",
    standard: "$49/mo",
    premium: "$149/mo",
  };

  // ── Result Screen ──
  if (result) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <span className="text-6xl">{result.emoji}</span>
        </div>
        <h1 className="mb-3 text-3xl tracking-tight text-ink-black md:text-4xl">
          {result.title}
        </h1>
        <p className="text-lead mx-auto mb-10 max-w-lg text-ink-mid">
          {result.description}
        </p>

        <div className="mx-auto max-w-sm rounded-lg bg-paper-white p-8 shadow-lifted">
          <p className="overline mb-2 text-ink-light">RECOMMENDED PLAN</p>
          <p className="font-serif text-3xl font-bold capitalize text-ink-black">
            {result.recommended_tier}
          </p>
          <p className="mt-1 font-serif text-lg text-ink-mid">
            {tierPriceMap[result.recommended_tier] ?? "Free"}
          </p>
          <p className="mb-6 text-xs text-ink-light">Free during launch</p>
          <Button className="w-full gap-2" size="lg" asChild>
            <Link href={`/pricing?tier=${result.recommended_tier}`}>
              <Sparkles className="h-4 w-4" />
              Get Started
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-ink-light">
          <Link href="/pricing" className="underline hover:text-ink-black">
            Compare all plans
          </Link>
        </p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  // ── Quiz Flow ──
  return (
    <div>
      <div className="mb-8 text-center">
        <p className="overline mb-3 text-red">60-SECOND QUIZ</p>
        <h1 className="mb-2 text-3xl tracking-tight text-ink-black md:text-4xl">
          Find Your Perfect Plan
        </h1>
        <p className="text-ink-mid">
          Answer {totalQuestions} quick questions. We&apos;ll match you to the
          right tier.
        </p>
      </div>

      <Progress value={progress} className="mb-8" />

      <div className="rounded-lg bg-paper-white p-6 shadow-folded md:p-8">
        <p className="overline mb-1 text-ink-light">
          QUESTION {step + 1} OF {totalQuestions}
        </p>
        <h2 className="mb-6 text-xl text-ink-black md:text-2xl">
          {currentQuestion.question}
        </h2>

        <div className="stagger-children space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectAnswer(currentQuestion.id, option.value)}
              className={`animate-fade-up w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                answers[currentQuestion.id] === option.value
                  ? "bg-ink-black text-paper-white shadow-folded"
                  : "bg-paper-cream text-ink-mid shadow-flat hover:shadow-folded"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {isLastQuestion && answers[currentQuestion.id] ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="gap-1"
            >
              {loading ? "Calculating..." : "See My Result"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.min(totalQuestions - 1, s + 1))}
              disabled={!answers[currentQuestion.id]}
              className="gap-1"
            >
              Skip
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
