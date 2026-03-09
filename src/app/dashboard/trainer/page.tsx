import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/tailwind-plus";
import { Users, Search, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Trainer Portal",
};

export default function TrainerPortalPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Trainer Portal
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage clients, match ISOs, and grow your training business.
        </p>
      </div>

      {/* Coming soon */}
      <div className="rounded-lg border border-dashed border-crease-mid bg-paper-cream">
        <EmptyState
          icon={<Users className="size-10" />}
          title="Trainer tools are coming soon"
          description="Client management, ISO matching, and barn profile management will be available in an upcoming release."
        />
      </div>

      {/* Quick actions that already work */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-medium text-ink-dark">
          Available Now
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/iso">
              <Search className="mr-2 h-4 w-4" />
              Browse ISOs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/farm">
              <Building2 className="mr-2 h-4 w-4" />
              Manage Barn Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
