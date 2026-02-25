import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getInviteByToken } from "@/actions/barn";
import { InviteActions } from "./invite-actions";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Users, Calendar } from "lucide-react";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  const { invite, error } = await getInviteByToken(token);

  if (!invite || error) {
    notFound();
  }

  const farm = invite.farm as { name: string; slug: string } | null;
  const inviter = invite.inviter as { display_name: string | null } | null;
  const status = invite.status as string;
  const message = invite.message as string | null;
  const role = invite.role as string;
  const expiresAt = invite.expires_at as string;
  const isExpired = new Date(expiresAt) < new Date();

  // Check if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already responded
  if (status !== "pending") {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="mx-auto max-w-md rounded-lg border-0 bg-paper-cream p-8 text-center shadow-flat">
            <h1 className="font-serif text-2xl font-bold text-ink-black">
              Invite {status === "accepted" ? "Accepted" : status === "declined" ? "Declined" : "Expired"}
            </h1>
            <p className="mt-2 text-sm text-ink-mid">
              This invite has already been {status}.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Go to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="mx-auto max-w-md rounded-lg border-0 bg-paper-cream p-8 text-center shadow-flat">
            <h1 className="font-serif text-2xl font-bold text-ink-black">
              Invite Expired
            </h1>
            <p className="mt-2 text-sm text-ink-mid">
              This invite has expired. Ask the barn owner to send a new one.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in — redirect to login with return URL
  if (!user) {
    redirect(`/login?next=/invite/${token}`);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md rounded-lg border-0 bg-paper-cream p-8 shadow-flat">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink-black">
              Barn Invitation
            </h1>
            <p className="mt-2 text-sm text-ink-mid">
              {inviter?.display_name ?? "Someone"} invited you to join
            </p>
            <p className="mt-1 text-lg font-semibold text-ink-black">
              {farm?.name ?? "a barn"}
            </p>
          </div>

          {/* Details */}
          <div className="mb-6 space-y-2 rounded-md bg-paper-warm p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-light">Role</span>
              <span className="font-medium capitalize text-ink-black">{role}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-light">Expires</span>
              <span className="flex items-center gap-1 text-ink-mid">
                <Calendar className="h-3 w-3" />
                {new Date(expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-6 rounded-md border border-crease-light bg-paper-white p-4">
              <p className="text-xs font-medium text-ink-light">Message</p>
              <p className="mt-1 text-sm text-ink-mid">{message}</p>
            </div>
          )}

          <InviteActions token={token} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
