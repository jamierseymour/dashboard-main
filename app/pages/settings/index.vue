<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useAuth } from "~/stores/auth";

definePageMeta({
  layout: "dashboard", // This will use layouts/admin.vue
  middleware: "auth", // Protect this route with auth middleware
});

const fileRef = ref<HTMLInputElement>();
const auth = useAuth();
const loading = ref(false);

// Initialize auth store if needed
onMounted(async () => {
  if (!auth.hydrated) {
    await auth.init();
  }
});

const profileSchema = z.object({
  name: z.string().min(2, "Too short"),
  email: z.string().email("Invalid email"),
  username: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileSchema = z.output<typeof profileSchema>;

// Create a reactive profile object that gets populated from the store
const profile = reactive<ProfileSchema>({
  name: "",
  email: "",
  username: "",
  bio: "",
});

// Computed property for avatar URL that checks both picUrl and avatar_url
const avatarUrl = computed(() => {
  return auth.profile?.picUrl || auth.profile?.avatar_url || "";
});

// Watch for changes in the auth store and update the local profile
watch(
  () => auth.profile,
  (newProfile) => {
    if (newProfile) {
      profile.name = newProfile.name || "";
      profile.email = newProfile.email || auth.user?.email || "";
      profile.username = newProfile.username || "";
      profile.bio = newProfile.bio || "";
    } else if (auth.user) {
      // If no profile but user exists, use user data
      profile.email = auth.user.email || "";
      profile.name = auth.user.user_metadata?.name || "";
    }
  },
  { immediate: true }
);

// Also watch for user changes in case profile isn't loaded yet
watch(
  () => auth.user,
  (newUser) => {
    if (newUser && !auth.profile) {
      profile.email = newUser.email || "";
      profile.name = newUser.user_metadata?.name || "";
    }
  },
  { immediate: true }
);

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  loading.value = true;

  try {
    const result = await auth.updateProfile(event.data);

    if (result?.error) {
      throw new Error(result.error.toString());
    }

    toast.add({
      title: "Success",
      description: "Your profile has been updated.",
      icon: "i-lucide-check",
      color: "success",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to update profile",
      icon: "i-lucide-alert-triangle",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  const file = input.files[0]!;

  // Validate file size (1MB max)
  if (file.size > 1024 * 1024) {
    toast.add({
      title: "Error",
      description: "File size must be less than 1MB",
      icon: "i-lucide-alert-triangle",
      color: "error",
    });
    return;
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    toast.add({
      title: "Error",
      description: "Please upload a valid image file (JPG, PNG, or GIF)",
      icon: "i-lucide-alert-triangle",
      color: "error",
    });
    return;
  }

  console.log("Starting file upload:", file.name, file.type, file.size);

  try {
    loading.value = true;

    // Add a timeout wrapper to prevent infinite loading
    const uploadPromise = auth.uploadAvatar(file);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Upload is taking too long. Please try again.")),
        60000
      )
    );

    const result = (await Promise.race([uploadPromise, timeoutPromise])) as any;

    if (result?.error) {
      console.error("Upload failed:", result.error);
      throw new Error(result.error);
    }

    console.log("Upload successful:", result);

    toast.add({
      title: "Success",
      description: "Profile photo updated successfully",
      icon: "i-lucide-check",
      color: "success",
    });

    // Clear the file input
    if (fileRef.value) {
      fileRef.value.value = "";
    }
  } catch (error) {
    console.error("Avatar upload error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload avatar";

    // Show specific error messages for common issues
    let userMessage = errorMessage;
    if (errorMessage.includes("bucket not configured")) {
      userMessage =
        "Image upload is not configured yet. Please contact support.";
    } else if (errorMessage.includes("permissions")) {
      userMessage = "Permission denied. Please contact support.";
    } else if (errorMessage.includes("timeout")) {
      userMessage =
        "Upload is taking too long. Please check your connection and try again.";
    } else if (errorMessage.includes("size")) {
      userMessage = "File is too large. Please use an image smaller than 1MB.";
    }

    toast.add({
      title: "Upload Failed",
      description: userMessage,
      icon: "i-lucide-alert-triangle",
      color: "error",
    });

    // Clear the file input on error
    if (fileRef.value) {
      fileRef.value.value = "";
    }
  } finally {
    loading.value = false;
  }
}

function onFileClick() {
  fileRef.value?.click();
}
</script>

<template>
  <div v-if="loading || auth.loading" class="flex justify-center py-8">
    <div class="flex flex-col items-center gap-3">
      <UIcon
        name="i-lucide-loader-2"
        class="w-8 h-8 animate-spin text-primary"
      />
      <p class="text-sm text-gray-500">Loading profile...</p>
    </div>
  </div>

  <UForm
    v-else
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Profile"
      description="This information will be displayed publicly."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Save changes"
        color="primary"
        type="submit"
        :loading="loading"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle" class="max-w-4xl">
      <div class="space-y-8">
        <!-- Avatar Field - Moved to top -->
        <UFormField
          name="avatar"
          label="Profile Photo"
          description="JPG, GIF or PNG. 1MB Max."
          class="space-y-3"
        >
          <div class="flex flex-wrap items-center gap-4">
            <UAvatar
              :src="avatarUrl"
              :alt="profile.name || 'User Avatar'"
              size="xl"
            />
            <div class="flex flex-col gap-2">
              <UButton
                label="Choose File"
                color="neutral"
                :loading="loading"
                @click="onFileClick"
                size="lg"
              />
              <p class="text-sm text-gray-500">Max file size: 1MB</p>
            </div>
            <input
              ref="fileRef"
              type="file"
              class="hidden"
              accept=".jpg, .jpeg, .png, .gif"
              @change="onFileChange"
            />
          </div>
        </UFormField>

        <USeparator />

        <!-- Name Field -->
        <UFormField
          name="name"
          label="Name"
          description="Will appear on receipts, invoices, and other communication."
          required
          class="space-y-3"
        >
          <UInput
            v-model="profile.name"
            autocomplete="off"
            size="lg"
            class="w-full max-w-md"
          />
        </UFormField>

        <USeparator />

        <!-- Email Field -->
        <UFormField
          name="email"
          label="Email"
          description="Used to sign in, for email receipts and product updates."
          required
          class="space-y-3"
        >
          <UInput
            v-model="profile.email"
            type="email"
            autocomplete="off"
            size="lg"
            class="w-full max-w-lg"
          />
        </UFormField>

        <USeparator />

        <!-- Username Field -->
        <UFormField
          name="username"
          label="Username"
          description="Your unique username for logging in and your profile URL."
          class="space-y-3"
        >
          <UInput
            v-model="profile.username"
            autocomplete="off"
            placeholder="Optional"
            size="lg"
            class="w-full max-w-md"
          />
        </UFormField>

        <USeparator />

        <!-- Bio Field -->
        <UFormField
          name="bio"
          label="Bio"
          description="Brief description for your profile. URLs are hyperlinked."
          class="space-y-3"
        >
          <UTextarea
            v-model="profile.bio"
            :rows="6"
            autoresize
            placeholder="Tell us about yourself..."
            class="w-full max-w-2xl"
            size="lg"
          />
        </UFormField>

        <!-- Bottom Save Button -->
        <div
          class="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <UButton
            form="settings"
            label="Save Changes"
            color="primary"
            type="submit"
            :loading="loading"
            size="lg"
            class="px-8"
          />
        </div>
      </div>
    </UPageCard>
  </UForm>
</template>
