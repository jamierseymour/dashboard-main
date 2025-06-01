<script setup lang="ts">
// Use dashboard layout and require authentication
definePageMeta({
  layout: "dashboard",
});
</script>

<template>
  <UDashboardPanel id="guidebooks">
    <template #header>
      <UDashboardNavbar title="guidebooks">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <div class="text-center py-20">
          <UIcon
            name="i-lucide-file"
            class="h-16 w-16 text-gray-400 mx-auto mb-6"
          />
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Guidebooks Coming Soon
          </h2>
          <p
            class="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto"
          >
            We're working on creating comprehensive guidebooks to help you
            manage your venues more effectively.
          </p>
          <UButton color="primary" variant="outline" icon="i-heroicons-bell">
            Notify Me When Available
          </UButton>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
