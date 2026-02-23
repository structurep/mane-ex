"use client";

import { useActionState } from "react";
import { signIn, signInWithMagicLink, signInWithGoogle, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
      <div className="rounded-lg border border-forest/20 bg-forest/5 p-6 text-center">
        <p className="font-medium text-forest">Check your email</p>
        <p className="mt-1 text-sm text-ink-mid">
          We sent you a magic link to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <Button
          type="submit"
          variant="outline"
          className="w-full"
        >
          Continue with Google
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="crease-divider w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-paper-white px-3 text-xs text-ink-light">
            or
          </span>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 rounded-lg bg-paper-warm p-1">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "password"
              ? "bg-paper-white text-ink-black shadow-flat"
              : "text-ink-mid"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "magic"
              ? "bg-paper-white text-ink-black shadow-flat"
              : "text-ink-mid"
          }`}
        >
          Magic Link
        </button>
      </div>

      {/* Error */}
      {state.error && (
        <p className="rounded-md bg-red-light p-3 text-sm text-red">
          {state.error}
        </p>
      )}

      {/* Password form */}
      {mode === "password" && (
        <form action={passwordAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="overline mb-1.5 block text-ink-mid">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input-swiss w-full"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="overline mb-1.5 block text-ink-mid"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input-swiss w-full"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      )}

      {/* Magic link form */}
      {mode === "magic" && (
        <form action={magicAction} className="space-y-4">
          <div>
            <label htmlFor="magic-email" className="overline mb-1.5 block text-ink-mid">
              Email
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input-swiss w-full"
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending..." : "Send Magic Link"}
          </Button>
        </form>
      )}
    </div>
  );
}
