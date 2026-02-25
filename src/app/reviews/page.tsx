import { Metadata } from "next";
import { Star, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReviewsFeed } from "./reviews-feed";

export const metadata: Metadata = {
  title: "Community Reviews",
  description:
    "Read verified reviews from buyers and sellers on ManeExchange. Real experiences from the equestrian community.",
};

async function getReviews() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      id, rating, title, body, stage, is_verified_purchase,
      seller_response, seller_responded_at, created_at,
      reviewer:reviewer_id(display_name, avatar_url, city, state),
      seller:seller_id(display_name, avatar_url)
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);
  return (reviews || []).map((r) => ({
    ...r,
    reviewer: Array.isArray(r.reviewer) ? r.reviewer[0] ?? null : r.reviewer,
    seller: Array.isArray(r.seller) ? r.seller[0] ?? null : r.seller,
  }));
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalReviews
        ).toFixed(1)
      : "0.0";
  const verifiedCount = reviews.filter(
    (r) => r.is_verified_purchase === true
  ).length;
  const verifiedPercent =
    totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-20 md:px-8 md:pt-36 md:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="overline mb-4 text-gold">COMMUNITY REVIEWS</p>
            <h1 className="mb-6 text-4xl tracking-tight text-ink-black md:text-6xl">
              Real experiences. Real people.
            </h1>
            <p className="text-lead text-ink-mid">
              Verified reviews from buyers and sellers across the ManeExchange
              community.
            </p>

            {/* Stats */}
            <div className="stagger-children mt-10 flex flex-wrap items-center justify-center gap-10">
              <div className="animate-fade-up text-center">
                <div className="flex items-center justify-center gap-1">
                  <p className="font-serif text-4xl font-bold text-ink-black">
                    {averageRating}
                  </p>
                  <Star className="h-6 w-6 fill-gold text-gold" />
                </div>
                <p className="mt-1 text-sm text-ink-mid">Average Rating</p>
              </div>
              <div className="animate-fade-up text-center">
                <p className="font-serif text-4xl font-bold text-ink-black">
                  {totalReviews}
                </p>
                <p className="mt-1 text-sm text-ink-mid">Total Reviews</p>
              </div>
              <div className="animate-fade-up text-center">
                <p className="font-serif text-4xl font-bold text-forest">
                  {verifiedPercent}%
                </p>
                <p className="mt-1 text-sm text-ink-mid">Verified Purchases</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews feed (client component) */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ReviewsFeed reviews={reviews as any} />

        {/* ── CTA ── */}
        <section className="bg-paddock section-premium">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="mb-4 font-serif text-3xl text-paper-white md:text-4xl">
              Join a community that values trust.
            </h2>
            <p className="text-lead mx-auto mb-8 max-w-xl text-ink-light">
              Every transaction on ManeExchange is built on transparency,
              verification, and real accountability.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                asChild
              >
                <Link href="/signup">
                  Get Started — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="!bg-transparent border-crease-dark text-paper-cream hover:!bg-ink-dark"
                asChild
              >
                <Link href="/browse">View Current Offerings</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
