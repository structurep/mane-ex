"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite, declineInvite } from "@/actions/barn";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

export function InviteActions({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setPending("accept");
    setError(null);
    const result = await acceptInvite(token);
    if (result.error) {
      setError(result.error);
      setPending(null);
      return;
    }
    router.push("/dashboard/farm/members");
  }

  async function handleDecline() {
    if (!confirm("Are you sure you want to decline this invite?")) return;
    setPending("decline");
    setError(null);
    const result = await declineInvite(token);
    if (result.error) {
      setError(result.error);
      setPending(null);
      return;
    }
    router.push("/");
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-center text-sm text-red">{error}</p>
      )}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleDecline}
          disabled={pending !== null}
        >
          {pending === "decline" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <X className="mr-2 h-4 w-4" />
          )}
          Decline
        </Button>
        <Button
          className="flex-1"
          onClick={handleAccept}
          disabled={pending !== null}
        >
          {pending === "accept" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Accept & Join
        </Button>
      </div>
    </div>
  );
}
