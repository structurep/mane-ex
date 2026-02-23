import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function BottomCTA() {
  return (
    <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1200px] text-center">
        <h2 className="mb-4 text-3xl font-semibold text-ink-black">
          Your next horse is waiting.
        </h2>
        <p className="text-lead mx-auto mb-8 max-w-xl text-ink-mid">
          Join the marketplace built for equestrians who take transactions
          seriously.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/browse">
              Browse Horses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/sell">List Your Horse</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
