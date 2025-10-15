<script setup lang="ts">
import type { BookingWithDetails } from "~/types/booking";

const auth = useAuth();
const client = useSupabaseClient();

// Fetch user's bookings from database
const { data: bookingsData, status: loadingStatus } = useAsyncData<
  BookingWithDetails[] | null
>(
  "user-bookings",
  async () => {
    console.log('📋 Fetching user bookings...');
    // Wait for auth to be ready
    if (!auth.user?.id) {
      console.log('❌ No user ID');
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
        console.error("Error fetching user bookings:", error);
        return null;
      }

      console.log('✅ Fetched bookings:', data);
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
    watch: [() => auth.user?.id],
  },
);

// Compute bookings array from fetched data
const userBookings = computed(() => bookingsData.value || []);

// Filter by type
const activeType = ref("all");
const filteredBookings = computed(() => {
  if (activeType.value === "venue") {
    return userBookings.value.filter((b) => b.venue_id);
  }
  if (activeType.value === "service") {
    return userBookings.value.filter((b) => b.service_id);
  }
  return userBookings.value;
});

// Filter by status
const activeStatus = ref("all");
const finalFilteredBookings = computed(() => {
  if (activeStatus.value === "upcoming") {
    return filteredBookings.value.filter(
      (b) =>
        new Date(b.check_in_date) > new Date() &&
        b.booking_status !== "cancelled",
    );
  }
  if (activeStatus.value === "completed") {
    return filteredBookings.value.filter(
      (b) => b.booking_status === "completed",
    );
  }
  if (activeStatus.value === "pending") {
    return filteredBookings.value.filter((b) => b.booking_status === "pending");
  }
  return filteredBookings.value;
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
    month: "long",
    day: "numeric",
  });
};

// Payment handlers
const handlePaymentSuccess = async (bookingId: string) => {
  console.log("✅ Payment successful for booking:", bookingId);

  // Refresh bookings data
  await refreshNuxtData("user-bookings");

  useToast().add({
    title: "Payment Successful!",
    description: "Your booking payment has been confirmed.",
    color: "success",
  });
};

const handlePaymentError = (error: any) => {
  console.error("❌ Payment error:", error);

  useToast().add({
    title: "Payment Failed",
    description: "There was an issue processing your payment. Please try again.",
    color: "error",
  });
};
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        My Bookings
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        View and manage all your venue and service bookings
      </p>
    </div>

    <!-- Filters -->
    <div class="mb-6 space-y-4">
      <!-- Type Filter -->
      <UCard>
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >Type:</span
          >
          <UButton
            :variant="activeType === 'all' ? 'solid' : 'ghost'"
            :color="activeType === 'all' ? 'primary' : 'neutral'"
            size="sm"
            class="cursor-pointer"
            @click="activeType = 'all'"
          >
            All
          </UButton>
          <UButton
            :variant="activeType === 'venue' ? 'solid' : 'ghost'"
            :color="activeType === 'venue' ? 'primary' : 'neutral'"
            icon="i-heroicons-building-office"
            size="sm"
            class="cursor-pointer"
            @click="activeType = 'venue'"
          >
            Venues
          </UButton>
          <UButton
            :variant="activeType === 'service' ? 'solid' : 'ghost'"
            :color="activeType === 'service' ? 'primary' : 'neutral'"
            icon="i-heroicons-sparkles"
            size="sm"
            class="cursor-pointer"
            @click="activeType = 'service'"
          >
            Services
          </UButton>
        </div>
      </UCard>

      <!-- Status Filter -->
      <UCard>
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >Status:</span
          >
          <UButton
            :variant="activeStatus === 'all' ? 'solid' : 'ghost'"
            :color="activeStatus === 'all' ? 'primary' : 'neutral'"
            size="sm"
            class="cursor-pointer"
            @click="activeStatus = 'all'"
          >
            All
          </UButton>
          <UButton
            :variant="activeStatus === 'upcoming' ? 'solid' : 'ghost'"
            :color="activeStatus === 'upcoming' ? 'primary' : 'neutral'"
            size="sm"
            class="cursor-pointer"
            @click="activeStatus = 'upcoming'"
          >
            Upcoming
          </UButton>
          <UButton
            :variant="activeStatus === 'pending' ? 'solid' : 'ghost'"
            :color="activeStatus === 'pending' ? 'primary' : 'neutral'"
            size="sm"
            class="cursor-pointer"
            @click="activeStatus = 'pending'"
          >
            Pending
          </UButton>
          <UButton
            :variant="activeStatus === 'completed' ? 'solid' : 'ghost'"
            :color="activeStatus === 'completed' ? 'primary' : 'neutral'"
            size="sm"
            class="cursor-pointer"
            @click="activeStatus = 'completed'"
          >
            Completed
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Loading State -->
    <div v-if="loadingStatus === 'pending'" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
    </div>

    <!-- Bookings List -->
    <div v-else class="space-y-4">
      <div
        v-for="booking in finalFilteredBookings"
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
                  <UBadge color="blue" variant="subtle">
                    {{ booking.venue_id ? "Venue" : "Service" }}
                  </UBadge>
                  <UBadge
                    :color="getStatusColor(booking.booking_status)"
                    variant="subtle"
                    class="capitalize"
                  >
                    {{ booking.booking_status }}
                  </UBadge>
                  <UBadge
                    :color="getPaymentStatusColor(booking.payment_status)"
                    variant="subtle"
                  >
                    {{ formatPaymentStatus(booking.payment_status) }}
                  </UBadge>
                </div>
                <h3
                  class="text-xl font-semibold text-gray-900 dark:text-white mb-1"
                >
                  {{ booking.venue?.venue_name || "Venue" }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ booking.venue?.company_name || "N/A" }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ formatCurrency(Number(booking.total_amount)) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  Subtotal: {{ formatCurrency(Number(booking.subtotal)) }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div
                  class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1"
                >
                  Check-in
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(booking.check_in_date) }}
                </div>
              </div>
              <div>
                <div
                  class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1"
                >
                  Check-out
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(booking.check_out_date) }}
                </div>
              </div>
              <div>
                <div
                  class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1"
                >
                  Guests
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ booking.number_of_guests }} people
                </div>
              </div>
              <div>
                <div
                  class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1"
                >
                  Booked On
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(booking.created_at) }}
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton size="sm" variant="solid" color="primary" class="cursor-pointer" :to="`/venues/${booking.venue_id}`">
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
              <!-- Payment Button -->
              <div
                v-if="
                  booking.payment_status !== 'paid' &&
                  booking.booking_status === 'confirmed' &&
                  auth.user?.email
                "
                class="flex-1 max-w-xs"
              >
                <PaymentPaystackButton
                  :amount="Number(booking.total_amount)"
                  :email="auth.user.email"
                  :booking-id="booking.id"
                  :metadata="{
                    venue_id: booking.venue_id,
                    venue_name: booking.venue?.venue_name,
                    check_in: booking.check_in_date,
                    check_out: booking.check_out_date,
                  }"
                  @success="handlePaymentSuccess(booking.id)"
                  @error="handlePaymentError"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="finalFilteredBookings.length === 0"
        class="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <UIcon
          name="i-heroicons-calendar-days"
          class="h-16 w-16 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No bookings found
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          You don't have any bookings matching the selected filters.
        </p>
        <UButton color="primary" to="/venues" class="cursor-pointer"> Browse Venues </UButton>
      </div>
    </div>
  </div>
</template>
