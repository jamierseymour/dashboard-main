<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useAuth } from "~/stores/auth";

definePageMeta({
  layout: "dashboard", // This will use layouts/admin.vue
  // middleware: "auth", // Assuming you have auth middleware to protect this route
});

const fileRef = ref<HTMLInputElement>();
const auth = useAuth();
const loading = ref(false);

// Initialize auth store if needed
onMounted(async () => {
  if (!auth.hydrated.value) {
    await auth.init();
  }
});

const profileSchema = z.object({
  name: z.string().min(2, "Too short"),
  email: z.string().email("Invalid email"),
  username: z.string().min(2, "Too short"),
  avatar_url: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileSchema = z.output<typeof profileSchema>;

// Create a reactive profile object that gets populated from the store
const profile = reactive<ProfileSchema>({
  name: auth.profile.value?.name || "",
  email: auth.profile.value?.email || "",
  username: auth.profile.value?.username || "",
  avatar_url: auth.profile.value?.avatar_url || "",
  bio: auth.profile.value?.bio || "",
});

// Watch for changes in the auth store and update the local profile
watch(
  () => auth.profile.value,
  (newProfile) => {
    if (newProfile) {
      profile.name = newProfile.name || "";
      profile.email = newProfile.email || "";
      profile.username = newProfile.username || "";
      profile.avatar_url = newProfile.avatar_url || "";
      profile.bio = newProfile.bio || "";
    }
  },
  { immediate: true }
);

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  loading.value = true;

  try {
    const result = await auth.updateProfile(event.data);

    if (result.error) {
      throw new Error(result.error.toString());
    }

    toast.add({
      title: "Success",
      description: "Your profile has been updated.",
      icon: "i-lucide-check",
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to update profile",
      icon: "i-lucide-alert-triangle",
      color: "danger",
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

  try {
    loading.value = true;
    const result = await auth.uploadAvatar(file);

    if (result.error) {
      throw new Error(result.error.toString());
    }

    // The avatar_url will be updated via the watcher when the store updates
  } catch (error) {
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to upload avatar",
      icon: "i-lucide-alert-triangle",
      color: "danger",
    });
  } finally {
    loading.value = false;
  }
}

function onFileClick() {
  fileRef.value?.click();
}
</script>

<template>
  <div v-if="loading || auth.loading.value" class="flex justify-center py-8">
    <ULoader size="lg" />
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
      description="These informations will be displayed publicly."
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

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="Name"
        description="Will appear on receipts, invoices, and other communication."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.name" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Email"
        description="Used to sign in, for email receipts and product updates."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.email" type="email" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="Username"
        description="Your unique username for logging in and your profile URL."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.username" type="username" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar_url"
        label="Avatar"
        description="JPG, GIF or PNG. 1MB Max."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar :src="profile.avatar_url" :alt="profile.name" size="lg" />
          <UButton
            label="Choose"
            color="neutral"
            :loading="loading"
            @click="onFileClick"
          />
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
      <UFormField
        name="bio"
        label="Bio"
        description="Brief description for your profile. URLs are hyperlinked."
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea v-model="profile.bio" :rows="5" autoresize class="w-full" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
