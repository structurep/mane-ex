import { Metadata } from "next";
import Link from "next/link";
import { getTrainerProfile, getTrainerServices } from "@/actions/trainers";
import { TrainerProfileForm } from "./profile-form";
import { TrainerServicesList } from "./services-list";
import { StatusBadge } from "@/components/tailwind-plus";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Trainer Portal",
};

export default async function TrainerPortalPage() {
  const [{ profile }, { services }] = await Promise.all([
    getTrainerProfile(),
    getTrainerServices(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
            Trainer Portal
          </h1>
          <p className="mt-1 text-sm text-ink-mid">
            Manage your professional profile and service offerings.
          </p>
        </div>
        {profile && (
          <Link
            href={`/trainers/${profile.id}`}
            className="flex items-center gap-1.5 text-xs font-medium text-oxblood hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View public profile
          </Link>
        )}
      </div>

      {/* Status badges */}
      {profile && (
        <div className="mb-6 flex flex-wrap gap-2">
          {profile.verified && <StatusBadge variant="forest" dot>Verified</StatusBadge>}
          {profile.accepting_clients ? (
            <StatusBadge variant="forest">Accepting clients</StatusBadge>
          ) : (
            <StatusBadge variant="gray">Not accepting clients</StatusBadge>
          )}
          {profile.rating_avg && (
            <StatusBadge variant="gold">
              {profile.rating_avg} rating ({profile.review_count} reviews)
            </StatusBadge>
          )}
        </div>
      )}

      {/* Profile form */}
      <section className="rounded-lg bg-paper-white p-6 shadow-flat">
        <h2 className="mb-4 text-sm font-semibold text-ink-dark">
          {profile ? "Edit Profile" : "Create Trainer Profile"}
        </h2>
        <TrainerProfileForm profile={profile} />
      </section>

      {/* Services */}
      {profile && (
        <section className="mt-8 rounded-lg bg-paper-white p-6 shadow-flat">
          <h2 className="mb-4 text-sm font-semibold text-ink-dark">Services</h2>
          <TrainerServicesList services={services} />
        </section>
      )}
    </div>
  );
}
