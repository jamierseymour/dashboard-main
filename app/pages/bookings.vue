<script setup lang="ts">
// Use dashboard layout and require authentication
definePageMeta({
  layout: "dashboard",
});

const client = useSupabaseClient();
const auth = useAuth();

// Reactive data
const loading = ref(false);
const bookings = ref([]);
const stats = ref({
  total: 0,
  upcoming: 0,
  completed: 0,
  cancelled: 0,
  revenue: 0,
});

// Sample data for now - replace with actual Supabase queries
const sampleVenueBookings = [
  {
    id: 1,
    type: "venue",
    venue_name: "Garden Palace",
    customer_name: "John Smith",
    customer_email: "john.smith@email.com",
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
    message_to_host:
      "Looking forward to hosting our special day at your beautiful venue!",
  },
  {
    id: 2,
    type: "venue",
    venue_name: "City Conference Center",
    customer_name: "Sarah Johnson",
    customer_email: "sarah.j@company.com",
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
    message_to_host:
      "Need venue for annual company retreat. Do you provide catering?",
  },
  {
    id: 3,
    type: "venue",
    venue_name: "Sunset Lounge",
    customer_name: "Mike Wilson",
    customer_email: "mikew@email.com",
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
    message_to_host: "Thanks for an amazing party!",
  },
  {
    id: 4,
    type: "venue",
    venue_name: "Beachside Villa",
    customer_name: "Emily Davis",
    customer_email: "emily.davis@email.com",
    event_date: "2025-05-10",
    check_in_date: "2025-05-10",
    check_out_date: "2025-05-12",
    event_type: "Anniversary Celebration",
    status: "confirmed",
    payment_status: "paid",
    guests: 50,
    amount: 28000,
    deposit_paid: 28000,
    created_at: "2025-01-20",
    message_to_host: "Celebrating 25 years together!",
  },
  {
    id: 5,
    type: "venue",
    venue_name: "Mountain Lodge",
    customer_name: "David Brown",
    customer_email: "david.b@email.com",
    event_date: "2025-03-01",
    check_in_date: "2025-03-01",
    check_out_date: "2025-03-01",
    event_type: "Team Building",
    status: "declined",
    payment_status: "unpaid",
    guests: 40,
    amount: 8000,
    deposit_paid: 0,
    created_at: "2025-01-25",
    message_to_host: "Unfortunately had to cancel due to schedule conflict.",
  },
];

const sampleServiceBookings = [
  {
    id: 101,
    type: "service",
    service_name: "Elite Catering Services",
    service_type: "Catering",
    customer_name: "Jessica Martinez",
    customer_email: "jessica.m@email.com",
    event_date: "2025-03-22",
    event_type: "Wedding Reception",
    status: "confirmed",
    payment_status: "deposit_paid",
    guests: 120,
    amount: 18000,
    deposit_paid: 6000,
    created_at: "2025-01-12",
    message_to_host: "Need full catering service including vegetarian options",
  },
  {
    id: 102,
    type: "service",
    service_name: "Premier Photography",
    service_type: "Photography",
    customer_name: "Robert Chen",
    customer_email: "robert.chen@email.com",
    event_date: "2025-04-15",
    event_type: "Corporate Event",
    status: "pending",
    payment_status: "unpaid",
    guests: 80,
    amount: 8500,
    deposit_paid: 0,
    created_at: "2025-02-01",
    message_to_host:
      "Need photographer for 6 hours with edited photos delivered within 2 weeks",
  },
  {
    id: 103,
    type: "service",
    service_name: "Sound & Light Productions",
    service_type: "AV Equipment",
    customer_name: "Amanda White",
    customer_email: "amanda.w@email.com",
    event_date: "2025-02-05",
    event_type: "Concert",
    status: "completed",
    payment_status: "paid",
    guests: 200,
    amount: 15000,
    deposit_paid: 15000,
    created_at: "2025-01-05",
    message_to_host: "Great service, everything worked perfectly!",
  },
  {
    id: 104,
    type: "service",
    service_name: "Decor Dreams",
    service_type: "Decoration",
    customer_name: "Lisa Thompson",
    customer_email: "lisa.t@email.com",
    event_date: "2025-05-28",
    event_type: "Birthday Party",
    status: "confirmed",
    payment_status: "deposit_paid",
    guests: 45,
    amount: 6500,
    deposit_paid: 2500,
    created_at: "2025-02-10",
    message_to_host:
      "Looking for elegant floral arrangements with a vintage theme",
  },
  {
    id: 105,
    type: "service",
    service_name: "DJ Master Mix",
    service_type: "Entertainment",
    customer_name: "Chris Anderson",
    customer_email: "chris.a@email.com",
    event_date: "2025-03-18",
    event_type: "Wedding",
    status: "pending",
    payment_status: "unpaid",
    guests: 100,
    amount: 4500,
    deposit_paid: 0,
    created_at: "2025-02-08",
    message_to_host: "Need DJ for 5 hours, mix of Top 40 and classics",
  },
];

