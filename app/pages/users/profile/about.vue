<template>
  <div class="p-6">
    <div class="space-y-6">
      <!-- Profile Header -->
      <div class="flex items-start gap-6 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <UAvatar
          :src="avatarUrl"
          :alt="displayName"
          size="3xl"
          class="ring-4 ring-gray-100 dark:ring-gray-800"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {{ displayName }}
            </h1>
            <UBadge
              v-if="auth.user?.email_confirmed_at"
              color="green"
              variant="soft"
              label="Verified"
            />
          </div>
          <p class="text-gray-600 dark:text-gray-400 mb-3">{{ auth.user?.email }}</p>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Member since {{ memberSince }}
          </div>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-pencil-square-20-solid"
          label="Edit Profile"
          class="cursor-pointer"
          @click="isEditing = !isEditing"
        />
      </div>

      <!-- About Information -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          About
        </h2>

        <div v-if="!isEditing" class="space-y-4">
          <div v-if="profile?.bio">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Bio
            </h3>
            <p class="mt-1 text-gray-900 dark:text-gray-100">{{ profile.bio }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="profile?.location">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Location
              </h3>
              <p class="mt-1 text-gray-900 dark:text-gray-100">{{ profile.location }}</p>
            </div>

            <div v-if="profile?.website">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Website
              </h3>
              <a
                :href="profile.website"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-1 text-blue-600 dark:text-blue-400 hover:underline"
              >
                {{ profile.website }}
              </a>
            </div>

            <div v-if="profile?.company">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Company
              </h3>
              <p class="mt-1 text-gray-900 dark:text-gray-100">{{ profile.company }}</p>
            </div>

            <div v-if="profile?.phone">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Phone
              </h3>
              <p class="mt-1 text-gray-900 dark:text-gray-100">{{ profile.phone }}</p>
            </div>
          </div>

          <div v-if="!profile?.bio && !profile?.location && !profile?.website && !profile?.company && !profile?.phone" class="text-center py-8">
            <UIcon name="i-heroicons-user-circle" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Complete your profile
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              Add some information about yourself to help others get to know you better.
            </p>
            <UButton
              color="primary"
              icon="i-heroicons-pencil-square-20-solid"
              label="Edit Profile"
              class="cursor-pointer"
              @click="isEditing = true"
            />
          </div>
        </div>

        <!-- Edit Form -->
        <form v-else @submit.prevent="saveProfile" class="space-y-4">
          <UFormGroup label="Bio" description="Tell others about yourself">
            <UTextarea
              v-model="editForm.bio"
              placeholder="Write a brief bio..."
              :rows="4"
            />
          </UFormGroup>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Location">
              <UInput
                v-model="editForm.location"
                placeholder="City, Country"
              />
            </UFormGroup>

            <UFormGroup label="Website">
              <UInput
                v-model="editForm.website"
                placeholder="https://yourwebsite.com"
              />
            </UFormGroup>

            <UFormGroup label="Company">
              <UInput
                v-model="editForm.company"
                placeholder="Your company name"
              />
            </UFormGroup>

            <UFormGroup label="Phone">
              <UInput
                v-model="editForm.phone"
                placeholder="+1 (555) 123-4567"
              />
            </UFormGroup>
          </div>

          <div class="flex gap-3 pt-4">
            <UButton
              type="submit"
              color="primary"
              icon="i-heroicons-check"
              label="Save Changes"
              class="cursor-pointer"
              :loading="isSaving"
            />
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              label="Cancel"
              class="cursor-pointer"
              @click="cancelEdit"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/stores/auth";

const auth = useAuth();
const supabase = useSupabaseClient();

const isEditing = ref(false);
const isSaving = ref(false);

// Get avatar URL with fallback
const avatarUrl = computed(() => {
  return (
    auth.profile?.picUrl ||
    auth.profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      auth.profile?.name || auth.user?.email || "User"
    )}&background=FFBE61&color=000000&bold=true`
  );
});

// Get display name with fallback
const displayName = computed(() => {
  return auth.profile?.name || auth.user?.email || "User";
});

// Get member since date
const memberSince = computed(() => {
  if (auth.user?.created_at) {
    return new Date(auth.user.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }
  return "Unknown";
});

// Profile data
const profile = computed(() => auth.profile);

// Edit form
const editForm = ref({
  bio: "",
  location: "",
  website: "",
  company: "",
  phone: "",
});

// Initialize edit form with current profile data
const initEditForm = () => {
  editForm.value = {
    bio: profile.value?.bio || "",
    location: profile.value?.location || "",
    website: profile.value?.website || "",
    company: profile.value?.company || "",
    phone: profile.value?.phone || "",
  };
};

// Watch for profile changes to initialize edit form
watch(() => profile.value, initEditForm, { immediate: true });

// Save profile changes
const saveProfile = async () => {
  if (!auth.user?.id) return;

  isSaving.value = true;
  try {
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: auth.user.id,
        ...editForm.value,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Refresh the profile data
    await auth.fetchProfile();

    useToast().add({
      title: "Success",
      description: "Profile updated successfully",
      color: "green",
    });

    isEditing.value = false;
  } catch (error) {
    console.error("Error updating profile:", error);
    useToast().add({
      title: "Error",
      description: "Failed to update profile",
      color: "red",
    });
  } finally {
    isSaving.value = false;
  }
};

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false;
  initEditForm();
};
</script>