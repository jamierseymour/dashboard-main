<script setup lang="ts">
definePageMeta({
  layout: "vendor",
  middleware: "auth",
});

const client = useSupabaseClient();

interface IVenue {
  id: number;
  venue_name: string;
  photos: string[];
  [key: string]: any;
}

const venues = computed(() => data.value || []);

const { data, error } = await useAsyncData<IVenue[] | null>(
  "venues",
  async () => {
    const { data, error } = await client.from("venues").select();

    if (error) {
      console.error("Error fetching venues:", error);
      return null;
    }

    return data || null;
  }
);
</script>

<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Bookings Calendar
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          View and manage your venue bookings
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-arrow-path"
          variant="outline"
          size="sm"
        >
          Refresh
        </UButton>
        <UButton
          icon="i-heroicons-funnel"
          variant="outline"
          size="sm"
        >
          Filter
        </UButton>
      </div>
    </div>

    <!-- Calendar placeholder - You can integrate a calendar library here -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8">
      <div class="text-center py-16">
        <UIcon
          name="i-heroicons-calendar"
          class="w-20 h-20 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Calendar View Coming Soon
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          We're building an interactive calendar view to help you manage your bookings more efficiently.
        </p>
      </div>
    </div>
  </div>
</template>
