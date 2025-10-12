<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const client = useSupabaseClient();

// Get user ID from route params
const userId = computed(() => route.params.id as string);

// Fetch user profile data
const { data: userProfile, status: loadingStatus } = useAsyncData(
  `user-profile-${userId.value}`,
  async () => {
    try {
      const { data, error } = await (client
        .from("users")
        .select("*")
        .eq("user_id", userId.value)
        .single() as any);

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Unexpected error fetching user profile:", err);
      return null;
    }
  },
  {
    default: () => null,
    lazy: true,
    server: false,
  },
);

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Get avatar URL with fallback
const avatarUrl = computed(() => {
  if (!userProfile.value) return "";
  return (
    userProfile.value.picUrl ||
    userProfile.value.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userProfile.value.name || "User",
    )}&background=FFBE61&color=000000&bold=true&size=200`
  );
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="loadingStatus === 'pending'" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="!userProfile" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <UIcon name="i-heroicons-user-circle" class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          User Not Found
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          The user profile you're looking for doesn't exist.
        </p>
        <UButton
          color="primary"
          icon="i-heroicons-arrow-left"
          @click="$router.back()"
        >
          Go Back
        </UButton>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Back Button -->
      <div class="mb-6">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          size="sm"
          class="cursor-pointer"
          @click="$router.back()"
        >
          Back
        </UButton>
      </div>

      <!-- Profile Header Card -->
      <UCard class="mb-6">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <img
              :src="avatarUrl"
              :alt="userProfile.name || 'User'"
              class="w-32 h-32 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
            />
          </div>

          <!-- User Info -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ userProfile.name || "User" }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
                  {{ userProfile.email || "N/A" }}
                </p>
              </div>
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-if="userProfile.is_vendor"
                color="primary"
                variant="subtle"
                size="lg"
              >
                <UIcon name="i-heroicons-building-office" class="w-4 h-4 mr-1" />
                Venue Host
              </UBadge>
              <UBadge
                v-if="userProfile.is_service_provider"
                color="success"
                variant="subtle"
                size="lg"
              >
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 mr-1" />
                Service Provider
              </UBadge>
              <UBadge
                color="neutral"
                variant="subtle"
                size="lg"
              >
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1" />
                Member since {{ formatDate(userProfile.created_at) }}
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Bio Section -->
      <UCard v-if="userProfile.bio" class="mb-6">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5" />
            About
          </h2>
        </template>
        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {{ userProfile.bio }}
        </p>
      </UCard>

      <!-- Additional Information Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Account Information -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
              Account Information
            </h2>
          </template>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Username</p>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ userProfile.username || "Not set" }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
              <p class="font-medium text-gray-900 dark:text-white">
                <span v-if="userProfile.is_vendor && userProfile.is_service_provider">
                  Venue Host & Service Provider
                </span>
                <span v-else-if="userProfile.is_vendor">
                  Venue Host
                </span>
                <span v-else-if="userProfile.is_service_provider">
                  Service Provider
                </span>
                <span v-else>
                  Guest
                </span>
              </p>
            </div>
          </div>
        </UCard>

        <!-- Activity -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
              Activity
            </h2>
          </template>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ formatDate(userProfile.created_at) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ formatDate(userProfile.updated_at) }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Contact Section (if vendor or service provider) -->
      <UCard
        v-if="userProfile.is_vendor || userProfile.is_service_provider"
        class="mt-6"
      >
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-envelope" class="w-5 h-5" />
            Contact
          </h2>
        </template>
        <div class="flex flex-col sm:flex-row gap-4">
          <UButton
            color="primary"
            icon="i-heroicons-envelope"
            size="lg"
            class="cursor-pointer"
            :to="`mailto:${userProfile.email}`"
            external
          >
            Send Email
          </UButton>
          <UButton
            v-if="userProfile.is_vendor"
            color="neutral"
            variant="outline"
            icon="i-heroicons-building-office"
            size="lg"
            class="cursor-pointer"
          >
            View Venues
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
