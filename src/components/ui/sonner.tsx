"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-paper-cream)",
          border: "1px solid var(--color-crease-light)",
          color: "var(--color-ink-black)",
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          boxShadow: "var(--shadow-folded)",
        },
        classNames: {
          success: "!border-[var(--color-forest)]",
          error: "!border-[var(--color-red)]",
        },
      }}
    />
  );
}
