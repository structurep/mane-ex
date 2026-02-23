"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ReviewCard } from "@/components/review-card";

/* eslint-disable @typescript-eslint/no-explicit-any */
type ReviewData = {
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
  seller: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

const FILTERS = ["All", "Verified Only", "With Response"] as const;
type Filter = (typeof FILTERS)[number];

export function ReviewsFeed({ reviews }: { reviews: ReviewData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.title && r.title.toLowerCase().includes(q)) ||
          r.body.toLowerCase().includes(q)
      );
    }

    // Filter pills
    if (activeFilter === "Verified Only") {
      result = result.filter((r) => r.is_verified_purchase === true);
    } else if (activeFilter === "With Response") {
      result = result.filter((r) => typeof r.seller_response === "string");
    }

    // Sort
    if (sortBy === "highest") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      result.sort((a, b) => a.rating - b.rating);
    } else {
      // recent (default) — already ordered by created_at desc from the server,
      // but re-sort to be safe after filtering
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return result;
  }, [reviews, searchQuery, sortBy, activeFilter]);

  return (
    <section className="bg-paper-cream px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Search + Sort row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-paper-white py-2.5 pl-10 pr-4 text-sm text-ink-black placeholder:text-ink-light focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border bg-paper-white px-3 py-2.5 text-sm text-ink-black"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-ink-black text-white"
                  : "bg-paper-white text-ink-mid hover:bg-paper-warm"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="rounded-lg border border-border bg-paper-white py-12 text-center">
            <p className="text-ink-mid">No reviews match your filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}
