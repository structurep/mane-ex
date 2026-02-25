import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trainer Directory",
  description:
    "Find verified trainers and dealers on ManeExchange. Browse by discipline, location, and ratings.",
};

// Static sample data until trainer-specific DB columns exist
const sampleTrainers = [
  {
    id: "1",
    name: "Sarah Mitchell",
    location: "Wellington, FL",
    disciplines: ["Hunter/Jumper", "Equitation"],
    rating: 4.9,
    reviewCount: 47,
    horseCount: 12,
    verified: true,
    bio: "25+ years training hunters and jumpers in the Wellington circuit.",
  },
  {
    id: "2",
    name: "James Rodriguez",
    location: "Ocala, FL",
    disciplines: ["Dressage", "Eventing"],
    rating: 4.8,
    reviewCount: 31,
    horseCount: 8,
    verified: true,
    bio: "USDF Gold Medalist. Specializing in dressage from Training through Grand Prix.",
  },
  {
    id: "3",
    name: "Emily Chen",
    location: "Aiken, SC",
    disciplines: ["Eventing"],
    rating: 4.7,
    reviewCount: 23,
    horseCount: 5,
    verified: false,
    bio: "Event rider and trainer focused on developing young horses and riders.",
  },
  {
    id: "4",
    name: "Michael Thompson",
    location: "Lexington, KY",
    disciplines: ["Hunter/Jumper"],
    rating: 4.9,
    reviewCount: 62,
    horseCount: 15,
    verified: true,
    bio: "USEF-rated judge and A-circuit trainer with 30+ years of experience.",
  },
  {
    id: "5",
    name: "Ashley Davis",
    location: "Middleburg, VA",
    disciplines: ["Hunter/Jumper", "Equitation"],
    rating: 4.6,
    reviewCount: 18,
    horseCount: 6,
    verified: true,
    bio: "Boutique program specializing in junior/amateur hunters and equitation.",
  },
  {
    id: "6",
    name: "Robert Williams",
    location: "Tampa, FL",
    disciplines: ["Western", "Reining"],
    rating: 4.8,
    reviewCount: 35,
    horseCount: 10,
    verified: true,
    bio: "NRHA trainer. Multiple futurity champion with a focus on reining and western performance.",
  },
];

export default function TrainerDirectoryPage() {
  const trainers = sampleTrainers;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
        <div className="mx-auto max-w-[1200px]">
          <p className="overline mb-3 text-gold">TRAINER DIRECTORY</p>
          <h1 className="mb-4 text-4xl tracking-tight text-ink-black md:text-5xl">
            Find the right trainer.
          </h1>
          <p className="text-lead max-w-xl text-ink-mid">
            Browse verified trainers and dealers by discipline, location, and
            track record.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-paper-cream section-premium">
        <div className="mx-auto max-w-[1200px]">
          <p className="mb-6 text-sm text-ink-mid">
            {trainers.length} trainers
          </p>

          {/* Trainer grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trainers.map((trainer) => (
              <Link
                key={trainer.id}
                href={`/trainers/${trainer.id}`}
                className="group rounded-lg border-0 bg-paper-white p-6 shadow-flat transition-elevation hover-lift hover:shadow-lifted"
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-full bg-paper-warm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-ink-black group-hover:text-primary">
                        {trainer.name}
                      </h3>
                      {trainer.verified && (
                        <Shield className="h-4 w-4 text-forest" />
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-mid">
                      <MapPin className="h-3.5 w-3.5" />
                      {trainer.location}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {trainer.disciplines.map((d) => (
                    <Badge key={d} variant="secondary" className="text-xs">
                      {d}
                    </Badge>
                  ))}
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-ink-mid">
                  {trainer.bio}
                </p>

                <div className="mt-4 flex items-center gap-4 text-sm text-ink-mid">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-gold" />
                    {trainer.rating}
                  </span>
                  <span>{trainer.reviewCount} reviews</span>
                  <span>{trainer.horseCount} horses</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA />

      <Footer />
    </div>
  );
}
