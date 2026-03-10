import { Metadata } from "next";
import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/tailwind-plus";

export const metadata: Metadata = { title: "Schedule" };

export default function SchedulePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Schedule
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage viewings, trials, PPEs, and video calls.
        </p>
      </div>

      <EmptyState
        icon={<Calendar className="size-8" />}
        title="No events scheduled"
        description="When you schedule viewings, trial rides, or PPEs through ManeExchange, they'll appear here. Scheduling tools are coming soon."
      />
    </div>
  );
}
