import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "./login-form";
import { Lock, Shield, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your ManeExchange account.",
};

export default function LoginPage() {
  return (
    <div className="with-grain flex min-h-screen flex-col items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-sm">
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
          <h1 className="font-serif text-3xl tracking-tight text-ink-black md:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-ink-mid">
            Sign in to your ManeExchange account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg bg-paper-cream p-6 shadow-folded md:p-8">
          <LoginForm />
        </div>

        {/* Switch to signup */}
        <p className="mt-6 text-center text-sm text-ink-mid">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-ink-light">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-gold" />
            Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-forest" />
            Stripe KYC
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}
