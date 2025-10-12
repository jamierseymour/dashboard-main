<script setup lang="ts">
import type { BookingWithDetails } from "~/types/booking";

definePageMeta({
  layout: "vendor",
  middleware: "auth",
});

const client = useSupabaseClient();
const auth = useAuth();

// Reactive data
const stats = ref({
  total: 0,
  upcoming: 0,
  completed: 0,
  cancelled: 0,
  revenue: 0,
});

// Fetch bookings for venues owned by the current user (vendor view)
const { data: vendorBookingsData, status: loadingStatus } = useAsyncData<
  BookingWithDetails[] | null
>(
  "vendor-bookings",
  async () => {
    // Wait for auth to be ready
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
        console.error("Error fetching vendor bookings:", error);
        return null;
      }

      // Fetch guest profiles separately for each booking
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((b: any) => b.user_id))];

        const { data: guestsData, error: guestsError } = await client
          .from("users")
          .select("user_id, email, name, avatar_url")
          .in("user_id", userIds);

        if (!guestsError && guestsData) {
          // Map guests to bookings
          const guestsMap = new Map(guestsData.map((g: any) => [g.user_id, g]));

          return data.map((booking: any) => ({
            ...booking,
            guest: guestsMap.get(booking.user_id) || null,
          })) as BookingWithDetails[];
        }
      }

      return (data as BookingWithDetails[]) || null;
    } catch (err) {
      console.error("Unexpected error fetching bookings:", err);
      return null;
    }
  },
  {
    default: () => null,
    lazy: true,
    server: false,
  },
);

// Compute bookings array from fetched data
const bookings = computed(() => vendorBookingsData.value || []);

// Calculate stats from real data
watchEffect(() => {
  const currentBookings = bookings.value;
  if (currentBookings.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    stats.value = {
      total: currentBookings.length,
      upcoming: currentBookings.filter(
        (b) =>
          new Date(b.check_in_date) >= today &&
          b.booking_status !== "cancelled" &&
          b.booking_status !== "declined",
      ).length,
      completed: currentBookings.filter((b) => b.booking_status === "completed")
        .length,
      cancelled: currentBookings.filter(
        (b) =>
          b.booking_status === "cancelled" || b.booking_status === "declined",
      ).length,
      revenue: currentBookings
        .filter((b) => b.booking_status === "completed")
        .reduce((sum, b) => sum + Number(b.total_amount), 0),
    };
  }
});

// Filter bookings
const activeTab = ref("all");
const filteredBookings = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (activeTab.value === "upcoming") {
    return bookings.value.filter(
      (b) =>
        new Date(b.check_in_date) >= today &&
        b.booking_status !== "cancelled" &&
        b.booking_status !== "declined",
    );
  }
  if (activeTab.value === "completed") {
    return bookings.value.filter((b) => b.booking_status === "completed");
  }
  if (activeTab.value === "pending") {
    return bookings.value.filter((b) => b.booking_status === "pending");
  }
  return bookings.value;
});

// Status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
    case "declined":
      return "error";
    case "completed":
      return "primary";
    default:
      return "neutral";
  }
};

// Payment status colors
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "success";
    case "deposit_paid":
      return "primary";
    case "unpaid":
      return "error";
    case "refunded":
    case "partially_refunded":
      return "warning";
    default:
      return "neutral";
  }
};

// Format payment status
const formatPaymentStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Modal state
const selectedBooking = ref<BookingWithDetails | null>(null);
const isModalOpen = ref(false);

// Open booking details modal
const viewBooking = (booking: BookingWithDetails) => {
  selectedBooking.value = booking;
  isModalOpen.value = true;
};

// Close modal
const closeModal = () => {
  isModalOpen.value = false;
  setTimeout(() => {
    selectedBooking.value = null;
  }, 300);
};

