import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Heart,
  Search,
  HandCoins,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  FileText,
  Users,
} from "lucide-react";
import { SavedSearchesWidget } from "../saved-searches";
import { EmptyState } from "@/components/tailwind-plus";

export const metadata: Metadata = {
  title: "Buyer Portal",
};

export default async function BuyerPortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch real stats in parallel
  const [favoritesRes, savedSearchesRes, pendingOffersRes, completedOffersRes] =
    await Promise.all([
      supabase
        .from("listing_favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("saved_searches")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("offers")
        .select("id", { count: "exact", head: true })
        .eq("buyer_id", user.id)
        .in("status", ["pending", "countered"]),
      supabase
        .from("offers")
        .select("id", { count: "exact", head: true })
        .eq("buyer_id", user.id)
        .eq("status", "completed"),
    ]);

  const quickStats = [
    {
      label: "Saved Horses",
      value: favoritesRes.count ?? 0,
      icon: Heart,
      href: "/dashboard/dream-barn",
    },
    {
      label: "Saved Searches",
      value: savedSearchesRes.count ?? 0,
      icon: Search,
      href: "/browse",
    },
    {
      label: "Pending Offers",
      value: pendingOffersRes.count ?? 0,
      icon: HandCoins,
      href: "/dashboard/offers",
    },
    {
      label: "Completed",
      value: completedOffersRes.count ?? 0,
      icon: ShoppingBag,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Buyer Portal
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Your personalized horse-finding hub
        </p>
      </div>

      {/* Quick Stats — real data */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <>
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-ink-light" />
                {stat.href && (
                  <ArrowRight className="h-3 w-3 text-ink-faint" />
                )}
              </div>
              <p className="mt-3 font-serif text-2xl font-bold text-ink-black">
                {stat.value.toLocaleString()}
              </p>
              <p className="mt-0.5 text-xs text-ink-mid">{stat.label}</p>
            </>
          );
          const className =
            "rounded-lg border-0 bg-paper-cream p-4 shadow-flat transition-elevation hover-lift hover:shadow-lifted";
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={stat.label} className={className}>
              {content}
            </div>
          );
        })}
      </div>

      {/* ManeMatch — coming soon */}
      <section className="mb-8">
        <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream">
          <EmptyState
            icon={<Sparkles className="size-10" />}
            title="ManeMatch"
            description="AI-powered horse matching based on your preferences and browsing history. Coming soon."
          />
        </div>
      </section>

      {/* Saved Searches — real data */}
      <SavedSearchesWidget />
    </div>
  );
}
