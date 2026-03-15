import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function BottomCTA() {
  return (
    <section aria-label="Get started" className="bg-paddock px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-[1200px] text-center">
        <h2 className="display-lg mb-4 text-white">
          Your next horse is waiting.
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-white/85">
          Browse verified listings with escrow protection, transparent pricing,
          and real documentation.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="bg-white text-[var(--accent-navy)] hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-ink-black"
            asChild
          >
            <Link href="/browse">
              Browse Horses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-white/30 text-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-ink-black"
            asChild
          >
            <Link href="/sell">List Your Horse</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
