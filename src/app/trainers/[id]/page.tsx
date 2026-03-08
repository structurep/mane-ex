import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Shield,
  Star,
  MessageCircle,
  ChevronRight,
  Award,
  Users,
} from "lucide-react";
import {
  TrainerServicesGrid,
  SERVICE_CATALOG,
  type TrainerService,
  type TrainerServiceType,
} from "@/components/marketplace/trainer-services";

/* ─── Sample Data (static until DB wiring) ─── */

type SampleTrainer = {
  id: string;
  name: string;
  location: string;
  disciplines: string[];
  rating: number;
  reviewCount: number;
  horseCount: number;
  verified: boolean;
  bio: string;
  memberSince: string;
  credentials: string[];
  travelRadius: string;
  services: { type: TrainerServiceType; price: number | null; available: boolean }[];
};

const sampleTrainers: SampleTrainer[] = [
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
    credentials: ["USEF Licensed Trainer", "USHJA Certified"],
    travelRadius: "South Florida & Southeast",
    services: [
      { type: "ppe_supervision", price: 35000, available: true },
      { type: "trial_ride", price: 25000, available: true },
      { type: "training_assessment", price: 30000, available: true },
      { type: "horse_shopping", price: null, available: true },
      { type: "video_evaluation", price: 15000, available: true },
      { type: "lesson", price: 17500, available: true },
    ],
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
    credentials: ["USDF Gold Medalist", "USEF Licensed Trainer", "FEI Level 2"],
    travelRadius: "Central Florida & Southeast",
    services: [
      { type: "ppe_supervision", price: 40000, available: true },
      { type: "trial_ride", price: 30000, available: true },
      { type: "training_assessment", price: 35000, available: true },
      { type: "horse_shopping", price: null, available: true },
      { type: "video_evaluation", price: 20000, available: true },
      { type: "lesson", price: 22500, available: false },
    ],
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
    credentials: ["USEA Certified Instructor"],
    travelRadius: "Aiken / Augusta area",
    services: [
      { type: "ppe_supervision", price: 25000, available: true },
      { type: "trial_ride", price: 20000, available: true },
      { type: "training_assessment", price: 25000, available: true },
      { type: "video_evaluation", price: 10000, available: true },
      { type: "lesson", price: 12500, available: true },
    ],
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
    credentials: ["USEF R-rated Judge", "USHJA Certified Trainer", "30+ Years Experience"],
    travelRadius: "Kentucky, Virginia, Florida circuit",
    services: [
      { type: "ppe_supervision", price: 50000, available: true },
      { type: "trial_ride", price: 35000, available: true },
      { type: "training_assessment", price: 40000, available: true },
      { type: "horse_shopping", price: null, available: true },
      { type: "video_evaluation", price: 25000, available: true },
      { type: "lesson", price: 25000, available: false },
    ],
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
    credentials: ["USHJA Certified", "Medal/Maclay Specialist"],
    travelRadius: "Virginia & Mid-Atlantic",
    services: [
      { type: "ppe_supervision", price: 30000, available: true },
      { type: "trial_ride", price: 25000, available: true },
      { type: "training_assessment", price: 25000, available: true },
      { type: "video_evaluation", price: 12500, available: true },
      { type: "lesson", price: 15000, available: true },
    ],
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
    credentials: ["NRHA Professional", "$500K+ Lifetime Earnings"],
    travelRadius: "Florida & Southeast",
    services: [
      { type: "ppe_supervision", price: 35000, available: true },
      { type: "trial_ride", price: 25000, available: true },
      { type: "training_assessment", price: 30000, available: true },
      { type: "horse_shopping", price: null, available: true },
      { type: "video_evaluation", price: 15000, available: true },
      { type: "lesson", price: 17500, available: true },
    ],
  },
];

const sampleHorses = [
  { id: "h1", name: "Callaway's Best", breed: "Warmblood", price: 8500000, state: "FL" },
  { id: "h2", name: "Sterling Silver", breed: "Holsteiner", price: 6500000, state: "FL" },
  { id: "h3", name: "Night Watch", breed: "Hanoverian", price: 4500000, state: "FL" },
];

/* ─── Page ─── */

