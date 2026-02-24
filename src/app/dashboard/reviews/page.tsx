import { getMyReviews } from "@/actions/reviews";
import { Card } from "@/components/ui/card";
import { ReviewCard } from "@/components/review-card";
import { StarRating } from "@/components/star-rating";
import { Star, MessageSquare } from "lucide-react";
import { RespondForm } from "./respond-form";

export default async function DashboardReviewsPage() {
  const { data: reviews } = await getMyReviews();
  const allReviews = (reviews ?? []) as Array<{
    id: string;
    rating: number;
    title: string | null;
    body: string;
    stage: string;
    is_verified_purchase: boolean;
    seller_response: string | null;
    seller_responded_at: string | null;
    created_at: string;
    reviewer: {
      display_name: string | null;
      avatar_url: string | null;
      city: string | null;
      state: string | null;
    } | null;
    listing: { id: string; name: string; slug: string } | null;
  }>;

  const totalReviews = allReviews.length;
  const avgRating =
    totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allReviews.filter((r) => r.rating === star).length,
    pct:
      totalReviews > 0
        ? (allReviews.filter((r) => r.rating === star).length / totalReviews) *
          100
        : 0,
  }));

  const unanswered = allReviews.filter((r) => !r.seller_response);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
          Reviews
        </h1>
        <p className="mt-1 text-ink-mid">
          Reviews from buyers about your listings and service.
        </p>
      </div>

      {totalReviews === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-0 p-12 text-center shadow-flat">
          <Star className="h-10 w-10 text-ink-faint" />
          <div>
            <p className="font-medium text-ink-black">No reviews yet</p>
            <p className="mt-1 text-sm text-ink-mid">
              Reviews will appear here as buyers interact with your listings.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-0 p-4 text-center shadow-flat">
              <p className="font-serif text-3xl font-bold text-ink-black">
                {avgRating.toFixed(1)}
              </p>
              <div className="mt-1 flex justify-center">
                <StarRating value={Math.round(avgRating)} readonly size="sm" />
              </div>
              <p className="mt-1 text-xs text-ink-light">Average Rating</p>
            </Card>
            <Card className="border-0 p-4 text-center shadow-flat">
              <p className="font-serif text-3xl font-bold text-ink-black">{totalReviews}</p>
              <p className="mt-1 text-xs text-ink-light">Total Reviews</p>
            </Card>
            <Card className="border-0 p-4 text-center shadow-flat">
              <p className="font-serif text-3xl font-bold text-ink-black">
                {unanswered.length}
              </p>
              <p className="mt-1 text-xs text-ink-light">Awaiting Response</p>
            </Card>
          </div>

          {/* Distribution */}
          <Card className="border-0 p-4 shadow-flat">
            <p className="overline mb-3 text-ink-light">RATING DISTRIBUTION</p>
            <div className="space-y-2">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <span className="w-8 text-right text-sm font-medium text-ink-mid">
                    {d.star}★
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-cream">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-ink-light">{d.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Review list */}
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold text-ink-black">
              All Reviews
            </h2>
            {allReviews.map((review) => (
              <div key={review.id} className="space-y-2">
                <ReviewCard review={review} />
                {!review.seller_response && (
                  <RespondForm reviewId={review.id} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