console.log("data", data);

// Initialize data
onMounted(() => {
  loadBookings();
});

// Booking type tabs (venue vs service)
const bookingType = ref("venue");
const allBookings = computed(() => [
  ...sampleVenueBookings,
  ...sampleServiceBookings,
]);

const loadBookings = async () => {
  loading.value = true;
  try {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await client
    //   .from('bookings')
    //   .select('*')
    //   .order('created_at', { ascending: false });

    // For now, use sample data
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading

    // Get bookings based on type
    if (bookingType.value === "venue") {
      bookings.value = sampleVenueBookings;
    } else {
      bookings.value = sampleServiceBookings;
    }

    // Calculate stats
    const currentBookings = bookings.value;
    stats.value = {
      total: currentBookings.length,
      upcoming: currentBookings.filter(
        (b) =>
          new Date(b.event_date) > new Date() &&
          b.status !== "cancelled" &&
          b.status !== "declined",
      ).length,
      completed: currentBookings.filter((b) => b.status === "completed").length,
      cancelled: currentBookings.filter(
        (b) => b.status === "cancelled" || b.status === "declined",
      ).length,
      revenue: currentBookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + b.amount, 0),
    };
  } catch (error) {
    console.error("Error loading bookings:", error);
  } finally {
    loading.value = false;
  }
};

// Watch for booking type changes
watch(bookingType, () => {
  loadBookings();
});

// Filter bookings
const activeTab = ref("all");
const filteredBookings = computed(() => {
  if (activeTab.value === "upcoming") {
    return bookings.value.filter(
      (b) =>
        new Date(b.event_date) > new Date() &&
        b.status !== "cancelled" &&
        b.status !== "declined",
    );
  }
  if (activeTab.value === "completed") {
    return bookings.value.filter((b) => b.status === "completed");
  }
  if (activeTab.value === "pending") {
    return bookings.value.filter((b) => b.status === "pending");
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
</script>

<template>
  <UDashboardPanel id="bookings">
    <template #header>
      <UDashboardNavbar title="bookings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton color="primary" icon="i-heroicons-plus">
            New Booking
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <!-- Booking Type Tabs -->
        <UCard>
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >View:</span
            >
            <UButton
              :variant="bookingType === 'venue' ? 'solid' : 'ghost'"
              :color="bookingType === 'venue' ? 'primary' : 'neutral'"
              icon="i-heroicons-building-office"
              @click="bookingType = 'venue'"
            >
              Venue Bookings
            </UButton>
            <UButton
              :variant="bookingType === 'service' ? 'solid' : 'ghost'"
              :color="bookingType === 'service' ? 'primary' : 'neutral'"
              icon="i-heroicons-sparkles"
              @click="bookingType = 'service'"
            >
              Service Bookings
            </UButton>
          </div>
        </UCard>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
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
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Cancelled
                </p>
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
              <UIcon
                name="i-heroicons-banknotes"
                class="h-8 w-8 text-green-500"
              />
            </div>
          </UCard>
        </div>

        <!-- Filters -->
        <UCard>
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

          <div v-if="loading" class="flex justify-center py-8">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6" />
          </div>

          <div
            v-else-if="filteredBookings.length === 0"
            class="text-center py-8"
          >
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
            <table
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {{ bookingType === "venue" ? "Venue" : "Service" }} &
                    Customer
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Event Details
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Date
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
                        {{
                          bookingType === "venue"
                            ? (booking as any).venue_name
                            : (booking as any).service_name
                        }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ booking.customer_name }}
                      </div>
                      <div class="text-xs text-gray-400 dark:text-gray-500">
                        {{ (booking as any).customer_email }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div>
                      <div class="text-sm text-gray-900 dark:text-white">
                        {{ booking.event_type }}
                      </div>
                      <div
                        v-if="bookingType === 'service'"
                        class="text-xs text-gray-500 dark:text-gray-400"
                      >
                        {{ (booking as any).service_type }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ booking.guests }} guests
                      </div>
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                  >
                    {{ formatDate(booking.event_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UBadge
                      :color="getStatusColor(booking.status)"
                      variant="subtle"
                      class="capitalize"
                    >
                      {{ booking.status }}
                    </UBadge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UBadge
                      :color="
                        getPaymentStatusColor((booking as any).payment_status)
                      "
                      variant="subtle"
                    >
                      {{ formatPaymentStatus((booking as any).payment_status) }}
                    </UBadge>
                    <div
                      v-if="(booking as any).deposit_paid > 0"
                      class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                    >
                      Deposit:
                      {{ formatCurrency((booking as any).deposit_paid) }}
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ formatCurrency(booking.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <UButton size="sm" variant="ghost" icon="i-heroicons-eye">
                        View
                      </UButton>
                      <UButton
                        v-if="booking.status === 'pending'"
                        size="sm"
                        variant="soft"
                        icon="i-heroicons-check"
                        color="success"
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
      </div>
    </template>
  </UDashboardPanel>
</template>
