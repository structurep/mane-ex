import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Shield,
  Star,
  MessageCircle,
  ChevronRight,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";

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
    bio: "25+ years training hunters and jumpers in the Wellington circuit. Sarah has developed numerous champion hunters and helped riders at every level from short stirrup to the grand prix ring. Her program emphasizes classical horsemanship, strong flatwork fundamentals, and a methodical approach to developing both horse and rider partnerships.",
    memberSince: "January 2024",
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
    bio: "USDF Gold Medalist. Specializing in dressage from Training through Grand Prix. James brings over two decades of international experience to his Ocala-based program. He works with imported European warmbloods and American-bred sport horses, offering training, sales, and clinics throughout the Southeast.",
    memberSince: "March 2024",
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
    bio: "Event rider and trainer focused on developing young horses and riders. Emily's program in Aiken specializes in bringing young Thoroughbreds and sport horses through the levels, with a focus on building confident, well-rounded partnerships. She also works with off-track Thoroughbreds transitioning to second careers in eventing.",
    memberSince: "June 2024",
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
    bio: "USEF-rated judge and A-circuit trainer with 30+ years of experience. Michael's Lexington facility is a full-service hunter/jumper operation offering training, sales, and showing. His horses consistently compete at top-rated shows including WEF, Devon, and the National Horse Show.",
    memberSince: "February 2024",
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
    bio: "Boutique program specializing in junior/amateur hunters and equitation. Ashley's small, personalized program in the heart of Virginia horse country focuses on developing strong, confident riders. Her students consistently qualify for Medal and Maclay finals.",
    memberSince: "August 2024",
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
    bio: "NRHA trainer. Multiple futurity champion with a focus on reining and western performance. Robert has earned over $500,000 in NRHA lifetime earnings and trains horses from weanling through open competition. His program offers sales, training, and breeding services for reining and western performance horses.",
    memberSince: "April 2024",
  },
];

// Sample horses for the detail page
const sampleHorses = [
  {
    id: "h1",
    name: "Callaway's Best",
    breed: "Warmblood",
    price: 8500000,
    state: "FL",
  },
  {
    id: "h2",
    name: "Sterling Silver",
    breed: "Holsteiner",
    price: 6500000,
    state: "FL",
  },
  {
    id: "h3",
    name: "Night Watch",
    breed: "Hanoverian",
    price: 4500000,
    state: "FL",
  },
];

type Props = {
  params: Promise<{ id: string }>;
};

function getTrainer(id: string) {
  return sampleTrainers.find((t) => t.id === id) || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const trainer = getTrainer(id);

  if (!trainer) {
    return { title: "Trainer Not Found" };
  }

  return {
    title: `${trainer.name} — ManeExchange Trainer`,
    description: `${trainer.name} — ${trainer.disciplines.join(", ")} trainer in ${trainer.location}. ${trainer.horseCount} horses, ${trainer.reviewCount} reviews.`,
  };
}

export default async function TrainerProfilePage({ params }: Props) {
  const { id } = await params;
  const trainer = getTrainer(id);

  if (!trainer) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1 text-sm text-ink-light">
            <Link href="/browse" className="hover:text-ink-black">
              Browse
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/trainers" className="hover:text-ink-black">
              Trainers
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink-mid">{trainer.name}</span>
          </nav>

          {/* Profile header */}
          <section className="mb-8">
            <div className="flex items-start gap-5">
              {/* Avatar placeholder */}
              <div className="h-20 w-20 flex-shrink-0 rounded-full bg-paper-warm" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-3xl font-bold text-ink-black">
                    {trainer.name}
                  </h1>
                  {trainer.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="mr-1 h-3 w-3 text-forest" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-mid">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {trainer.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Member since {trainer.memberSince}
                  </span>
                </div>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(trainer.rating)
                            ? "fill-gold text-gold"
                            : "text-ink-light"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-ink-black">
                    {trainer.rating}
                  </span>
                  <span className="text-sm text-ink-mid">
                    ({trainer.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Stats row */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-paper-cream p-4 text-center shadow-flat">
              <p className="text-2xl font-bold text-ink-black">
                {trainer.horseCount}
              </p>
              <p className="mt-1 text-xs text-ink-mid">Horses</p>
            </div>
            <div className="rounded-lg border border-border bg-paper-cream p-4 text-center shadow-flat">
              <p className="text-2xl font-bold text-ink-black">
                {trainer.reviewCount}
              </p>
              <p className="mt-1 text-xs text-ink-mid">Reviews</p>
            </div>
            <div className="rounded-lg border border-border bg-paper-cream p-4 text-center shadow-flat">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <p className="text-2xl font-bold text-ink-black">
                  {trainer.rating}
                </p>
              </div>
              <p className="mt-1 text-xs text-ink-mid">Rating</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* About */}
          <section className="mb-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-ink-black">
              About
            </h2>
            <p className="whitespace-pre-line text-ink-mid">{trainer.bio}</p>
          </section>

          {/* Disciplines */}
          <section className="mb-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-ink-black">
              Disciplines
            </h2>
            <div className="flex flex-wrap gap-2">
              {trainer.disciplines.map((d) => (
                <Badge key={d} variant="secondary">
                  {d}
                </Badge>
              ))}
            </div>
          </section>

          <Separator className="my-6" />

          {/* Current Horses */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-ink-black">
                Current Horses
              </h2>
              <p className="text-sm text-ink-light">
                {sampleHorses.length} listing
                {sampleHorses.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sampleHorses.map((horse) => {
                const priceStr = horse.price
                  ? `$${(horse.price / 100).toLocaleString()}`
                  : "Contact for price";

                return (
                  <div
                    key={horse.id}
                    className="rounded-lg border border-border bg-paper-cream shadow-flat"
                  >
                    {/* Image placeholder */}
                    <div className="aspect-[4/3] rounded-t-lg bg-paper-warm" />

                    <div className="p-4">
                      <h3 className="font-heading text-base font-semibold text-ink-black">
                        {horse.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-ink-mid">
                        {horse.breed}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-base font-bold text-ink-black">
                          {priceStr}
                        </p>
                        {horse.state && (
                          <span className="flex items-center gap-1 text-xs text-ink-light">
                            <MapPin className="h-3 w-3" />
                            {horse.state}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <Separator className="my-6" />

          {/* Contact */}
          <section className="mb-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-ink-black">
              Contact
            </h2>
            <div className="rounded-lg border border-border bg-paper-cream p-5 shadow-flat">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="overline mb-2 text-ink-light">
                    TRAINER LOCATION
                  </p>
                  <p className="text-sm text-ink-mid">{trainer.location}</p>
                </div>
                <Button size="lg">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Trainer
                </Button>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="rounded-md bg-paper-warm p-4 text-xs text-ink-light">
            All representations are made by the trainer. ManeExchange does not
            warrant listing accuracy or trainer qualifications.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
