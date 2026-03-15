import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { AuthLayout } from "@/components/tailwind-plus";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your ManeExchange account.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      headline={
        <>
          Where serious
          <br />horse people trade.
        </>
      }
      subContent={
        <p className="text-sm leading-relaxed text-paper-white/60">
          Bank-grade escrow. Verified sellers. Pre-purchase exams.
          ManeExchange is the safest way to buy and sell horses online.
        </p>
      }
      title="Welcome back"
      subtitle="Sign in to your ManeExchange account"
      footer={
        <p className="mt-6 text-center text-sm text-ink-mid lg:text-left">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-saddle hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
