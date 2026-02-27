"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ClipboardCheck,
  Stethoscope,
  Video,
  GraduationCap,
  Search,
  Waypoints,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Send,
  X,
} from "lucide-react";

/* ─── Service Definitions ─── */

export type TrainerServiceType =
  | "ppe_supervision"
  | "trial_ride"
  | "training_assessment"
  | "horse_shopping"
  | "video_evaluation"
  | "lesson";

export type TrainerService = {
  type: TrainerServiceType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  price: number | null; // cents, null = "Contact"
  duration: string;
  available: boolean;
};

export const SERVICE_CATALOG: Record<
  TrainerServiceType,
  Omit<TrainerService, "price" | "available">
> = {
  ppe_supervision: {
    type: "ppe_supervision",
    label: "Pre-Purchase Evaluation",
    description:
      "On-site evaluation during the veterinary pre-purchase exam. Assess conformation, movement, behavior, and suitability for your goals.",
    icon: Stethoscope,
    duration: "2-3 hours",
  },
  trial_ride: {
    type: "trial_ride",
    label: "Trial Ride Supervision",
    description:
      "Supervised trial ride with professional assessment. Evaluate rideability, training level, and horse-rider compatibility.",
    icon: Waypoints,
    duration: "1-2 hours",
  },
  training_assessment: {
    type: "training_assessment",
    label: "Training Assessment",
    description:
      "Comprehensive evaluation of current training level, potential, and recommended program for continued development.",
    icon: ClipboardCheck,
    duration: "1-2 hours",
  },
  horse_shopping: {
    type: "horse_shopping",
    label: "Horse Shopping",
    description:
      "Full-service horse search based on your criteria. Includes screening listings, arranging viewings, and negotiation support.",
    icon: Search,
    duration: "Ongoing",
  },
  video_evaluation: {
    type: "video_evaluation",
    label: "Video Evaluation",
    description:
      "Remote assessment from listing videos and media. Written report on conformation, movement quality, and suitability.",
    icon: Video,
    duration: "24-48 hours",
  },
  lesson: {
    type: "lesson",
    label: "Lesson / Clinic",
    description:
      "Individual or group instruction. Available at trainer's facility or yours (travel fees may apply).",
    icon: GraduationCap,
    duration: "1 hour",
  },
};

/* ─── Service Card ─── */

export function TrainerServiceCard({
  service,
  onRequest,
}: {
  service: TrainerService;
  onRequest: (type: TrainerServiceType) => void;
}) {
  const Icon = service.icon;
  const priceStr = service.price
    ? `$${(service.price / 100).toLocaleString()}`
    : "Contact for pricing";

  return (
    <div className="flex flex-col justify-between rounded-lg border-0 bg-paper-white p-5 shadow-flat transition-elevation hover:shadow-folded">
      <div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-sm font-semibold text-ink-black">
              {service.label}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-ink-light">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.duration}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {priceStr}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-mid">
          {service.description}
        </p>
      </div>
      <div className="mt-4">
        {service.available ? (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onRequest(service.type)}
          >
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            Request Service
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="w-full" disabled>
            Currently Unavailable
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Service Request Form (Modal-like overlay) ─── */

export function ServiceRequestForm({
  trainerName,
  serviceType,
  onClose,
}: {
  trainerName: string;
  serviceType: TrainerServiceType;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const serviceDef = SERVICE_CATALOG[serviceType];
  const Icon = serviceDef.icon;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 p-4">
        <div className="w-full max-w-md rounded-lg bg-paper-white p-8 text-center shadow-hovering">
          <CheckCircle className="mx-auto h-12 w-12 text-forest" />
          <h3 className="mt-4 font-serif text-xl font-bold text-ink-black">
            Request Sent
          </h3>
          <p className="mt-2 text-sm text-ink-mid">
            {trainerName} has been notified and will respond within 24 hours.
            You&apos;ll receive a message in your ManeExchange inbox.
          </p>
          <Button className="mt-6" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-paper-white shadow-hovering">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-crease-light px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold text-ink-black">
                Request {serviceDef.label}
              </h3>
              <p className="text-xs text-ink-light">with {trainerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-light transition-colors hover:bg-paper-warm hover:text-ink-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-4 p-6"
        >
          {/* Horse name (optional — they may not own one yet) */}
          <div>
            <Label htmlFor="horse_name" className="text-xs">
              Horse Name or Listing{" "}
              <span className="text-ink-light">(optional)</span>
            </Label>
            <Input
              id="horse_name"
              placeholder="e.g., Callaway's Best or paste listing URL"
              className="mt-1"
            />
          </div>

          {/* Preferred dates */}
          <div>
            <Label htmlFor="preferred_date" className="text-xs">
              Preferred Date
            </Label>
            <Input id="preferred_date" type="date" className="mt-1" />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-xs">
              Location{" "}
              <span className="text-ink-light">
                (where is the horse located?)
              </span>
            </Label>
            <Input
              id="location"
              placeholder="City, State"
              className="mt-1"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-xs">
              Additional Details
            </Label>
            <textarea
              id="message"
              rows={3}
              placeholder="Tell the trainer about your goals, experience level, and what you're looking for..."
              className="mt-1 w-full rounded-md border border-border bg-paper-white px-3 py-2 text-sm placeholder:text-ink-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-ink-light">
              No obligation · Free to request
            </p>
            <Button type="submit">
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Services Grid (for trainer detail page) ─── */

export function TrainerServicesGrid({
  services,
  trainerName,
}: {
  services: TrainerService[];
  trainerName: string;
}) {
  const [requestType, setRequestType] = useState<TrainerServiceType | null>(
    null
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <TrainerServiceCard
            key={service.type}
            service={service}
            onRequest={setRequestType}
          />
        ))}
      </div>

      {requestType && (
        <ServiceRequestForm
          trainerName={trainerName}
          serviceType={requestType}
          onClose={() => setRequestType(null)}
        />
      )}
    </>
  );
}
