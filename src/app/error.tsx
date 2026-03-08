"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-crease-light">Hmm</p>
        <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight text-ink-black">
          Something didn&apos;t go as planned
        </h1>
        <p className="mt-2 text-sm text-ink-mid">
          This isn&apos;t your fault. Our team has been notified and we&apos;re looking into it.
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-ink-light">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