// Accept booking
const acceptBooking = async (bookingId: string) => {
  try {
    const { error } = await (client
      .from("bookings")
      .update({
        booking_status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", bookingId) as any);

    if (error) throw error;

    // Refresh data
    await refreshNuxtData("vendor-bookings");
    closeModal();

    // Show success toast
    const toast = useToast();
    toast.add({
      title: "Booking accepted",
      description: "The booking has been confirmed successfully.",
      color: "success",
    });
  } catch (error) {
    console.error("Error accepting booking:", error);
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Failed to accept booking. Please try again.",
      color: "error",
    });
  }
};

// Decline booking
const declineBooking = async (bookingId: string) => {
  try {
    const { error } = await (client
      .from("bookings")
      .update({
        booking_status: "declined",
        cancelled_at: new Date().toISOString(),
        cancelled_by: "host",
      })
      .eq("id", bookingId) as any);

    if (error) throw error;

    // Refresh data
    await refreshNuxtData("vendor-bookings");
    closeModal();

    // Show success toast
    const toast = useToast();
    toast.add({
      title: "Booking declined",
      description: "The booking has been declined.",
      color: "success",
    });
  } catch (error) {
    console.error("Error declining booking:", error);
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Failed to decline booking. Please try again.",
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
          Bookings
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Manage your venue and service bookings
        </p>
      </div>
      <UButton color="primary" icon="i-heroicons-plus"> New Booking </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Total Bookings
            </p>
            <p class="text-2xl font-bold">{{ stats.total }}</p>
          </div>
          <UIcon
            name="i-heroicons-calendar-days"
            class="h-8 w-8 text-blue-500"
          />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
            <p class="text-2xl font-bold text-green-600">
              {{ stats.upcoming }}
            </p>
          </div>
          <UIcon name="i-heroicons-clock" class="h-8 w-8 text-green-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ stats.completed }}
            </p>
          </div>
          <UIcon
            name="i-heroicons-check-circle"
            class="h-8 w-8 text-blue-500"
          />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
            <p class="text-2xl font-bold text-red-600">
              {{ stats.cancelled }}
            </p>
          </div>
          <UIcon name="i-heroicons-x-circle" class="h-8 w-8 text-red-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
            <p class="text-2xl font-bold text-green-600">
              {{ formatCurrency(stats.revenue) }}
            </p>
          </div>
          <UIcon name="i-heroicons-banknotes" class="h-8 w-8 text-green-500" />
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
          >Filter by:</span
        >
        <UButton
          v-for="tab in [
            { key: 'all', label: 'All Bookings' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
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

    <!-- Bookings Table -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{
              activeTab === "all"
                ? "All Bookings"
                : activeTab === "upcoming"
                  ? "Upcoming Bookings"
                  : activeTab === "pending"
                    ? "Pending Bookings"
                    : "Completed Bookings"
            }}
          </h3>
          <span class="text-sm text-gray-500"
            >{{ filteredBookings.length }} bookings</span
          >
        </div>
      </template>

      <div v-if="loadingStatus === 'pending'" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6" />
      </div>

      <div v-else-if="filteredBookings.length === 0" class="text-center py-8">
        <UIcon
          name="i-heroicons-calendar-days"
          class="h-12 w-12 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No bookings found
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          No bookings match the current filter.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Venue & Customer
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Booking Details
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Dates
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Payment
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <tr
              v-for="booking in filteredBookings"
              :key="booking.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4">
                <div>
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ booking.venue?.venue_name || "N/A" }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ booking.guest?.name || "Guest" }}
                  </div>
                  <div class="text-xs text-gray-400 dark:text-gray-500">
                    {{ booking.guest?.email || "N/A" }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ booking.number_of_guests }} guests
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ booking.number_of_nights }}
                    {{ booking.number_of_nights === 1 ? "night" : "nights" }}
                  </div>
                  <div
                    v-if="booking.accommodation_needed > 0"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ booking.accommodation_needed }} accommodation needed
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(booking.check_in_date) }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  to {{ formatDate(booking.check_out_date) }}
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
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getPaymentStatusColor(booking.payment_status)"
                  variant="subtle"
                >
                  {{ formatPaymentStatus(booking.payment_status) }}
                </UBadge>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Service fee: {{ formatCurrency(Number(booking.service_fee)) }}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
              >
                <div>{{ formatCurrency(Number(booking.total_amount)) }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Subtotal: {{ formatCurrency(Number(booking.subtotal)) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <UButton
                    size="sm"
                    variant="ghost"
                    icon="i-heroicons-eye"
                    @click="viewBooking(booking)"
                  >
                    View
                  </UButton>
                  <UButton
                    v-if="booking.booking_status === 'pending' && booking.id"
                    size="sm"
                    variant="soft"
                    icon="i-heroicons-check"
                    color="success"
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

    <!-- Booking Details Modal -->
    <VendorBookingDetailsModal
      :booking="selectedBooking"
      :is-open="isModalOpen"
      @close="closeModal"
      @accept="acceptBooking"
      @decline="declineBooking"
    />
  </div>
</template>
