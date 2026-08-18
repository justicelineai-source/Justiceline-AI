import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type LoginHistoryRow = Database["public"]["Tables"]["login_history"]["Row"];

/** Repository for the signed-in user's profile row (RLS scopes every call). */
export const profilesRepository = {
  async getById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(userId: string, patch: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
};

/** Repository for the signed-in user's login history. */
export const loginHistoryRepository = {
  async listRecent(userId: string, limit = 20): Promise<LoginHistoryRow[]> {
    const { data, error } = await supabase
      .from("login_history")
      .select("*")
      .eq("user_id", userId)
      .order("login_time", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },
};

export function displayName(profile: Profile | null) {
  if (!profile) return "";
  return (
    profile.full_name ??
    [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ??
    ""
  );
}

export function initialsFor(profile: Profile | null) {
  const name = displayName(profile);
  if (!name) return "JL";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
