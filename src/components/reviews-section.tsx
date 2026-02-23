import { getSellerReviews } from "@/actions/reviews";
import { ReviewCard } from "@/components/review-card";
import { StarRating } from "@/components/star-rating";
import { Separator } from "@/components/ui/separator";

interface ReviewsSectionProps {
  sellerId: string;
  maxReviews?: number;
}

export async function ReviewsSection({
  sellerId,
  maxReviews = 5,
}: ReviewsSectionProps) {
  const { data: reviews } = await getSellerReviews(sellerId);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const avgRating =
    reviews.reduce(
      (sum: number, r: { rating: number }) => sum + r.rating,
      0
    ) / reviews.length;

  const displayedReviews = reviews.slice(0, maxReviews);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="font-heading text-lg font-semibold text-ink-black">
          Reviews
        </h3>
        <div className="flex items-center gap-2">
          <StarRating value={Math.round(avgRating)} readonly size="sm" />
          <span className="text-sm font-medium text-ink-black">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-sm text-ink-light">
            ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {displayedReviews.map(
          (review: {
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
          }) => <ReviewCard key={review.id} review={review} />
        )}
      </div>

      {reviews.length > maxReviews && (
        <p className="text-sm text-ink-mid">
          Showing {maxReviews} of {reviews.length} reviews
        </p>
      )}
    </div>
  );
}
