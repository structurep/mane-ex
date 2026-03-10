import { getAdminUsers } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, EmptyState } from "@/components/tailwind-plus";
import { Shield, AlertTriangle, Users } from "lucide-react";
import { SuspendUserButton } from "./suspend-button";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const users = await getAdminUsers(search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          User Management
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          {users.length} users{search ? ` matching "${search}"` : ""}
        </p>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          name="search"
          type="text"
          placeholder="Search by name or email..."
          defaultValue={search || ""}
          className="input-swiss flex-1"
        />
        <button
          type="submit"
          className="rounded-md bg-paddock px-4 py-2 text-sm font-medium text-white hover:bg-ink-dark"
        >
          Search
        </button>
      </form>

      {/* User list */}
      <div className="space-y-3">
        {users.map(
          (user: {
            id: string;
            display_name: string | null;
            email: string | null;
            created_at: string;
            is_admin: boolean;
            suspended_at: string | null;
            suspension_reason: string | null;
            subscription_status: string | null;
          }) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-warm text-sm font-medium text-ink-mid">
                    {(user.display_name || user.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-black">
                        {user.display_name || "No name"}
                      </span>
                      {user.is_admin && (
                        <StatusBadge variant="gold">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </StatusBadge>
                      )}
                      {user.suspended_at && (
                        <StatusBadge variant="red">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Suspended
                        </StatusBadge>
                      )}
                    </div>
                    <p className="text-xs text-ink-light">
                      {user.email} &middot; Joined{" "}
                      {new Date(user.created_at).toLocaleDateString()}
                      {user.subscription_status &&
                        user.subscription_status !== "none" && (
                          <> &middot; {user.subscription_status}</>
                        )}
                    </p>
                    {user.suspended_at && user.suspension_reason && (
                      <p className="mt-1 text-xs text-red">
                        Reason: {user.suspension_reason}
                      </p>
                    )}
                  </div>
                </div>

                {!user.is_admin && (
                  <SuspendUserButton
                    userId={user.id}
                    isSuspended={!!user.suspended_at}
                  />
                )}
              </CardContent>
            </Card>
          )
        )}

        {users.length === 0 && (
          <EmptyState icon={<Users className="size-10" />} title="No users found" description={search ? `No results for "${search}".` : "No users in the system yet."} />
        )}
      </div>
    </div>
  );
}
