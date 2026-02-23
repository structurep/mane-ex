import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { QuizFlow } from "./quiz-flow";

export const metadata: Metadata = {
  title: "Find Your Plan — ManeExchange",
  description:
    "Take our 60-second quiz to find the perfect ManeExchange plan for your equestrian needs.",
};

export default function QuizPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl">
          <QuizFlow />
        </div>
      </main>
      <Footer />
    </div>
  );
}
