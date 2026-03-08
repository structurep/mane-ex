import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/marketing/bottom-cta";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Shield,
  Stethoscope,
  ClipboardCheck,
  Video,
  GraduationCap,
  Search as SearchIcon,
} from "lucide-react";
import type { TrainerServiceType } from "@/components/marketplace/trainer-services";
import { TrainerDirectoryFilters } from "./trainer-filters";

export const metadata: Metadata = {
  title: "Trainer Directory & Services",
  description:
    "Find verified trainers on ManeExchange. Book pre-purchase evaluations, trial rides, training assessments, and more.",
};

const SERVICE_ICONS: Record<TrainerServiceType, React.ComponentType<{ className?: string }>> = {
  ppe_supervision: Stethoscope,
  trial_ride: ClipboardCheck,
  training_assessment: ClipboardCheck,
  horse_shopping: SearchIcon,
  video_evaluation: Video,
  lesson: GraduationCap,
};

const SERVICE_LABELS: Record<TrainerServiceType, string> = {
  ppe_supervision: "PPE",
  trial_ride: "Trial Rides",
  training_assessment: "Assessments",
  horse_shopping: "Horse Shopping",
  video_evaluation: "Video Eval",
  lesson: "Lessons",
};

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
  services: TrainerServiceType[];
  startingPrice: number | null; // cents
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
    bio: "25+ years training hunters and jumpers in the Wellington circuit.",
    services: ["ppe_supervision", "trial_ride", "training_assessment", "horse_shopping", "video_evaluation", "lesson"],
    startingPrice: 15000,
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
    services: ["ppe_supervision", "trial_ride", "training_assessment", "horse_shopping", "video_evaluation"],
    startingPrice: 20000,
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
    services: ["ppe_supervision", "trial_ride", "training_assessment", "video_evaluation", "lesson"],
    startingPrice: 10000,
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
    services: ["ppe_supervision", "trial_ride", "training_assessment", "horse_shopping", "video_evaluation"],
    startingPrice: 25000,
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
    services: ["ppe_supervision", "trial_ride", "training_assessment", "video_evaluation", "lesson"],
    startingPrice: 12500,
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
    services: ["ppe_supervision", "trial_ride", "training_assessment", "horse_shopping", "video_evaluation", "lesson"],
    startingPrice: 15000,
  },
];

type Props = {
  searchParams: Promise<{
    service?: string;
    discipline?: string;
    region?: string;
  }>;
};

export default async function TrainerDirectoryPage({ searchParams }: Props) {
  const params = await searchParams;

  // Filter trainers
  let trainers = sampleTrainers;

  if (params.service) {
    trainers = trainers.filter((t) =>
      t.services.includes(params.service as TrainerServiceType)
    );
  }
  if (params.discipline) {
    trainers = trainers.filter((t) =>
      t.disciplines.some((d) =>
        d.toLowerCase().includes(params.discipline!.toLowerCase())
      )
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
        <div className="mx-auto max-w-[1200px]">
          <p className="overline mb-3 text-gold">TRAINER MARKETPLACE</p>
          <h1 className="mb-4 text-4xl tracking-tight text-ink-black md:text-5xl">
            Expert help, on demand.
          </h1>
          <p className="text-lead max-w-xl text-ink-mid">
            Book pre-purchase evaluations, trial rides, and training
            assessments from verified professionals.
          </p>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="bg-paper-cream section-premium">
        <div className="mx-auto max-w-[1200px]">
          {/* Filters */}
          <TrainerDirectoryFilters params={params} />

          <p className="mt-6 mb-4 text-sm text-ink-mid">
            {trainers.length} trainer{trainers.length !== 1 ? "s" : ""}{" "}
            {params.service ? `offering ${SERVICE_LABELS[params.service as TrainerServiceType] || params.service}` : "available"}
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

                {/* Disciplines */}
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

                {/* Service icons */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {trainer.services.slice(0, 4).map((svc) => {
                    const Icon = SERVICE_ICONS[svc];
                    return (
                      <span
                        key={svc}
                        className="flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
                        title={SERVICE_LABELS[svc]}
                      >
                        <Icon className="h-3 w-3" />
                        {SERVICE_LABELS[svc]}
                      </span>
                    );
                  })}
                  {trainer.services.length > 4 && (
                    <span className="rounded-full bg-paper-warm px-2 py-0.5 text-[10px] font-medium text-ink-light">
                      +{trainer.services.length - 4} more
                    </span>
                  )}
                </div>

                {/* Rating + starting price */}
                <div className="mt-4 flex items-center justify-between text-sm text-ink-mid">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-gold" />
                    {trainer.rating}
                    <span className="text-ink-light">
                      ({trainer.reviewCount})
                    </span>
                  </span>
                  {trainer.startingPrice && (
                    <span className="text-xs font-medium text-ink-black">
                      From ${(trainer.startingPrice / 100).toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {trainers.length === 0 && (
            <div className="rounded-lg border border-dashed border-crease-mid bg-paper-white p-12 text-center">
              <p className="text-lg font-medium text-ink-dark">
                No trainers match your filters
              </p>
              <p className="mt-1 text-sm text-ink-mid">
                Try adjusting your service or discipline filters.
              </p>
            </div>
          )}
        </div>
      </section>

      <BottomCTA />

      <Footer />
    </div>
  );
}
