<script setup lang="ts">
import type { BookingWithDetails } from "~/types/booking";

const auth = useAuth();
const client = useSupabaseClient();

const { data: bookingsData, status: loadingStatus } = useAsyncData<
  BookingWithDetails[] | null
>(
  "user-bookings",
  async () => {
    if (!auth.user?.id) {
      return null;
    }

    try {
      const { data, error } = await client
        .from("bookings")
        .select(
          `
          *,
          venue:venues!venue_id (
            id,
            venue_name,
            company_name,
            photos,
            address
          )
        `,
        )
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching viewing requests:", error);
        return null;
      }

      return (data as BookingWithDetails[]) || null;
    }
    catch (err) {
      console.error("Unexpected error fetching viewing requests:", err);
      return null;
    }
  },
  {
    default: () => null,
    lazy: true,
    server: false,
    watch: [() => auth.user?.id],
  },
);

const userBookings = computed(() => bookingsData.value || []);

const activeStatus = ref("all");
const filteredBookings = computed(() => {
  if (activeStatus.value === "upcoming") {
    return userBookings.value.filter(
      b =>
        new Date(b.check_in_date) > new Date() &&
        b.booking_status !== "cancelled",
    );
  }
  if (activeStatus.value === "confirmed") {
    return userBookings.value.filter(b => b.booking_status === "confirmed");
  }
  if (activeStatus.value === "pending") {
    return userBookings.value.filter(b => b.booking_status === "pending");
  }
  return userBookings.value;
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "success";
    case "pending": return "warning";
    case "cancelled":
    case "declined": return "error";
    case "completed": return "primary";
    default: return "neutral";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        My Viewing Requests
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Track your venue viewing requests
      </p>
    </div>

    <!-- Status Filter -->
    <UCard class="mb-6">
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        <UButton
          v-for="tab in [
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Confirmed' },
          ]"
          :key="tab.key"
          :variant="activeStatus === tab.key ? 'solid' : 'ghost'"
          :color="activeStatus === tab.key ? 'primary' : 'neutral'"
          size="sm"
          class="cursor-pointer"
          @click="activeStatus = tab.key"
        >
          {{ tab.label }}
        </UButton>
      </div>
    </UCard>

    <!-- Loading State -->
    <div v-if="loadingStatus === 'pending'" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
    </div>

    <!-- Requests List -->
    <div v-else class="space-y-4">
      <div
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col md:flex-row">
          <!-- Image -->
          <div class="md:w-64 h-48 md:h-auto flex-shrink-0">
            <img
              :src="booking.venue?.photos?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f29da8dd8f?w=400'"
              :alt="booking.venue?.venue_name || 'Venue'"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <UBadge
                    :color="getStatusColor(booking.booking_status)"
                    variant="subtle"
                    class="capitalize"
                  >
                    {{ booking.booking_status }}
                  </UBadge>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {{ booking.venue?.venue_name || "Venue" }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ booking.venue?.company_name || "" }}
                </p>
              </div>
              <div class="text-right text-sm text-gray-500">
                {{ booking.number_of_guests }} guests
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div class="text-xs text-gray-500 uppercase mb-1">Viewing date</div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(booking.check_in_date) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500 uppercase mb-1">Event date</div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(booking.check_out_date) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500 uppercase mb-1">Requested on</div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(booking.created_at) }}
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton
                size="sm"
                variant="solid"
                color="primary"
                class="cursor-pointer"
                :to="`/venues/${booking.venue_id}`"
              >
                View Venue
              </UButton>
              <UButton
                v-if="booking.booking_status === 'pending'"
                size="sm"
                variant="soft"
                color="error"
                class="cursor-pointer"
              >
                Cancel Request
              </UButton>
              <UButton
                v-if="booking.booking_status === 'confirmed'"
                size="sm"
                variant="soft"
                color="neutral"
                class="cursor-pointer"
              >
                Contact Host
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredBookings.length === 0"
        class="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <UIcon
          name="i-heroicons-calendar-days"
          class="h-16 w-16 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No viewing requests found
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          You haven't requested any venue viewings yet.
        </p>
        <UButton color="primary" to="/venues" class="cursor-pointer">
          Browse Venues
        </UButton>
      </div>
    </div>
  </div>
</template>
