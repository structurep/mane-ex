"use client";

import { useActionState, use } from "react";
import { signUp, signInWithGoogle, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function SignupForm({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = use(searchParams);
  const defaultRole = params.role || "buyer";
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});

  if (state.success) {
    return (
      <div className="rounded-lg border border-forest/20 bg-forest/5 p-6 text-center">
        <p className="font-medium text-forest">Check your email</p>
        <p className="mt-1 text-sm text-ink-mid">
          We sent you a confirmation link. Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full">
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

      {/* Error */}
      {state.error && (
        <p className="rounded-md bg-red-light p-3 text-sm text-red">
          {state.error}
        </p>
      )}

      <form action={action} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="overline mb-2 block text-ink-mid">
            I want to
          </label>
          <div className="flex gap-1 rounded-lg bg-paper-warm p-1">
            {[
              { value: "buyer", label: "Buy" },
              { value: "seller", label: "Sell" },
              { value: "trainer", label: "Train" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex-1 cursor-pointer text-center"
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  defaultChecked={option.value === defaultRole}
                  className="peer sr-only"
                />
                <span className="block rounded-md px-3 py-1.5 text-sm font-medium text-ink-mid transition-colors peer-checked:bg-paper-white peer-checked:text-ink-black peer-checked:shadow-flat">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="full_name" className="overline mb-1.5 block text-ink-mid">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            className="input-swiss w-full"
            placeholder="Your full name"
          />
        </div>

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
          <label htmlFor="password" className="overline mb-1.5 block text-ink-mid">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input-swiss w-full"
            placeholder="8+ characters"
          />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
