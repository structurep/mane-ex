import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { CheckCircle2, MessageSquare } from "lucide-react";

interface ReviewCardProps {
  review: {
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
  };
}

const STAGE_CONFIG: Record<string, { label: string; className: string }> = {
  inquiry: { label: "After Inquiry", className: "bg-ink-light/10 text-ink-mid" },
  trial: { label: "After Trial", className: "bg-gold/10 text-gold" },
  offer: { label: "After Offer", className: "bg-accent-blue/10 text-accent-blue" },
  completion: { label: "After Purchase", className: "bg-forest/10 text-forest" },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const days = Math.floor(diff / 86400000);

  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const reviewer = review.reviewer;
  const stageConfig = STAGE_CONFIG[review.stage] ?? STAGE_CONFIG.inquiry;

  return (
    <div className="space-y-3 rounded-lg border border-crease-light p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-cream text-sm font-medium text-ink-mid">
            {reviewer?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-ink-black">
                {reviewer?.display_name ?? "Anonymous"}
              </span>
              {review.is_verified_purchase && (
                <Badge variant="secondary" className="gap-1 bg-forest/10 text-forest text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Purchase
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-light">
              {reviewer?.city && reviewer?.state && (
                <span>
                  {reviewer.city}, {reviewer.state}
                </span>
              )}
              <span>{timeAgo(review.created_at)}</span>
            </div>
          </div>
        </div>
        <Badge className={stageConfig.className} variant="secondary">
          {stageConfig.label}
        </Badge>
      </div>

      {/* Rating + content */}
      <div className="space-y-2">
        <StarRating value={review.rating} readonly size="sm" />
        {typeof review.title === "string" && (
          <p className="font-medium text-ink-black">{review.title}</p>
        )}
        <p className="text-sm leading-relaxed text-ink-dark">{review.body}</p>
      </div>

      {/* Seller response */}
      {typeof review.seller_response === "string" && (
        <div className="ml-4 rounded-md border-l-2 border-crease-mid bg-paper-cream p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-ink-mid">
            <MessageSquare className="h-3 w-3" />
            Seller Response
          </div>
          <p className="text-sm text-ink-dark">{review.seller_response}</p>
        </div>
      )}
    </div>
  );
}
