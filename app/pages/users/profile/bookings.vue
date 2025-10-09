<script setup lang="ts">
const auth = useAuth();

// Sample user bookings (as a customer)
const userBookings = ref([
  {
    id: 1,
    type: "venue",
    venue_name: "Garden Palace",
    vendor_name: "Elite Venues Ltd",
    event_date: "2025-03-15",
    check_in_date: "2025-03-15",
    check_out_date: "2025-03-16",
    event_type: "Wedding",
    status: "confirmed",
    payment_status: "deposit_paid",
    guests: 150,
    amount: 45000,
    deposit_paid: 15000,
    created_at: "2025-01-10",
    venue_image: "https://images.unsplash.com/photo-1519167758481-83f29da8dd8f?w=400",
  },
  {
    id: 2,
    type: "service",
    service_name: "Elite Catering Services",
    service_type: "Catering",
    vendor_name: "Gourmet Caterers",
    event_date: "2025-03-22",
    event_type: "Wedding Reception",
    status: "confirmed",
    payment_status: "deposit_paid",
    guests: 120,
    amount: 18000,
    deposit_paid: 6000,
    created_at: "2025-01-12",
    service_image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400",
  },
  {
    id: 3,
    type: "venue",
    venue_name: "City Conference Center",
    vendor_name: "Corporate Venues Inc",
    event_date: "2025-04-20",
    check_in_date: "2025-04-20",
    check_out_date: "2025-04-20",
    event_type: "Corporate Event",
    status: "pending",
    payment_status: "unpaid",
    guests: 75,
    amount: 12000,
    deposit_paid: 0,
    created_at: "2025-02-05",
    venue_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
  },
  {
    id: 4,
    type: "service",
    service_name: "Premier Photography",
    service_type: "Photography",
    vendor_name: "Photo Masters",
    event_date: "2025-04-15",
    event_type: "Corporate Event",
    status: "pending",
    payment_status: "unpaid",
    guests: 80,
    amount: 8500,
    deposit_paid: 0,
    created_at: "2025-02-01",
    service_image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400",
  },
  {
    id: 5,
    type: "venue",
    venue_name: "Sunset Lounge",
    vendor_name: "Beachside Properties",
    event_date: "2025-02-08",
    check_in_date: "2025-02-08",
    check_out_date: "2025-02-08",
    event_type: "Birthday Party",
    status: "completed",
    payment_status: "paid",
    guests: 30,
    amount: 5500,
    deposit_paid: 5500,
    created_at: "2025-01-15",
    venue_image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400",
  },
]);

// Filter by type
const activeType = ref("all");
const filteredBookings = computed(() => {
  if (activeType.value === "venue") {
    return userBookings.value.filter((b) => b.type === "venue");
  }
  if (activeType.value === "service") {
    return userBookings.value.filter((b) => b.type === "service");
  }
  return userBookings.value;
});

