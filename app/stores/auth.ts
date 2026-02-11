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
  event_updates?: boolean;
  terms_accepted?: boolean;
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
    // Prevent multiple initializations
    if (state.hydrated) {
      return;
    }

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

      // Set up auth state listener for real-time updates (only once)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          state.user = session.user;
          state.loggedIn = true;
          await fetchUserProfile();
          // Close auth modal on successful login
          state.modal = false;
          // Resolve any waiting auth promises
          resolveAuthPromise(true);
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

  // Fetch user profile data from users table
  async function fetchUserProfile() {
    if (!state.user?.id) return;

    try {
      const { data, error } = await (supabase.from("users") as any)
        .select(
          "id, name, email, created_at, avatar_url, bio, event_updates, terms_accepted",
        )
        .eq("id", state.user.id)
        .single();

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.code === "42P01") {
          console.warn(
            "Users table doesn't exist yet. Create it in Supabase to enable profile features.",
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
      const { error } = await (supabase.from("users") as any)
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

      // Upload the file to Supabase storage with timeout
      const uploadPromise = supabase.storage
        .from("profile-images")
        .upload(filePath, file);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Upload timeout - please check your storage configuration",
              ),
            ),
          30000,
        ),
      );

      const { data: uploadData, error: uploadError } = (await Promise.race([
        uploadPromise,
        timeoutPromise,
      ])) as any;

      if (uploadError) {
        console.error("Upload error:", uploadError);

        // Check for common storage issues
        if (
          uploadError.message?.includes("bucket") ||
          uploadError.message?.includes("not found")
        ) {
          throw new Error(
            "Storage bucket not configured. Please create an 'avatars' bucket in Supabase Storage.",
          );
        }

        if (
          uploadError.message?.includes("policy") ||
          uploadError.message?.includes("permission")
        ) {
          throw new Error(
            "Storage permissions not configured. Please check your RLS policies.",
          );
        }

        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }

      // Update the profile with new avatar URL
      const updateResult = await updateProfile({ avatar_url: data.publicUrl });

      if (updateResult?.error) {
        console.error(
          "Failed to update profile with new avatar URL:",
          updateResult.error,
        );
        throw new Error("Avatar uploaded but failed to update profile");
      }

      return { publicUrl: data.publicUrl };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown upload error",
      };
    }
  }

  // Sign in existing user
  async function signIn(email: string, password: string) {
    try {
      state.loading = true;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Login failed");
      }

      // Auth state will be updated automatically by the listener
      // but we can also update it here for immediate feedback
      state.user = data.user;
      state.loggedIn = true;

      // Fetch user profile
      await fetchUserProfile();

      // Close modal on successful login
      state.modal = false;

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return { error };
    } finally {
      state.loading = false;
    }
  }

  const setVendorStatus = async () => {
    if (!state.user?.id) return;

    try {
      // Just refresh profile - vendor status not needed for now
      await fetchUserProfile();
    } catch (error) {
      console.error("Error updating vendor status:", error);
    }
  };

  // Sign up new user
  async function signUp(userData: {
    email: string;
    password: string;
    name: string;
    eventUpdates: boolean;
    termsAccepted: boolean;
  }) {
    try {
      state.loading = true;

      // Step 1: Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              event_updates: userData.eventUpdates,
            },
          },
        },
      );

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("User registration failed");
      }

      // Step 2: Create user profile in users table
      try {
        const { error: profileError } = await (
          supabase.from("users") as any
        ).insert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          event_updates: userData.eventUpdates,
          terms_accepted: userData.termsAccepted,
          bio: "",
        });

        if (profileError) {
          console.warn("Profile creation failed:", profileError);
          // Don't throw here - auth user was created successfully
        }
      } catch (profileError) {
        console.warn("Users table might not exist:", profileError);
        // Continue - the trigger should handle profile creation
      }

      // Step 3: Update auth state
      state.user = authData.user;
      state.loggedIn = true;

      // Step 4: Fetch the created profile
      await fetchUserProfile();

      // Step 5: Close modal on successful signup
      state.modal = false;

      return { success: true, user: authData.user };
    } catch (error) {
      console.error("Signup error:", error);
      return { error };
    } finally {
      state.loading = false;
    }
  }

  // Sign out
  async function signOut() {
    try {
      // Try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("Supabase signOut error (will clear local state anyway):", error);
      }
    } catch (error) {
      // Log the error but don't throw - we still want to clear local state
      console.warn("Error signing out from Supabase (will clear local state anyway):", error);
    } finally {
      // ALWAYS clear local state, even if Supabase signOut fails
      // This ensures users can logout even if their account was deleted
      state.user = null;
      state.loggedIn = false;
      state.profile = null;
      // Keep hydrated = true to avoid re-initialization delays on next navigation

      // Force clear any lingering Supabase session data from localStorage
      try {
        // Clear all Supabase auth keys from localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (storageError) {
        console.warn("Error clearing localStorage:", storageError);
      }

      // Navigate to home page
      navigateTo('/');
    }
  }

  // Sign in with OAuth (Google, Facebook, etc.)
  async function signInWithOAuth(provider: "google" | "facebook") {
    try {
      state.loading = true;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // OAuth redirect will happen automatically
      // Auth state will be updated via the onAuthStateChange listener after redirect
      return { success: true };
    } catch (error) {
      console.error(`${provider} login error:`, error);
      return { error };
    } finally {
      state.loading = false;
    }
  }

  // Toggle auth modal
  function toggleModal(value?: boolean) {
    const previousModalState = state.modal;
    state.modal = value !== undefined ? value : !state.modal;

    // If modal is being closed and there's a waiting promise, resolve it with false
    if (
      previousModalState === true &&
      state.modal === false &&
      authPromiseResolve
    ) {
      resolveAuthPromise(false);
    }
  }

  // Promise-based authentication for async operations
  let authPromiseResolve: ((value: boolean) => void) | null = null;

  function waitForAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      // If already logged in, resolve immediately
      if (state.loggedIn) {
        resolve(true);
        return;
      }

      // Store the resolve function to be called after auth
      authPromiseResolve = resolve;

      // Open the auth modal
      state.modal = true;
    });
  }

  // Call this when auth succeeds to resolve the waiting promise
  function resolveAuthPromise(success: boolean) {
    if (authPromiseResolve) {
      authPromiseResolve(success);
      authPromiseResolve = null;
    }
  }

  return {
    ...toRefs(state),
    init,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    fetchUserProfile,
    updateProfile,
    uploadAvatar,
    toggleModal,
    waitForAuth,
    resolveAuthPromise,
    setVendorStatus,
  };
});
