import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your ManeExchange account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-white px-4 py-12">
      <div className="w-full max-w-sm">
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
          <h1 className="text-2xl font-bold text-ink-black">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-mid">
            Log in to your ManeExchange account
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-ink-mid">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-red hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
