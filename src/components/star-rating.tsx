"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const sizeClass = SIZES[size];

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={`${readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={`${sizeClass} ${
                filled
                  ? "fill-gold text-gold"
                  : "fill-none text-crease-mid"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
