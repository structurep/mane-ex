"use client";

import { StatusBadge } from "@/components/tailwind-plus";
import { Clock, Mail } from "lucide-react";

export function PendingInvites({
  invites,
}: {
  invites: Record<string, unknown>[];
}) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-mid">
        <Clock className="h-4 w-4" />
        Pending Invites ({invites.length})
      </h2>
      <div className="space-y-2">
        {invites.map((invite) => {
          const email = invite.invited_email as string;
          const role = invite.role as string;
          const daysLeft = invite.days_left as number;

          return (
            <div
              key={invite.id as string}
              className="flex items-center gap-3 rounded-lg border border-dashed border-crease-light bg-paper-white p-3"
            >
              <Mail className="h-4 w-4 text-ink-light" />
              <div className="min-w-0 flex-1">
                <span className="text-sm text-ink-black">{email}</span>
                <StatusBadge variant="indigo" dot={false} className="ml-2">
                  {role}
                </StatusBadge>
              </div>
              <span className="text-xs text-ink-light">
                {daysLeft > 0 ? `${daysLeft}d left` : "Expiring"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
