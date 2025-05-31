// stores/auth.ts
import { defineStore } from "pinia";
import { useSupabaseClient } from "#imports";
import type { User } from "@supabase/supabase-js";

type ProfileData = {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
};

interface IAuth {
  modal: boolean;
  hydrated: boolean;
  loggedIn: boolean;
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
}

export const useAuth = defineStore("auth", () => {
  const supabase = useSupabaseClient();

  const state = reactive<IAuth>({
    modal: false,
    hydrated: false,
    loggedIn: false,
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
        state.loggedIn = true;
        // Load user profile once authenticated
        await fetchUserProfile();
      } else {
        state.user = null;
        state.loggedIn = false;
        state.profile = null;
      }

      state.hydrated = true;

      // Set up auth state listener for real-time updates
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          state.user = session.user;
          state.loggedIn = true;
          await fetchUserProfile();
          // Close auth modal on successful login
          state.modal = false;
        } else if (event === "SIGNED_OUT") {
          state.user = null;
          state.loggedIn = false;
          state.profile = null;
        }
      });
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

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.code === "42P01") {
          console.warn(
            "Profiles table doesn't exist yet. Create it in Supabase to enable profile features."
          );
          return;
        }
        throw error;
      }
      state.profile = data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Don't throw here - user can still be authenticated without profile data
    }
  }

  // Update user profile in Supabase
  async function updateProfile(profileData: any) {
    if (!state.user?.id) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("profiles")
        // @ts-ignore - Supabase type configuration issue
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
      state.loggedIn = false;
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
