"use client";

import { useActionState } from "react";
import { signIn, signInWithMagicLink, signInWithGoogle, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertBanner } from "@/components/tailwind-plus";
import { Mail } from "lucide-react";

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [passwordState, passwordAction, passwordPending] = useActionState<AuthState, FormData>(
    signIn,
    {}
  );
  const [magicState, magicAction, magicPending] = useActionState<AuthState, FormData>(
    signInWithMagicLink,
    {}
  );

  const state = mode === "password" ? passwordState : magicState;
  const pending = mode === "password" ? passwordPending : magicPending;

  if (magicState.success) {
    return (
      <AlertBanner variant="success" title="Check your email">
        <p>We sent you a magic link to sign in. It expires in 10 minutes.</p>
      </AlertBanner>
    );
  }

  return (
    <div className="space-y-5">
      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <Button
          type="submit"
          variant="outline"
          className="w-full h-11 gap-2 text-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-crease-light" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-paper-cream px-3 text-xs text-ink-faint">
            or sign in with email
          </span>
        </div>
      </div>

      {/* Mode toggle — underline tabs */}
      <div className="flex border-b border-crease-light">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 border-b-2 pb-2.5 text-sm font-medium transition-colors ${
            mode === "password"
              ? "border-navy text-navy"
              : "border-transparent text-ink-faint hover:text-ink-mid"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex-1 border-b-2 pb-2.5 text-sm font-medium transition-colors ${
            mode === "magic"
              ? "border-navy text-navy"
              : "border-transparent text-ink-faint hover:text-ink-mid"
          }`}
        >
          <Mail className="mr-1.5 inline h-3.5 w-3.5" />
          Magic Link
        </button>
      </div>

      {/* Error */}
      {state.error && (
        <AlertBanner variant="error" title="Sign in failed">
          <p>{state.error}</p>
        </AlertBanner>
      )}

      {/* Password form */}
      {mode === "password" && (
        <form action={passwordAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-ink-faint">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-10 w-full rounded-lg border border-crease-light bg-paper-white px-3 text-sm text-ink-dark placeholder:text-ink-faint focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-ink-faint"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-10 w-full rounded-lg border border-crease-light bg-paper-white px-3 text-sm text-ink-dark placeholder:text-ink-faint focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      )}

      {/* Magic link form */}
      {mode === "magic" && (
        <form action={magicAction} className="space-y-4">
          <div>
            <label htmlFor="magic-email" className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-ink-faint">
              Email
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-10 w-full rounded-lg border border-crease-light bg-paper-white px-3 text-sm text-ink-dark placeholder:text-ink-faint focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={pending}>
            {pending ? "Sending..." : "Send Magic Link"}
          </Button>
        </form>
      )}
    </div>
  );
}
