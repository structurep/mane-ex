import { Metadata } from "next";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
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
  // Supabase returns joined relations as arrays — normalize to single objects
  return (reviews || []).map((r) => ({
    ...r,
    reviewer: Array.isArray(r.reviewer) ? r.reviewer[0] ?? null : r.reviewer,
    seller: Array.isArray(r.seller) ? r.seller[0] ?? null : r.seller,
  }));
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  // Compute stats
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
        {/* Hero */}
        <section className="bg-paper-white px-4 pt-20 pb-12 md:px-8 md:pt-24 md:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="overline mb-3 text-red">COMMUNITY REVIEWS</p>
            <h1 className="mb-4 text-4xl font-bold text-ink-black md:text-5xl">
              Real experiences. Real people.
            </h1>
            <p className="text-lead text-ink-mid">
              Verified reviews from buyers and sellers across the ManeExchange
              community.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl font-bold text-ink-black">
                    {averageRating}
                  </p>
                  <Star className="h-5 w-5 fill-gold text-gold" />
                </div>
                <p className="text-xs text-ink-mid">Average Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-ink-black">
                  {totalReviews}
                </p>
                <p className="text-xs text-ink-mid">Total Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-ink-black">
                  {verifiedPercent}%
                </p>
                <p className="text-xs text-ink-mid">Verified Purchases</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews feed (client component) */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ReviewsFeed reviews={reviews as any} />

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
