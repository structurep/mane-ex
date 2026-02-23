import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ManeExchange Privacy Policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-20 md:px-8 md:py-24">
        <article className="mx-auto max-w-3xl">
          <p className="overline mb-3 text-ink-light">LEGAL</p>
          <h1 className="mb-2 text-3xl font-bold text-ink-black">
            Privacy Policy
          </h1>
          <p className="mb-8 text-sm text-ink-light">
            Last updated: February 22, 2026
          </p>

          <div className="space-y-8 text-ink-mid [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink-black [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-ink-dark [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_table]:w-full [&_table]:text-sm [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:bg-paper-warm [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink-dark">
            <section>
              <h2>1. Information We Collect</h2>
              <h3>1.1 Information You Provide</h3>
              <ul>
                <li>
                  <strong>Account information:</strong> Name, email address,
                  phone number, location, profile photo
                </li>
                <li>
                  <strong>Seller verification:</strong> Government-issued ID
                  (processed by Stripe Identity), tax identification number,
                  bank account information (processed by Stripe Connect)
                </li>
                <li>
                  <strong>Listing content:</strong> Horse descriptions,
                  photographs, videos, veterinary records, registration
                  documents, show records
                </li>
                <li>
                  <strong>Communications:</strong> Messages sent through the
                  Platform
                </li>
                <li>
                  <strong>Transaction data:</strong> Offer amounts, payment
                  information (processed by Stripe), shipping details
                </li>
              </ul>
              <h3>1.2 Information We Collect Automatically</h3>
              <ul>
                <li>
                  Device information (browser type, operating system, screen
                  size)
                </li>
                <li>Usage data (pages visited, features used, session duration)</li>
                <li>IP address and approximate location</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <table>
                <thead>
                  <tr>
                    <th>Purpose</th>
                    <th>Data Used</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Provide marketplace services</td>
                    <td>Account info, listings, transactions</td>
                  </tr>
                  <tr>
                    <td>Identity verification (INFORM Act)</td>
                    <td>
                      ID documents (via Stripe), tax ID, contact info
                    </td>
                  </tr>
                  <tr>
                    <td>Process payments</td>
                    <td>Payment info (via Stripe Connect)</td>
                  </tr>
                  <tr>
                    <td>Facilitate communication</td>
                    <td>Messages, contact info</td>
                  </tr>
                  <tr>
                    <td>Calculate Mane Score</td>
                    <td>Listing completeness, response times, activity</td>
                  </tr>
                  <tr>
                    <td>Fraud prevention</td>
                    <td>Activity patterns, device info, verification data</td>
                  </tr>
                  <tr>
                    <td>Improve the Platform</td>
                    <td>Usage data, analytics</td>
                  </tr>
                  <tr>
                    <td>Send notifications</td>
                    <td>Email, push notification tokens</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2>3. How We Share Your Information</h2>
              <ul>
                <li>
                  <strong>Other users:</strong> Your public profile, listings,
                  and Mane Score are visible to other users. Seller contact
                  information is displayed as required by the INFORM Consumers
                  Act.
                </li>
                <li>
                  <strong>Stripe:</strong> Payment and identity verification
                  data is shared with Stripe for processing. Stripe&apos;s
                  privacy policy governs their use of this data.
                </li>
                <li>
                  <strong>Supabase:</strong> Account and listing data is stored
                  on Supabase&apos;s infrastructure.
                </li>
                <li>
                  <strong>Vercel:</strong> Website hosting and analytics.
                </li>
                <li>
                  <strong>Law enforcement:</strong> When required by law, court
                  order, or subpoena.
                </li>
              </ul>
              <p>
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2>4. Veterinary and Health Records</h2>
              <p>
                Veterinary records, Coggins tests, pre-purchase examination
                reports, and other health-related documents uploaded to the
                Platform are stored securely and shared only as directed by the
                seller through the document visibility settings:
              </p>
              <ul>
                <li>
                  <strong>Public:</strong> Visible to all users
                </li>
                <li>
                  <strong>On Request:</strong> Shared when a buyer requests
                  access
                </li>
                <li>
                  <strong>Private:</strong> Visible only to the seller
                </li>
                <li>
                  <strong>Escrow Only:</strong> Released when an escrow
                  transaction is initiated
                </li>
              </ul>
            </section>

            <section>
              <h2>5. Your Rights (CCPA / California Residents)</h2>
              <p>If you are a California resident, you have the right to:</p>
              <ul>
                <li>
                  Know what personal information we collect, use, and share
                </li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of the sale of personal information (we do not sell your data)</li>
                <li>Non-discrimination for exercising your rights</li>
              </ul>
              <p>
                To exercise these rights, contact us at privacy@maneexchange.com.
              </p>
            </section>

            <section>
              <h2>6. Data Retention</h2>
              <p>
                We retain your account data for as long as your account is
                active. Transaction records are retained for 7 years for tax and
                legal compliance. You may request account deletion at any time,
                subject to legal retention requirements.
              </p>
            </section>

            <section>
              <h2>7. Security</h2>
              <p>
                We implement industry-standard security measures including
                encryption in transit (TLS) and at rest, row-level security
                policies on all database tables, and regular security audits.
                Financial data is processed and stored by Stripe — we do not
                store credit card numbers or bank account details on our
                servers.
              </p>
            </section>

            <section>
              <h2>8. Cookies</h2>
              <p>
                We use essential cookies for authentication and session
                management. We use analytics cookies (Vercel Analytics) to
                understand Platform usage. You may disable non-essential cookies
                in your browser settings.
              </p>
            </section>

            <section>
              <h2>9. Children&apos;s Privacy</h2>
              <p>
                The Platform is not intended for children under 13. Users between
                13-17 may use the Platform with parental consent but may not
                enter into transactions without a parent or guardian.
              </p>
            </section>

            <section>
              <h2>10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Material changes
                will be communicated via email or Platform notification at least
                30 days before taking effect.
              </p>
            </section>

            <section>
              <h2>11. Contact</h2>
              <p>
                For privacy-related questions or requests, contact us at
                privacy@maneexchange.com.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
