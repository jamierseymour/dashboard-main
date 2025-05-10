// stores/auth.ts
import { defineStore } from "pinia";
import { useSupabaseClient } from "#imports";
import type { User } from "@supabase/supabase-js";

interface IAuth {
  modal: boolean;
  hydrated: boolean;
  user: User | null;
  profile: {
    id?: string;
    name?: string;
    email?: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
  } | null;
  loading: boolean;
}

export const useAuth = defineStore("auth", () => {
  const supabase = useSupabaseClient();

  const state = reactive<IAuth>({
    modal: false,
    hydrated: false,
    user: null,
    profile: null,
    loading: false,
  });

  // Initialize the auth state on app load
  async function init() {
    try {
      state.loading = true;

      // Get the session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        state.user = session.user;
        // Load user profile once authenticated
        await fetchUserProfile();
      }

      state.hydrated = true;
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      state.loading = false;
    }
  }

  // Fetch user profile data from profiles table
  async function fetchUserProfile() {
    if (!state.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, username, avatar_url, bio")
        .eq("id", state.user.id)
        .single();

      if (error) throw error;
      state.profile = data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  // Update user profile in Supabase
  async function updateProfile(profileData: Partial<IAuth["profile"]>) {
    if (!state.user?.id) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", state.user.id);

      if (error) throw error;

      // Refresh profile data
      await fetchUserProfile();
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { error };
    }
  }

  // Upload avatar image to Supabase storage
  async function uploadAvatar(file: File) {
    if (!state.user?.id) return { error: "Not authenticated" };

    try {
      // Create a unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${state.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update the profile with new avatar URL
      await updateProfile({ avatar_url: data.publicUrl });
      return { publicUrl: data.publicUrl };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return { error };
    }
  }

  // Sign out
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      state.user = null;
      state.profile = null;
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  // Toggle auth modal
  function toggleModal(value?: boolean) {
    state.modal = value !== undefined ? value : !state.modal;
  }

  return {
    ...toRefs(state),
    init,
    fetchUserProfile,
    updateProfile,
    uploadAvatar,
    signOut,
    toggleModal,
  };
});
