import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Browse by Discipline",
  description:
    "Find your next horse by discipline — Hunter/Jumper, Dressage, Eventing, Western, Trail, and Breeding stock on ManeExchange.",
};

const disciplines = [
  {
    slug: "hunter-jumper",
    name: "Hunter/Jumper",
    tagline: "Find your next partner over fences.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "dressage",
    name: "Dressage",
    tagline: "Harmony in motion.",
    image:
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "eventing",
    name: "Eventing",
    tagline: "The ultimate all-around athlete.",
    image:
      "https://images.unsplash.com/photo-1508335885186-b279e0274f4c?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "western",
    name: "Western",
    tagline: "Bred for the ride.",
    image:
      "https://images.unsplash.com/photo-1496185106368-308ed96f204b?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "trail",
    name: "Trail & Pleasure",
    tagline: "Your next adventure starts in the saddle.",
    image:
      "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80&auto=format&fit=crop",
  },
  {
    slug: "breeding",
    name: "Breeding Stock",
    tagline: "The foundation of your program.",
    image:
      "https://images.unsplash.com/photo-1550421079-68e3cf0b0e5c?w=800&q=80&auto=format&fit=crop",
  },
];

export default function DisciplinesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h1 className="font-serif text-3xl text-ink-black md:text-4xl">
              Browse by Discipline
            </h1>
            <p className="mt-2 max-w-xl text-ink-mid">
              Every discipline has its own world. Find horses matched to yours
              — with listings, tips, and community curated for how you ride.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {disciplines.map((disc) => (
              <Link
                key={disc.slug}
                href={`/disciplines/${disc.slug}`}
                className="group relative overflow-hidden rounded-xl shadow-flat transition-all duration-300 hover:shadow-lifted"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    src={disc.image}
                    alt={disc.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-ink-black/30 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h2 className="font-serif text-xl font-bold text-white">
                    {disc.name}
                  </h2>
                  <p className="mt-1 text-sm text-white/70">{disc.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-white/90 transition-colors group-hover:text-primary">
                    Explore
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomCTA />
      <Footer />
    </div>
  );
}
