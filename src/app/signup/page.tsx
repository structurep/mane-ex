import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SignupWizard } from "./signup-wizard";
import { AuthLayout } from "@/components/tailwind-plus";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your ManeExchange account. Verified documentation, secured transactions, institutional-grade trust.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      headline={
        <>
          The standard for
          <br />equine transactions.
        </>
      }
      subContent={
        <ul className="mt-2 space-y-3 text-sm text-paper-white/60">
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
            Bank-grade escrow on every transaction
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
            Verified seller identities via Stripe KYC
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
            5-day inspection period on every purchase
          </li>
        </ul>
      }
      title="Create Your Account"
      subtitle="Join the marketplace trusted by serious horse people"
      footer={
        <>
          <p className="mt-6 text-center text-sm text-ink-mid lg:text-left">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-oxblood hover:underline"
            >
              Log in
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-ink-faint lg:text-left">
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
        </>
      }
    >
      <SignupWizard />
    </AuthLayout>
  );
}
