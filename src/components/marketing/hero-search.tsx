"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";

const disciplines = [
  { label: "Hunter/Jumper", value: "hunter-jumper" },
  { label: "Dressage", value: "dressage" },
  { label: "Eventing", value: "eventing" },
  { label: "Western", value: "western" },
  { label: "Young Horses", value: "young-horses" },
];

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : "/browse");
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <label htmlFor="hero-search" className="sr-only">Search horses by breed, discipline, or location</label>
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mid" />
          <input
            id="hero-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by breed, discipline, location..."
            className="w-full rounded-xl bg-white/95 py-4 pl-13 pr-6 text-lg text-ink shadow-lifted backdrop-blur-sm placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {disciplines.map((d) => (
          <Link
            key={d.value}
            href={`/browse?discipline=${d.value}`}
            className="rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            {d.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
