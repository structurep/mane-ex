import Link from "next/link";
import { Search, Send, ArrowRight } from "lucide-react";

export function ISOBanner() {
  return (
    <section aria-label="In search of" className="bg-paper-white px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
        {/* Looking for a horse */}
        <div className="paper-flat flex items-start gap-5 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bronze/10">
            <Search className="h-5 w-5 text-bronze" />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold text-ink-black">
              Looking for a horse?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-mid">
              Post an ISO and let sellers bring matching horses to you.
              Describe what you want &mdash; we&apos;ll do the rest.
            </p>
            <Link
              href="/iso/new"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-bronze hover:text-bronze-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              Create an ISO
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Have a horse to sell */}
        <div className="paper-flat flex items-start gap-5 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink/5">
            <Send className="h-5 w-5 text-ink-dark" />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold text-ink-black">
              Have a horse to sell?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-mid">
              Browse active ISOs from buyers looking right now. Submit your
              horse directly to the ones that match.
            </p>
            <Link
              href="/iso"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink-dark hover:text-ink-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              Browse ISOs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
