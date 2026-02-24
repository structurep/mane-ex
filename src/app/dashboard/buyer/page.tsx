import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Search,
  HandCoins,
  ShoppingBag,
  Sparkles,
  Eye,
  MessageCircle,
  Star,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";
import { SavedSearchesWidget } from "../saved-searches";

export const metadata: Metadata = {
  title: "Buyer Portal",
};

/* ------------------------------------------------------------------ */
/*  Sample data (to be replaced with Supabase queries in production)  */
/* ------------------------------------------------------------------ */

const quickStats = [
  {
    label: "Saved Horses",
    value: 14,
    icon: Heart,
    href: "/dashboard/dream-barn",
  },
  {
    label: "Active Searches",
    value: 3,
    icon: Search,
    href: "/browse",
  },
  {
    label: "Pending Offers",
    value: 2,
    icon: HandCoins,
    href: "/dashboard/offers",
  },
  {
    label: "Purchases",
    value: 1,
    icon: ShoppingBag,
  },
];

const aiMatches = [
  {
    id: "m1",
    name: "Monarch's Legacy",
    breed: "Hanoverian",
    price: 62_000,
    matchPct: 96,
    reason: "Matches your dressage level and height preference",
    slug: "monarchs-legacy",
  },
  {
    id: "m2",
    name: "Coastal Breeze",
    breed: "Thoroughbred",
    price: 38_500,
    matchPct: 91,
    reason: "Strong eventing record within your budget",
    slug: "coastal-breeze",
  },
  {
    id: "m3",
    name: "Fireside Gold",
    breed: "Oldenburg",
    price: 54_000,
    matchPct: 88,
    reason: "Young prospect with preferred bloodlines",
    slug: "fireside-gold",
  },
  {
    id: "m4",
    name: "Sapphire Blue",
    breed: "Dutch Warmblood",
    price: 71_000,
    matchPct: 85,
    reason: "Trainer-recommended for your goals",
    slug: "sapphire-blue",
  },
];

const recentActivity = [
  {
    id: "a1",
    action: "Viewed listing",
    detail: "Monarch's Legacy",
    icon: Eye,
    time: "12 minutes ago",
  },
  {
    id: "a2",
    action: "Saved horse",
    detail: "Coastal Breeze added to Dream Barn",
    icon: Heart,
    time: "2 hours ago",
  },
  {
    id: "a3",
    action: "Sent message",
    detail: "Conversation with Ridgewood Farm",
    icon: MessageCircle,
    time: "5 hours ago",
  },
  {
    id: "a4",
    action: "Made offer",
    detail: "$38,500 on Coastal Breeze",
    icon: HandCoins,
    time: "1 day ago",
  },
  {
    id: "a5",
    action: "Left review",
    detail: "5 stars for Clearwater Equestrian",
    icon: Star,
    time: "3 days ago",
  },
];

const connectedTrainers = [
  {
    id: "t1",
    name: "Sarah Mitchell",
    initials: "SM",
    searches: 2,
  },
  {
    id: "t2",
    name: "David Ortega",
    initials: "DO",
    searches: 1,
  },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function BuyerPortalPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">Buyer Portal</h1>
        <p className="mt-1 text-sm text-ink-mid">
          Your personalized horse-finding hub
        </p>
      </div>

      {/* Quick Stats */}
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

      {/* AI Matches */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold text-ink-black">
              Your Top Matches
            </h2>
          </div>
          <Link
            href="/browse"
            className="text-sm text-blue hover:underline"
          >
            Browse all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aiMatches.map((horse) => (
            <Link
              key={horse.id}
              href={`/horses/${horse.slug}`}
              className="group rounded-lg border-0 bg-paper-cream shadow-flat transition-elevation hover-lift hover:shadow-lifted"
            >
              {/* Image placeholder */}
              <div className="relative aspect-[4/3] rounded-t-lg bg-paper-warm">
                <Badge
                  className="absolute right-2 top-2 bg-forest text-white"
                >
                  {horse.matchPct}% match
                </Badge>
              </div>
              <div className="p-3">
                <p className="font-medium text-ink-black group-hover:text-ink-dark">
                  {horse.name}
                </p>
                <p className="text-xs text-ink-mid">{horse.breed}</p>
                <p className="mt-1 font-serif text-sm font-semibold text-ink-black">
                  ${horse.price.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-ink-light leading-snug">
                  {horse.reason}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-black">
          Recent Activity
        </h2>
        <div className="rounded-lg border-0 bg-paper-cream shadow-flat">
          <div className="divide-y divide-crease-light">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-warm">
                    <Icon className="h-3.5 w-3.5 text-ink-mid" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-dark">
                      {item.action}
                    </p>
                    <p className="text-xs text-ink-mid">{item.detail}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 pt-0.5">
                    <Clock className="h-3 w-3 text-ink-faint" />
                    <span className="text-xs text-ink-light">{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Connected Trainers */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-ink-light" />
          <h2 className="text-lg font-semibold text-ink-black">
            Connected Trainers
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {connectedTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="flex items-center gap-3 rounded-lg border-0 bg-paper-cream p-4 shadow-flat"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-warm text-sm font-semibold text-ink-mid">
                {trainer.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-dark">
                  {trainer.name}
                </p>
                <p className="text-xs text-ink-light">
                  Working with you on {trainer.searches}{" "}
                  {trainer.searches === 1 ? "search" : "searches"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Searches */}
      <SavedSearchesWidget />
    </div>
  );
}
