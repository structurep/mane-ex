import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";

export const metadata: Metadata = {
  title: "About",
  description:
    "ManeExchange is building the financial infrastructure for the $122B horse industry.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="bg-paper-white px-4 pt-20 pb-16 md:px-8 md:pt-24">
          <div className="mx-auto max-w-3xl">
            <p className="overline mb-3 text-red">ABOUT</p>
            <h1 className="mb-8 text-4xl font-bold text-ink-black md:text-5xl">
              The horse industry
              <br />
              deserves real infrastructure.
            </h1>
            <div className="space-y-6 text-ink-mid">
              <p className="text-lead">
                The equestrian industry moves $122 billion annually. Sales of
                show horses — hunter/jumpers, dressage, eventers — routinely
                exceed $50,000. Some cross $500,000.
              </p>
              <p>
                Yet the market operates like it&apos;s 1995. Private sales over
                Instagram DMs. Wiring $85,000 to a stranger with no escrow. Vet
                records exchanged via text message. Trainer commissions
                undisclosed. Listings that disappear overnight.
              </p>
              <p>
                ManeExchange exists because horses aren&apos;t commodity goods —
                they&apos;re living animals with complex histories, and the
                people who buy and sell them deserve a platform that treats the
                transaction with the seriousness it demands.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-2xl font-semibold text-ink-black">
              What we&apos;re building
            </h2>
            <div className="space-y-8">
              {[
                {
                  title: "Verified listings",
                  description:
                    "Every listing goes through a completeness check. Vet records, show history, registration papers, and media — documented and organized, not buried in a text thread.",
                },
                {
                  title: "Escrowed payments",
                  description:
                    "ManeVault holds buyer funds until the horse arrives and passes inspection. ACH transfers keep fees at $5 instead of $1,450. No more wiring money to strangers.",
                },
                {
                  title: "Transparent scoring",
                  description:
                    "The Mane Score measures listing completeness and seller responsiveness — not horse quality. More documentation means more trust. Simple.",
                },
                {
                  title: "Compliance built in",
                  description:
                    "Florida Rule 5H, UCC Article 2, INFORM Act — the legal requirements for horse sales vary by state and are easy to miss. Our listing wizard handles the disclosures so sellers don't have to guess.",
                },
                {
                  title: "Trainer protection",
                  description:
                    "Commissions are documented in writing with both-party consent. No more accusations of secret profit-taking. Transparency protects everyone.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="mb-2 font-medium text-ink-black">
                    {item.title}
                  </h3>
                  <p className="text-ink-mid">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-paper-white px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-2xl font-semibold text-ink-black">
              Starting in Wellington
            </h2>
            <p className="mb-6 text-ink-mid">
              We&apos;re launching in Wellington, Florida — the epicenter of the
              hunter/jumper world during WEF season. From there, we&apos;ll
              expand to the Florida triangle (Ocala, Tampa), then the Eastern
              Seaboard, then nationally. We&apos;re building deep, not wide.
            </p>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
