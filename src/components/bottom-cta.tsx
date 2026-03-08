import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function BottomCTA() {
  return (
    <section aria-label="Get started" className="bg-paddock px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-[1200px] text-center">
        <h2 className="mb-4 font-serif text-3xl text-white md:text-4xl">
          Your next horse is waiting.
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-white/85">
          Join thousands of riders who&apos;ve found their perfect partner on
          ManeExchange.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="bg-coral text-white hover:bg-coral-hover focus-visible:ring-white focus-visible:ring-offset-ink-black"
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
