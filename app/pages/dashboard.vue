<script setup lang="ts">
import { useAuth } from "~/stores/auth";

const client = useSupabaseClient();
const auth = useAuth();

definePageMeta({
  layout: "dashboard", // This will use layouts/admin.vue
  middleware: "auth", // Protect this route with auth middleware
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
      console.log("No authenticated user found");
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

    console.log(`Found ${data?.length || 0} venues for user ${auth.user.id}`);
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

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});
</script>

<template>
  <UDashboardPanel id="today">
    <template #header>
      <UDashboardNavbar title="My Venues">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            variant="solid"
            icon="i-heroicons-plus"
            to="/new-venue"
          >
            Add Venue
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <div class="container mx-auto p-4 max-w-[1228px] mt-28">
            <!-- Loading state -->
            <div
              v-if="!auth.hydrated || (!data && !error)"
              class="text-center py-8"
            >
              <div class="flex flex-col items-center gap-3">
                <UIcon
                  name="i-lucide-loader-2"
                  class="w-8 h-8 animate-spin text-primary"
                />
                <p class="text-sm text-gray-500">Loading your venues...</p>
              </div>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="text-center py-8">
              <div class="flex flex-col items-center gap-3">
                <UIcon
                  name="i-heroicons-exclamation-triangle"
                  class="w-8 h-8 text-red-500"
                />
                <p class="text-red-600">Failed to load venues</p>
                <UButton @click="refresh()" variant="outline"
                  >Try Again</UButton
                >
              </div>
            </div>

            <!-- No venues state -->
            <div
              v-else-if="!venues || venues.length === 0"
              class="text-center py-16"
            >
              <div class="flex flex-col items-center gap-4">
                <UIcon
                  name="i-heroicons-building-storefront"
                  class="w-16 h-16 text-gray-400"
                />
                <h3 class="text-xl font-semibold text-gray-900">
                  No venues yet
                </h3>
                <p class="text-gray-600 max-w-md">
                  Ready to list your first venue? Add your space and start
                  hosting amazing events.
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
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 -mt-24 gap-8"
            >
              <div
                v-for="venue in venues"
                :key="venue.id.toString()"
                class="group bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] relative"
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
                  <div class="relative w-full h-48">
                    <!-- Image -->
                    <NuxtImg
                      :src="
                        venue.photos && venue.photos.length > 0
                          ? venue.photos[0]
                          : '/default.jpg'
                      "
                      alt="Venue Image"
                      class="w-full h-48 object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
                    />

                    <!-- Light Overlay -->
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <span
                        class="text-dark-900 text-lg font-bold text-center bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg transition-all duration-300 hover:bg-white/70"
                      >
                        {{ venue.venue_name }}
                      </span>
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
