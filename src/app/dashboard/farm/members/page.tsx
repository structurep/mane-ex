import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMembers, getPendingInvites } from "@/actions/barn";
import { MemberList } from "./member-list";
import { InviteForm } from "./invite-form";
import { PendingInvites } from "./pending-invites";

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's farm
  const { data: farm } = await supabase
    .from("farms")
    .select("id, name, owner_id")
    .eq("owner_id", user.id)
    .single();

  if (!farm) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
            Members
          </h1>
          <p className="mt-1 text-sm text-ink-mid">
            Create a barn page first to manage team members.
          </p>
        </div>
      </div>
    );
  }

  const isOwner = farm.owner_id === user.id;

  const [membersResult, invitesResult] = await Promise.all([
    getMembers(farm.id),
    isOwner ? getPendingInvites(farm.id) : Promise.resolve({ invites: [] }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
            Members
          </h1>
          <p className="mt-1 text-sm text-ink-mid">
            Manage your barn team at {farm.name}.
          </p>
        </div>
        {isOwner && <InviteForm farmId={farm.id} />}
      </div>

      {/* Pending Invites */}
      {isOwner && invitesResult.invites.length > 0 && (
        <PendingInvites invites={invitesResult.invites} />
      )}

      {/* Member List */}
      <MemberList
        members={membersResult.members}
        farmId={farm.id}
        isOwner={isOwner}
        ownerId={farm.owner_id}
      />
    </div>
  );
}
