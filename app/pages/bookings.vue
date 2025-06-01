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
const sampleBookings = [
  {
    id: 1,
    venue_name: "Garden Palace",
    customer_name: "John Smith",
    event_date: "2024-02-15",
    event_type: "Wedding",
    status: "confirmed",
    guests: 150,
    amount: 15000,
    created_at: "2024-01-10",
  },
  {
    id: 2,
    venue_name: "City Conference Center",
    customer_name: "Sarah Johnson",
    event_date: "2024-02-20",
    event_type: "Corporate Event",
    status: "pending",
    guests: 50,
    amount: 5000,
    created_at: "2024-01-12",
  },
  {
    id: 3,
    venue_name: "Sunset Lounge",
    customer_name: "Mike Wilson",
    event_date: "2024-01-05",
    event_type: "Birthday",
    status: "completed",
    guests: 25,
    amount: 2500,
    created_at: "2023-12-20",
  },
];

// Initialize data
onMounted(() => {
  loadBookings();
});

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
    bookings.value = sampleBookings;

    // Calculate stats
    stats.value = {
      total: bookings.value.length,
      upcoming: bookings.value.filter(
        (b) => new Date(b.event_date) > new Date() && b.status !== "cancelled"
      ).length,
      completed: bookings.value.filter((b) => b.status === "completed").length,
      cancelled: bookings.value.filter((b) => b.status === "cancelled").length,
      revenue: bookings.value
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + b.amount, 0),
    };
  } catch (error) {
    console.error("Error loading bookings:", error);
  } finally {
    loading.value = false;
  }
};

// Filter bookings
const activeTab = ref("all");
const filteredBookings = computed(() => {
  if (activeTab.value === "upcoming") {
    return bookings.value.filter(
      (b) => new Date(b.event_date) > new Date() && b.status !== "cancelled"
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
      return "error";
    case "completed":
      return "primary";
    default:
      return "neutral";
  }
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
                    Venue & Customer
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
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ booking.venue_name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ booking.customer_name }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm text-gray-900 dark:text-white">
                        {{ booking.event_type }}
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
                    >
                      {{ booking.status }}
                    </UBadge>
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
                        size="sm"
                        variant="ghost"
                        icon="i-heroicons-pencil"
                        color="warning"
                      >
                        Edit
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
