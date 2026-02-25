"use server";

import { createClient } from "@/lib/supabase/server";
import { inviteMemberSchema, updateMemberSchema } from "@/lib/validators/barn";

export type BarnActionState = {
  error?: string;
  success?: boolean;
};

export async function inviteMember(
  data: { farm_id: string; email: string; role?: string; title?: string; message?: string; can_list_horses?: boolean; can_manage_messages?: boolean }
): Promise<BarnActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const parsed = inviteMemberSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  // Verify caller is farm owner or manager
  const { data: farm } = await supabase
    .from("farms")
    .select("id, owner_id")
    .eq("id", parsed.data.farm_id)
    .single();

  if (!farm) return { error: "Farm not found." };

  const isOwner = farm.owner_id === user.id;
  if (!isOwner) {
    const { data: staff } = await supabase
      .from("farm_staff")
      .select("role")
      .eq("farm_id", farm.id)
      .eq("user_id", user.id)
      .single();

    if (!staff || staff.role !== "manager") {
      return { error: "Only farm owners and managers can invite members." };
    }
  }

  // Check if user already exists with this email
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .single();

  // Check for duplicate invite
  const inviteQuery = supabase
    .from("barn_invites")
    .select("id")
    .eq("farm_id", parsed.data.farm_id)
    .eq("status", "pending");

  if (existingProfile) {
    // Also check if already a member
    const { data: existingMember } = await supabase
      .from("farm_staff")
      .select("id")
      .eq("farm_id", parsed.data.farm_id)
      .eq("user_id", existingProfile.id)
      .single();

    if (existingMember) return { error: "This person is already a member." };

    const { data: dup } = await inviteQuery
      .eq("invited_user_id", existingProfile.id)
      .single();
    if (dup) return { error: "An invite is already pending for this person." };
  } else {
    const { data: dup } = await inviteQuery
      .eq("invited_email", parsed.data.email)
      .single();
    if (dup) return { error: "An invite is already pending for this email." };
  }

  const { error } = await supabase.from("barn_invites").insert({
    farm_id: parsed.data.farm_id,
    invited_by: user.id,
    invited_email: parsed.data.email,
    invited_user_id: existingProfile?.id ?? null,
    role: parsed.data.role,
    title: parsed.data.title ?? null,
    can_list_horses: parsed.data.can_list_horses,
    can_manage_messages: parsed.data.can_manage_messages,
    message: parsed.data.message ?? null,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function acceptInvite(
  token: string
): Promise<BarnActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Find invite by token
  const { data: invite } = await supabase
    .from("barn_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invite) return { error: "Invite not found or already used." };

  // Check expiry
  if (new Date(invite.expires_at) < new Date()) {
    await supabase
      .from("barn_invites")
      .update({ status: "expired" })
      .eq("id", invite.id);
    return { error: "This invite has expired." };
  }

  // Add to farm_staff
  const { error: staffError } = await supabase.from("farm_staff").insert({
    farm_id: invite.farm_id,
    user_id: user.id,
    role: invite.role,
    title: invite.title,
    can_list_horses: invite.can_list_horses,
    can_manage_messages: invite.can_manage_messages,
  });

  if (staffError) {
    if (staffError.code === "23505") {
      return { error: "You are already a member of this barn." };
    }
    return { error: staffError.message };
  }

  // Mark invite as accepted
  await supabase
    .from("barn_invites")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", invite.id);

  return { success: true };
}

export async function declineInvite(
  token: string
): Promise<BarnActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("barn_invites")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("token", token)
    .eq("status", "pending");

  if (error) return { error: error.message };
  return { success: true };
}

export async function removeMember(
  farmId: string,
  userId: string
): Promise<BarnActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Verify caller is farm owner
  const { data: farm } = await supabase
    .from("farms")
    .select("owner_id")
    .eq("id", farmId)
    .single();

  if (!farm || farm.owner_id !== user.id) {
    return { error: "Only farm owners can remove members." };
  }

  const { error } = await supabase
    .from("farm_staff")
    .delete()
    .eq("farm_id", farmId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateMemberRole(
  data: { member_id: string; role?: string; title?: string; can_list_horses?: boolean; can_manage_messages?: boolean }
): Promise<BarnActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const parsed = updateMemberSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  // Get the member's farm to verify ownership
  const { data: member } = await supabase
    .from("farm_staff")
    .select("farm_id")
    .eq("id", parsed.data.member_id)
    .single();

  if (!member) return { error: "Member not found." };

  const { data: farm } = await supabase
    .from("farms")
    .select("owner_id")
    .eq("id", member.farm_id)
    .single();

  if (!farm || farm.owner_id !== user.id) {
    return { error: "Only farm owners can update member roles." };
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.role) updates.role = parsed.data.role;
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.can_list_horses !== undefined) updates.can_list_horses = parsed.data.can_list_horses;
  if (parsed.data.can_manage_messages !== undefined) updates.can_manage_messages = parsed.data.can_manage_messages;

  const { error } = await supabase
    .from("farm_staff")
    .update(updates)
    .eq("id", parsed.data.member_id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getMembers(
  farmId: string
): Promise<{ members: Record<string, unknown>[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("farm_staff")
    .select("*, profile:profiles(display_name, avatar_url, email)")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: true });

  if (error) return { members: [], error: error.message };
  return { members: data ?? [] };
}

export async function getPendingInvites(
  farmId: string
): Promise<{ invites: Record<string, unknown>[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barn_invites")
    .select("*")
    .eq("farm_id", farmId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return { invites: [], error: error.message };

  const now = Date.now();
  const enriched = (data ?? []).map((invite) => ({
    ...invite,
    days_left: Math.max(
      0,
      Math.ceil(
        (new Date(invite.expires_at as string).getTime() - now) /
          (1000 * 60 * 60 * 24)
      )
    ),
  }));
  return { invites: enriched };
}

export async function getInviteByToken(
  token: string
): Promise<{ invite: Record<string, unknown> | null; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barn_invites")
    .select("*, farm:farms(name, slug), inviter:profiles!barn_invites_invited_by_fkey(display_name)")
    .eq("token", token)
    .single();

  if (error) return { invite: null, error: error.message };
  return { invite: data };
}

export async function leaveBarn(
  farmId: string
): Promise<BarnActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Can't leave if you're the owner
  const { data: farm } = await supabase
    .from("farms")
    .select("owner_id")
    .eq("id", farmId)
    .single();

  if (farm?.owner_id === user.id) {
    return { error: "Farm owners cannot leave their own farm. Transfer ownership first." };
  }

  const { error } = await supabase
    .from("farm_staff")
    .delete()
    .eq("farm_id", farmId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
