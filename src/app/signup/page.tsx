import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SignupWizard } from "./signup-wizard";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your ManeExchange account. Buy or sell horses with confidence.",
};

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-paper-white px-4 py-12">
        <div className="w-full max-w-md">
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
            <h1 className="text-2xl font-bold text-ink-black">
              Join ManeExchange
            </h1>
            <p className="mt-1 text-sm text-ink-mid">
              The trusted equestrian marketplace
            </p>
          </div>
          <SignupWizard />
          <p className="mt-6 text-center text-sm text-ink-mid">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-red hover:underline"
            >
              Log in
            </Link>
          </p>
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
        </div>
      </main>
      <Footer />
    </>
  );
}
