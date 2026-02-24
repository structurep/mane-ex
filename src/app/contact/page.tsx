import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomCTA } from "@/components/bottom-cta";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the ManeExchange team. Questions about buying, selling, payments, or your account — we're here to help.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="with-grain bg-gradient-hero px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="overline mb-3 text-red">CONTACT US</p>
            <h1 className="mb-4 text-4xl tracking-tight text-ink-black md:text-5xl">
              Get in touch.
            </h1>
            <p className="text-lead mx-auto max-w-2xl text-ink-mid">
              Have a question about ManeExchange? We&apos;re here to help.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="bg-paper-cream section-premium">
          <div className="mx-auto max-w-[1200px] grid gap-12 md:grid-cols-[320px_1fr]">
            {/* Left Sidebar */}
            <div>
              {/* Contact Info Cards */}
              <div className="flex items-start gap-3 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-light">
                  <Mail className="h-5 w-5 text-red" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-ink-black">Email</h3>
                  <a
                    href="mailto:support@maneexchange.com"
                    className="rounded-sm text-sm text-ink-mid hover:text-blue focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                  >
                    support@maneexchange.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-light">
                  <Phone className="h-5 w-5 text-red" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-ink-black">Phone</h3>
                  <a
                    href="tel:+15615550123"
                    className="rounded-sm text-sm text-ink-mid hover:text-blue focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                  >
                    (561) 555-0123
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-light">
                  <MapPin className="h-5 w-5 text-red" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-ink-black">
                    Location
                  </h3>
                  <p className="text-sm text-ink-mid">Wellington, FL</p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-10 border-t border-crease-light pt-8">
                <h3 className="mb-4 text-sm font-medium text-ink-black">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/faq"
                    className="block rounded-sm text-sm text-blue hover:underline focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                  >
                    Visit our FAQ
                  </Link>
                  <Link
                    href="/trust"
                    className="block rounded-sm text-sm text-blue hover:underline focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                  >
                    Trust &amp; Safety
                  </Link>
                  <Link
                    href="/trust"
                    className="block rounded-sm text-sm text-blue hover:underline focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                  >
                    Report a Problem
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="rounded-lg border-0 bg-paper-white p-6 shadow-folded md:p-8">
              <h2 className="mb-6 font-heading text-xl font-semibold text-ink-black">
                Send us a message
              </h2>
              <form className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-black">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                    className="w-full rounded-lg border-0 bg-paper-cream px-4 py-3 text-sm text-ink-black shadow-flat placeholder:text-ink-light focus:shadow-folded focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-black">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-lg border-0 bg-paper-cream px-4 py-3 text-sm text-ink-black shadow-flat placeholder:text-ink-light focus:shadow-folded focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-black">
                    Subject
                  </label>
                  <select
                    name="subject"
                    required
                    className="w-full rounded-lg border border-border bg-paper-white px-4 py-3 text-sm text-ink-black focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="buying">Buying Question</option>
                    <option value="selling">Selling Question</option>
                    <option value="payment">Payment Issue</option>
                    <option value="report">Report a Problem</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-black">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="How can we help?"
                    required
                    className="w-full rounded-lg border-0 bg-paper-cream px-4 py-3 text-sm text-ink-black shadow-flat placeholder:text-ink-light focus:shadow-folded focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none resize-none"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </section>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
