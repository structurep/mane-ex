import { Eye, Heart, Clock } from "lucide-react";

interface SocialProofProps {
  viewCount: number;
  favoriteCount: number;
  updatedAt: string;
  variant?: "compact" | "full";
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1)}k`;
}

export function SocialProof({
  viewCount,
  favoriteCount,
  updatedAt,
  variant = "compact",
}: SocialProofProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 text-xs text-ink-light">
        {viewCount > 0 && (
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatCount(viewCount)}
          </span>
        )}
        {favoriteCount > 0 && (
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {formatCount(favoriteCount)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo(updatedAt)}
        </span>
      </div>
    );
  }

  // Full variant — used on listing detail page
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-ink-mid">
      {viewCount > 0 && (
        <span className="flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          <strong className="font-medium text-ink-black">{formatCount(viewCount)}</strong>
          {viewCount === 1 ? "view" : "views"}
        </span>
      )}
      {favoriteCount > 0 && (
        <span className="flex items-center gap-1.5">
          <Heart className="h-4 w-4" />
          <strong className="font-medium text-ink-black">{formatCount(favoriteCount)}</strong>
          {favoriteCount === 1 ? "buyer saved this" : "buyers saved this"}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        Updated {timeAgo(updatedAt)}
      </span>
    </div>
  );
}
