<script setup lang="ts">
import type { BookingWithDetails } from "~/types/booking";

definePageMeta({
  layout: "vendor",
  middleware: "auth",
});

const client = useSupabaseClient();
const auth = useAuth();

const stats = ref({
  total: 0,
  upcoming: 0,
  confirmed: 0,
  declined: 0,
});

const { data: vendorBookingsData, status: loadingStatus } = useAsyncData<
  BookingWithDetails[] | null
>(
  "vendor-bookings",
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
        .eq("venue_owner_id", auth.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching viewing requests:", error);
        return null;
      }

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((b: BookingWithDetails) => b.user_id))];

        const { data: guestsData, error: guestsError } = await client
          .from("users")
          .select("user_id, email, name, avatar_url")
          .in("user_id", userIds);

        if (!guestsError && guestsData) {
          type GuestRow = { user_id: string; email: string; name: string; avatar_url: string };
          const guestsMap = new Map((guestsData as GuestRow[]).map(g => [g.user_id, g]));
          return data.map((booking: BookingWithDetails) => ({
            ...booking,
            guest: guestsMap.get(booking.user_id) || null,
          })) as BookingWithDetails[];
        }
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
  },
);

const bookings = computed(() => vendorBookingsData.value || []);

watchEffect(() => {
  const current = bookings.value;
  if (current.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    stats.value = {
      total: current.length,
      upcoming: current.filter(
        b =>
          new Date(b.check_in_date) >= today &&
          b.booking_status !== "cancelled" &&
          b.booking_status !== "declined",
      ).length,
      confirmed: current.filter(b => b.booking_status === "confirmed").length,
      declined: current.filter(
        b => b.booking_status === "cancelled" || b.booking_status === "declined",
      ).length,
    };
  }
});

const activeTab = ref("all");
const filteredBookings = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (activeTab.value === "upcoming") {
    return bookings.value.filter(
      b =>
        new Date(b.check_in_date) >= today &&
        b.booking_status !== "cancelled" &&
        b.booking_status !== "declined",
    );
  }
  if (activeTab.value === "confirmed") {
    return bookings.value.filter(b => b.booking_status === "confirmed");
  }
  if (activeTab.value === "pending") {
    return bookings.value.filter(b => b.booking_status === "pending");
  }
  return bookings.value;
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
    month: "short",
    day: "numeric",
  });
};

const selectedBooking = ref<BookingWithDetails | null>(null);
const isModalOpen = ref(false);

const viewBooking = (booking: BookingWithDetails) => {
  selectedBooking.value = booking;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  setTimeout(() => {
    selectedBooking.value = null;
  }, 300);
};

const acceptBooking = async (bookingId: string) => {
  try {
    const query = client
      .from("bookings")
      .update({
        booking_status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", bookingId);
    const { error } = await query;

    if (error) throw error;

    await refreshNuxtData("vendor-bookings");
    closeModal();

    useToast().add({
      title: "Viewing confirmed",
      description: "You have accepted this viewing request.",
      color: "success",
    });
  }
  catch (error) {
    console.error("Error accepting viewing request:", error);
    useToast().add({
      title: "Error",
      description: "Failed to accept viewing request. Please try again.",
      color: "error",
    });
  }
};

const declineBooking = async (bookingId: string) => {
  try {
    const query = client
      .from("bookings")
      .update({
        booking_status: "declined",
        cancelled_at: new Date().toISOString(),
        cancelled_by: "host",
      })
      .eq("id", bookingId);
    const { error } = await query;

    if (error) throw error;

    await refreshNuxtData("vendor-bookings");
    closeModal();

    useToast().add({
      title: "Request declined",
      description: "The viewing request has been declined.",
      color: "success",
    });
  }
  catch (error) {
    console.error("Error declining viewing request:", error);
    useToast().add({
      title: "Error",
      description: "Failed to decline viewing request. Please try again.",
      color: "error",
    });
  }
};
</script>

<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Viewing Requests
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Manage incoming viewing requests and leads
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
            <p class="text-2xl font-bold">{{ stats.total }}</p>
          </div>
          <UIcon name="i-heroicons-calendar-days" class="h-8 w-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.upcoming }}</p>
          </div>
          <UIcon name="i-heroicons-clock" class="h-8 w-8 text-green-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
            <p class="text-2xl font-bold text-blue-600">{{ stats.confirmed }}</p>
          </div>
          <UIcon name="i-heroicons-check-circle" class="h-8 w-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Declined</p>
            <p class="text-2xl font-bold text-red-600">{{ stats.declined }}</p>
          </div>
          <UIcon name="i-heroicons-x-circle" class="h-8 w-8 text-red-500" />
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
        <UButton
          v-for="tab in [
            { key: 'all', label: 'All Requests' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Confirmed' },
          ]"
          :key="tab.key"
          :variant="activeTab === tab.key ? 'solid' : 'ghost'"
          :color="activeTab === tab.key ? 'primary' : 'neutral'"
          size="sm"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </UButton>
      </div>
    </UCard>

    <!-- Requests Table -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{
              activeTab === "all" ? "All Requests"
              : activeTab === "upcoming" ? "Upcoming Viewings"
              : activeTab === "pending" ? "Pending Requests"
              : "Confirmed Viewings"
            }}
          </h3>
          <span class="text-sm text-gray-500">{{ filteredBookings.length }} requests</span>
        </div>
      </template>

      <div v-if="loadingStatus === 'pending'" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6" />
      </div>

      <div v-else-if="filteredBookings.length === 0" class="text-center py-8">
        <UIcon name="i-heroicons-calendar-days" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No viewing requests found
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          No requests match the current filter.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Venue &amp; Enquirer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Details
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Viewing Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="booking in filteredBookings"
              :key="booking.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ booking.venue?.venue_name || "N/A" }}
                </div>
                <div class="text-sm text-gray-500">{{ booking.guest?.name || "Guest" }}</div>
                <div class="text-xs text-gray-400">{{ booking.guest?.email || "N/A" }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ booking.number_of_guests }} guests
                </div>
                <div v-if="booking.accommodation_needed > 0" class="text-xs text-gray-500">
                  Accommodation required
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(booking.check_in_date) }}
                </div>
                <div class="text-xs text-gray-500">
                  Event: {{ formatDate(booking.check_out_date) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getStatusColor(booking.booking_status)"
                  variant="subtle"
                  class="capitalize"
                >
                  {{ booking.booking_status }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <UButton
                    size="sm"
                    variant="ghost"
                    icon="i-heroicons-eye"
                    class="cursor-pointer"
                    @click="viewBooking(booking)"
                  >
                    View
                  </UButton>
                  <UButton
                    v-if="booking.booking_status === 'pending' && booking.id"
                    size="sm"
                    variant="soft"
                    icon="i-heroicons-calendar-days"
                    color="success"
                    class="cursor-pointer"
                    @click="acceptBooking(booking.id)"
                  >
                    Accept
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Viewing Request Details Modal -->
    <VendorBookingDetailsModal
      :booking="selectedBooking"
      :is-open="isModalOpen"
      @close="closeModal"
      @accept="acceptBooking"
      @decline="declineBooking"
    />
  </div>
</template>
