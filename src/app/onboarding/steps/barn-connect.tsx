"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Store, Users, SkipForward } from "lucide-react";
import Link from "next/link";

export function BarnConnectStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-ink-black">
        Connect with a barn
      </h1>
      <p className="mt-1 text-sm text-ink-mid">
        Barns are community hubs where teams share updates, list horses, and stay connected.
      </p>

      <div className="mt-8 space-y-4">
        {/* Create a farm */}
        <Link
          href="/dashboard/farm"
          className="flex items-center gap-4 rounded-lg border-2 border-crease-light bg-paper-cream p-5 transition-all hover:border-primary hover:shadow-folded"
        >
          <div className="rounded-full bg-primary/10 p-3">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-ink-black">Create a Barn Page</p>
            <p className="mt-0.5 text-xs text-ink-light">
              Set up your barn and invite team members.
            </p>
          </div>
        </Link>

        {/* Accept an invite */}
        <div className="flex items-center gap-4 rounded-lg border-2 border-crease-light bg-paper-cream p-5">
          <div className="rounded-full bg-navy/10 p-3">
            <Users className="h-5 w-5 text-navy" />
          </div>
          <div>
            <p className="font-medium text-ink-black">I have an invite</p>
            <p className="mt-0.5 text-xs text-ink-light">
              Check your email for a barn invite link.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" onClick={onNext}>
          Skip for now
          <SkipForward className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
