import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SignupWizard } from "./signup-wizard";
import { Lock, Shield, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your ManeExchange account. Buy or sell horses with confidence.",
};

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="with-grain flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center bg-gradient-hero px-4 py-16">
        <div className="w-full max-w-md">
          {/* Logo + heading */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Image
                src="/icon.svg"
                alt="ManeExchange"
                width={48}
                height={48}
                className="mx-auto mb-4"
              />
            </Link>
            <h1 className="text-3xl tracking-tight text-ink-black md:text-4xl">
              Join ManeExchange
            </h1>
            <p className="mt-2 text-sm text-ink-mid">
              The trusted equestrian marketplace
            </p>
          </div>

          {/* Card */}
          <div className="rounded-lg bg-paper-cream p-6 shadow-folded md:p-8">
            <SignupWizard />
          </div>

          {/* Switch to login */}
          <p className="mt-6 text-center text-sm text-ink-mid">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-red hover:underline"
            >
              Log in
            </Link>
          </p>

          {/* Legal + trust */}
          <p className="mt-4 text-center text-xs text-ink-light">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-ink-light">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Stripe KYC
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
