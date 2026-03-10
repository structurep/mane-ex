"use client";

import { useState } from "react";
import Image from "next/image";
import { removeMember, updateMemberRole } from "@/actions/barn";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/tailwind-plus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  trainer: "Trainer",
  staff: "Staff",
};

export function MemberList({
  members,
  farmId,
  isOwner,
  ownerId,
}: {
  members: Record<string, unknown>[];
  farmId: string;
  isOwner: boolean;
  ownerId: string;
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(userId: string) {
    if (!confirm("Remove this member from your barn?")) return;
    setRemoving(userId);
    await removeMember(farmId, userId);
    setRemoving(null);
    router.refresh();
  }

  async function handleRoleChange(memberId: string, role: string) {
    await updateMemberRole({ member_id: memberId, role });
    router.refresh();
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border-0 bg-paper-cream p-8 text-center shadow-flat">
        <User className="mx-auto mb-3 h-8 w-8 text-ink-light" />
        <p className="text-sm text-ink-mid">No team members yet.</p>
        <p className="mt-1 text-xs text-ink-light">
          Invite trainers, managers, and staff to your barn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const profile = member.profile as { display_name: string | null; avatar_url: string | null; email: string } | null;
        const memberId = member.id as string;
        const userId = member.user_id as string;
        const role = member.role as string;
        const title = member.title as string | null;
        const isMemberOwner = userId === ownerId;

        return (
          <div
            key={memberId}
            className="flex items-center gap-4 rounded-lg border-0 bg-paper-cream p-4 shadow-flat"
          >
            {/* Avatar */}
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name ?? "Member"}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-warm">
                <User className="h-5 w-5 text-ink-light" />
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink-black">
                  {profile?.display_name ?? profile?.email ?? "Unknown"}
                </span>
                <StatusBadge variant="indigo" dot={false}>
                  {ROLE_LABELS[role] ?? role}
                </StatusBadge>
              </div>
              {title && (
                <p className="text-xs text-ink-light">{title}</p>
              )}
            </div>

            {/* Actions */}
            {isOwner && !isMemberOwner && (
              <div className="flex items-center gap-2">
                <Select
                  defaultValue={role}
                  onValueChange={(val) => handleRoleChange(memberId, val)}
                >
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-ink-light hover:text-red"
                  onClick={() => handleRemove(userId)}
                  disabled={removing === userId}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
