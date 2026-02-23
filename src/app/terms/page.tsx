import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ManeExchange Terms of Service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-20 md:px-8 md:py-24">
        <article className="prose-mane mx-auto max-w-3xl">
          <p className="overline mb-3 text-ink-light">LEGAL</p>
          <h1 className="mb-2 text-3xl font-bold text-ink-black">
            Terms of Service
          </h1>
          <p className="mb-8 text-sm text-ink-light">
            Last updated: February 22, 2026
          </p>

          <div className="space-y-8 text-ink-mid [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink-black [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-ink-dark [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using ManeExchange (&ldquo;the Platform&rdquo;),
                you agree to be bound by these Terms of Service
                (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do
                not use the Platform.
              </p>
            </section>

            <section>
              <h2>2. Platform Role</h2>
              <p>
                ManeExchange is a marketplace that connects buyers and sellers of
                horses. ManeExchange is not a party to any transaction between
                buyers and sellers. ManeExchange does not own, possess, inspect,
                or guarantee any horse listed on the Platform.
              </p>
              <p>
                All representations regarding horses listed on the Platform are
                made by sellers. ManeExchange does not warrant the accuracy,
                completeness, or reliability of any listing, including but not
                limited to descriptions, photographs, veterinary records, show
                records, or registration documents.
              </p>
            </section>

            <section>
              <h2>3. User Accounts</h2>
              <p>
                You must provide accurate, current, and complete information
                during registration and keep your account information updated.
                You are responsible for maintaining the confidentiality of your
                account credentials. You must be at least 18 years of age to
                create an account.
              </p>
              <h3>3.1 Seller Accounts</h3>
              <p>
                Sellers must complete identity verification as required by the
                INFORM Consumers Act. This includes providing and verifying: a
                valid government-issued ID, bank account information, tax
                identification number, and contact information. High-volume
                sellers are subject to annual re-verification.
              </p>
            </section>

            <section>
              <h2>4. Listings and Content</h2>
              <p>
                Sellers are solely responsible for the accuracy of their
                listings. All listings must comply with applicable state and
                federal laws, including but not limited to:
              </p>
              <ul>
                <li>
                  Florida Administrative Code Rule 5H-26 (for Florida-based
                  transactions)
                </li>
                <li>
                  California Business and Professions Code Section 19525 (for
                  California-based transactions)
                </li>
                <li>
                  Kentucky Revised Statutes 230.357 (for Kentucky-based
                  transactions)
                </li>
                <li>UCC Article 2 requirements for sales of goods</li>
              </ul>
              <p>
                ManeExchange reserves the right to remove any listing that
                violates these Terms, applicable law, or community guidelines.
              </p>
            </section>

            <section>
              <h2>5. Escrow Services (ManeVault)</h2>
              <p>
                ManeVault escrow services are provided through Stripe Connect.
                Payment processing is subject to Stripe&apos;s terms of service.
                Funds are held until the buyer confirms delivery or the
                auto-release period (14 days) expires without a dispute.
              </p>
              <p>
                ManeExchange is not a money transmitter. All funds are processed
                and held by Stripe in accordance with applicable financial
                regulations.
              </p>
            </section>

            <section>
              <h2>6. Buyer Protection (ManeGuard)</h2>
              <p>
                ManeGuard provides buyer protection for qualifying transactions.
                Coverage is subject to the terms of the ManeGuard program,
                including evidence requirements and filing deadlines. ManeGuard
                is funded by buyer protection fees and is separate from the
                Platform&apos;s operating funds.
              </p>
            </section>

            <section>
              <h2>7. Mane Score</h2>
              <p>
                The Mane Score reflects listing completeness and seller
                activity. It does not represent, warrant, or guarantee the
                quality, soundness, temperament, training level, or value of any
                horse. Users should conduct their own due diligence, including
                independent pre-purchase examinations, before completing any
                transaction.
              </p>
            </section>

            <section>
              <h2>8. Dispute Resolution</h2>
              <p>
                Disputes between buyers and sellers should first be resolved
                through the Platform&apos;s dispute resolution process. If a
                dispute cannot be resolved through the Platform, it shall be
                resolved through binding arbitration in accordance with the rules
                of the American Arbitration Association. Class action waiver
                applies.
              </p>
            </section>

            <section>
              <h2>9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, ManeExchange shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising out of or related to your use of the
                Platform. ManeExchange&apos;s total liability shall not exceed
                the fees paid by you to ManeExchange in the twelve (12) months
                preceding the claim.
              </p>
            </section>

            <section>
              <h2>10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless ManeExchange from any
                claims, damages, losses, or expenses arising from your use of
                the Platform, your violation of these Terms, or your violation of
                any applicable law.
              </p>
            </section>

            <section>
              <h2>11. Veterinary Records and Documents</h2>
              <p>
                Documents uploaded to the Platform, including but not limited to
                pre-purchase examination reports, Coggins tests, registration
                papers, and veterinary records, are provided by sellers.
                ManeExchange has not independently verified the accuracy,
                completeness, or authenticity of any document on the Platform.
              </p>
            </section>

            <section>
              <h2>12. Interstate Transport</h2>
              <p>
                Buyers and sellers are solely responsible for compliance with all
                applicable state and federal regulations governing the
                interstate transport of horses, including but not limited to
                Coggins testing and Certificates of Veterinary Inspection.
              </p>
            </section>

            <section>
              <h2>13. Modifications</h2>
              <p>
                ManeExchange reserves the right to modify these Terms at any
                time. Material changes will be communicated via email or
                Platform notification at least 30 days before taking effect.
                Continued use of the Platform after modifications constitutes
                acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2>14. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with
                the laws of the State of Florida, without regard to conflict of
                law principles.
              </p>
            </section>

            <section>
              <h2>15. Contact</h2>
              <p>
                For questions about these Terms, contact us at
                legal@maneexchange.com.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
