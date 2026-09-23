import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type LoginHistoryRow = Database["public"]["Tables"]["login_history"]["Row"];

/** Repository for the signed-in user's profile row (RLS scopes every call). */
export const profilesRepository = {
  async getById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

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

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return publicUrl;
  },

  async deleteAvatar(userId: string): Promise<void> {
    // 1. List and remove any files under the user's storage folder
    const { data: files } = await supabase.storage
      .from("profile-photos")
      .list(userId);

    if (files && files.length > 0) {
      const pathsToDelete = files.map((file) => `${userId}/${file.name}`);
      const { error: storageError } = await supabase.storage
        .from("profile-photos")
        .remove(pathsToDelete);

      if (storageError) throw storageError;
    }

    // 2. Set avatar_url back to null in the database row
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    if (updateError) throw updateError;
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

export function displayName(profile?: Profile | null) {
  if (!profile) return "";
  if (profile.full_name?.trim()) return profile.full_name;
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
}

export function initialsFor(profile?: Profile | null) {
  if (!profile) return "U";

  // Check first_name and last_name explicitly (e.g., "Sri" + "Davileswaarapu" -> SS)
  if (profile.first_name?.trim() && profile.last_name?.trim()) {
    const firstInitial = profile.first_name.trim()[0] ?? "";
    const lastInitial = profile.last_name.trim()[0] ?? "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  // Fallback using display name splitting
  const name = displayName(profile);
  if (!name) return "U";

  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}