// Filter by status
const activeStatus = ref("all");
const finalFilteredBookings = computed(() => {
  if (activeStatus.value === "upcoming") {
    return filteredBookings.value.filter(
      (b) => new Date(b.event_date) > new Date() && b.status !== "cancelled"
    );
  }
  if (activeStatus.value === "completed") {
    return filteredBookings.value.filter((b) => b.status === "completed");
  }
  if (activeStatus.value === "pending") {
    return filteredBookings.value.filter((b) => b.status === "pending");
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
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
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
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
          <UButton
            :variant="activeType === 'all' ? 'solid' : 'ghost'"
            :color="activeType === 'all' ? 'primary' : 'neutral'"
            size="sm"
            @click="activeType = 'all'"
          >
            All
          </UButton>
          <UButton
            :variant="activeType === 'venue' ? 'solid' : 'ghost'"
            :color="activeType === 'venue' ? 'primary' : 'neutral'"
            icon="i-heroicons-building-office"
            size="sm"
            @click="activeType = 'venue'"
          >
            Venues
          </UButton>
          <UButton
            :variant="activeType === 'service' ? 'solid' : 'ghost'"
            :color="activeType === 'service' ? 'primary' : 'neutral'"
            icon="i-heroicons-sparkles"
            size="sm"
            @click="activeType = 'service'"
          >
            Services
          </UButton>
        </div>
      </UCard>

      <!-- Status Filter -->
      <UCard>
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <UButton
            :variant="activeStatus === 'all' ? 'solid' : 'ghost'"
            :color="activeStatus === 'all' ? 'primary' : 'neutral'"
            size="sm"
            @click="activeStatus = 'all'"
          >
            All
          </UButton>
          <UButton
            :variant="activeStatus === 'upcoming' ? 'solid' : 'ghost'"
            :color="activeStatus === 'upcoming' ? 'primary' : 'neutral'"
            size="sm"
            @click="activeStatus = 'upcoming'"
          >
            Upcoming
          </UButton>
          <UButton
            :variant="activeStatus === 'pending' ? 'solid' : 'ghost'"
            :color="activeStatus === 'pending' ? 'primary' : 'neutral'"
            size="sm"
            @click="activeStatus = 'pending'"
          >
            Pending
          </UButton>
          <UButton
            :variant="activeStatus === 'completed' ? 'solid' : 'ghost'"
            :color="activeStatus === 'completed' ? 'primary' : 'neutral'"
            size="sm"
            @click="activeStatus = 'completed'"
          >
            Completed
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Bookings List -->
    <div class="space-y-4">
      <div
        v-for="booking in finalFilteredBookings"
        :key="booking.id"
        class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col md:flex-row">
          <!-- Image -->
          <div class="md:w-64 h-48 md:h-auto flex-shrink-0">
            <img
              :src="booking.type === 'venue' ? booking.venue_image : booking.service_image"
              :alt="booking.type === 'venue' ? booking.venue_name : booking.service_name"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <UBadge
                    :color="booking.type === 'venue' ? 'blue' : 'purple'"
                    variant="subtle"
                  >
                    {{ booking.type === 'venue' ? 'Venue' : 'Service' }}
                  </UBadge>
                  <UBadge
                    :color="getStatusColor(booking.status)"
                    variant="subtle"
                    class="capitalize"
                  >
                    {{ booking.status }}
                  </UBadge>
                  <UBadge
                    :color="getPaymentStatusColor(booking.payment_status)"
                    variant="subtle"
                  >
                    {{ formatPaymentStatus(booking.payment_status) }}
                  </UBadge>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {{ booking.type === 'venue' ? booking.venue_name : booking.service_name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  by {{ booking.vendor_name }}
                </p>
                <p v-if="booking.type === 'service'" class="text-sm text-gray-500 dark:text-gray-500 mb-2">
                  {{ booking.service_type }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ formatCurrency(booking.amount) }}
                </div>
                <div v-if="booking.deposit_paid > 0" class="text-sm text-gray-500 dark:text-gray-400">
                  Deposit: {{ formatCurrency(booking.deposit_paid) }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Event Type
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ booking.event_type }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Event Date
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(booking.event_date) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Guests
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ booking.guests }} people
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Booked On
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(booking.created_at) }}
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton size="sm" variant="solid" color="primary">
                View Details
              </UButton>
              <UButton v-if="booking.status === 'pending'" size="sm" variant="soft" color="error">
                Cancel Request
              </UButton>
              <UButton v-if="booking.status === 'confirmed'" size="sm" variant="soft" color="neutral">
                Contact Vendor
              </UButton>
              <UButton v-if="booking.payment_status !== 'paid' && booking.status === 'confirmed'" size="sm" variant="soft" color="success">
                Complete Payment
              </UButton>
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
        <UButton color="primary" to="/venues">
          Browse Venues
        </UButton>
      </div>
    </div>
  </div>
</template>
