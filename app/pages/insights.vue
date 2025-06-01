<script setup lang="ts">
// Use dashboard layout and require authentication
definePageMeta({
  layout: "dashboard",
});
</script>

<template>
  <UDashboardPanel id="insights">
    <template #header>
      <UDashboardNavbar title="insights">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <div class="text-center py-20">
          <UIcon
            name="i-lucide-bar-chart-2"
            class="h-16 w-16 text-gray-400 mx-auto mb-6"
          />
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Analytics & Insights Coming Soon
          </h2>
          <p
            class="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto"
          >
            Get detailed analytics about your venue performance, booking trends,
            and revenue insights.
          </p>

          <!-- Preview features -->
          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8"
          >
            <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <UIcon
                name="i-heroicons-chart-bar"
                class="h-8 w-8 text-blue-500 mx-auto mb-3"
              />
              <h3 class="font-semibold mb-2">Revenue Analytics</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Track your earnings and financial performance
              </p>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <UIcon
                name="i-heroicons-user-group"
                class="h-8 w-8 text-green-500 mx-auto mb-3"
              />
              <h3 class="font-semibold mb-2">Customer Insights</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Understand your customer demographics and behavior
              </p>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <UIcon
                name="i-heroicons-calendar-days"
                class="h-8 w-8 text-purple-500 mx-auto mb-3"
              />
              <h3 class="font-semibold mb-2">Booking Trends</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Analyze peak times and booking patterns
              </p>
            </div>
          </div>

          <UButton color="primary" variant="outline" icon="i-heroicons-bell">
            Notify Me When Available
          </UButton>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