type Props = {
  params: Promise<{ id: string }>;
};

function getTrainer(id: string) {
  return sampleTrainers.find((t) => t.id === id) || null;
}

function buildServices(
  trainer: SampleTrainer
): TrainerService[] {
  return trainer.services.map((s) => ({
    ...SERVICE_CATALOG[s.type],
    price: s.price,
    available: s.available,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const trainer = getTrainer(id);

  if (!trainer) {
    return { title: "Trainer Not Found" };
  }

  return {
    title: `${trainer.name} — ManeExchange Trainer`,
    description: `${trainer.name} — ${trainer.disciplines.join(", ")} trainer in ${trainer.location}. ${trainer.services.length} services available. ${trainer.reviewCount} reviews.`,
  };
}

export default async function TrainerProfilePage({ params }: Props) {
  const { id } = await params;
  const trainer = getTrainer(id);

  if (!trainer) {
    notFound();
  }

  const services = buildServices(trainer);

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
              <div className="h-20 w-20 flex-shrink-0 rounded-full bg-paper-warm" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-black">
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
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    Travels: {trainer.travelRadius}
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

                {/* Credentials */}
                {trainer.credentials.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {trainer.credentials.map((c) => (
                      <span
                        key={c}
                        className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold"
                      >
                        <Award className="h-3 w-3" />
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Stats row */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            <div className="rounded-lg border-0 bg-paper-cream p-4 text-center shadow-flat">
              <p className="font-serif text-2xl font-bold text-ink-black">
                {trainer.horseCount}
              </p>
              <p className="mt-1 text-xs text-ink-mid">Horses</p>
            </div>
            <div className="rounded-lg border-0 bg-paper-cream p-4 text-center shadow-flat">
              <p className="font-serif text-2xl font-bold text-ink-black">
                {trainer.reviewCount}
              </p>
              <p className="mt-1 text-xs text-ink-mid">Reviews</p>
            </div>
            <div className="rounded-lg border-0 bg-paper-cream p-4 text-center shadow-flat">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <p className="font-serif text-2xl font-bold text-ink-black">
                  {trainer.rating}
                </p>
              </div>
              <p className="mt-1 text-xs text-ink-mid">Rating</p>
            </div>
            <div className="rounded-lg border-0 bg-paper-cream p-4 text-center shadow-flat">
              <p className="font-serif text-2xl font-bold text-ink-black">
                {services.filter((s) => s.available).length}
              </p>
              <p className="mt-1 text-xs text-ink-mid">Services</p>
            </div>
          </div>

          <div className="crease-divider my-6" />

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

          <div className="crease-divider my-6" />

          {/* ─── Services Marketplace ─── */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="font-heading text-xl font-semibold text-ink-black">
                Services
              </h2>
              <p className="mt-1 text-sm text-ink-mid">
                Book {trainer.name.split(" ")[0]} for pre-purchase evaluations,
                trial rides, and more.
              </p>
            </div>

            <TrainerServicesGrid
              services={services}
              trainerName={trainer.name}
            />
          </section>

          <div className="crease-divider my-6" />

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
                    className="rounded-lg border-0 bg-paper-cream shadow-flat transition-elevation hover-lift hover:shadow-lifted"
                  >
                    <div className="aspect-[4/3] rounded-t-lg bg-paper-warm" />

                    <div className="p-4">
                      <h3 className="font-heading text-base font-semibold text-ink-black">
                        {horse.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-ink-mid">
                        {horse.breed}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-serif text-base font-bold text-ink-black">
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

          <div className="crease-divider my-6" />

          {/* Contact */}
          <section className="mb-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-ink-black">
              Contact
            </h2>
            <div className="rounded-lg border-0 bg-paper-cream p-5 shadow-flat">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="overline mb-2 text-ink-light">
                    TRAINER LOCATION
                  </p>
                  <p className="text-sm text-ink-mid">{trainer.location}</p>
                  <p className="mt-1 text-xs text-ink-light">
                    Travels: {trainer.travelRadius}
                  </p>
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
            warrant listing accuracy or trainer qualifications. Service pricing
            is set by the trainer and may vary based on location and scope.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
