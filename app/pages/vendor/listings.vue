<script setup lang="ts">
import { useAuth } from "~/stores/auth";

const client = useSupabaseClient();
const auth = useAuth();

definePageMeta({
  layout: "vendor",
  middleware: "auth",
});

interface IVenue {
  id: number;
  venue_name: string;
  photos: string[];
  user_id: string;
  [key: string]: any;
}

// Initialize auth store if needed
onMounted(async () => {
  if (!auth.hydrated) {
    await auth.init();
  }
});

// Computed property for venues
const venues = computed(() => data.value || []);

// Fetch only venues belonging to the current user
const { data, error, refresh } = await useAsyncData<IVenue[] | null>(
  "user-venues",
  async () => {
    // Wait for auth to be ready
    if (!auth.user?.id) {
      return null;
    }

    const { data, error } = await client
      .from("venues")
      .select("*")
      .eq("user_id", auth.user.id);

    if (error) {
      console.error("Error fetching user venues:", error);
      return null;
    }

    return data || null;
  },
  {
    // Only fetch when we have a user
    default: () => null,
    // Refresh when auth state changes
    watch: [() => auth.user?.id],
  }
);

// Watch for auth changes and refresh data
watch(
  () => auth.user?.id,
  async (newUserId) => {
    if (newUserId) {
      await refresh();
    }
  }
);
</script>

<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          My Listings
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Manage your venue listings
        </p>
      </div>
      <UButton
        color="primary"
        variant="solid"
        icon="i-heroicons-plus"
        to="/new-venue"
        size="lg"
      >
        Add Venue
      </UButton>
    </div>

    <!-- Loading state -->
    <div
      v-if="!auth.hydrated || (!data && !error)"
      class="text-center py-16"
    >
      <div class="flex flex-col items-center gap-3">
        <UIcon
          name="i-lucide-loader-2"
          class="w-12 h-12 animate-spin text-primary"
        />
        <p class="text-sm text-gray-500">Loading your venues...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-16">
      <div class="flex flex-col items-center gap-3">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-12 h-12 text-red-500"
        />
        <p class="text-red-600">Failed to load venues</p>
        <UButton @click="refresh()" variant="outline">Try Again</UButton>
      </div>
    </div>

    <!-- No venues state -->
    <div
      v-else-if="!venues || venues.length === 0"
      class="text-center py-24"
    >
      <div class="flex flex-col items-center gap-4">
        <UIcon
          name="i-heroicons-building-storefront"
          class="w-20 h-20 text-gray-400"
        />
        <h3 class="text-2xl font-semibold text-gray-900">No venues yet</h3>
        <p class="text-gray-600 max-w-md">
          Ready to list your first venue? Add your space and start hosting
          amazing events.
        </p>
        <UButton
          color="primary"
          variant="solid"
          icon="i-heroicons-plus"
          to="/new-venue"
          size="lg"
        >
          Add Your First Venue
        </UButton>
      </div>
    </div>

    <!-- Venues grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="venue in venues"
        :key="venue.id.toString()"
        class="group bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
      >
        <!-- Edit Button - Shows on hover -->
        <div
          class="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <UButton
            icon="i-heroicons-pencil-square"
            color="primary"
            variant="solid"
            size="sm"
            square
            class="shadow-md hover:shadow-lg rounded-full"
            :to="`/venues/edit/${venue.id.toString()}`"
          />
        </div>

        <NuxtLink :to="`/venues/${venue.id.toString()}`" class="block">
          <div class="relative w-full h-56">
            <!-- Image -->
            <NuxtImg
              :src="
                venue.photos && venue.photos.length > 0
                  ? venue.photos[0]
                  : '/default.jpg'
              "
              alt="Venue Image"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <!-- Gradient Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
            />

            <!-- Venue Name Overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3
                class="text-white text-lg font-bold drop-shadow-lg"
              >
                {{ venue.venue_name }}
              </h3>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
