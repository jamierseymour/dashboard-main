<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const open = ref(false);

const items = [
  {
    id: 1,
    name: "About Me",
    to: "/users/profile/about",
    icon: "i-heroicons-user-circle",
  },
  {
    id: 2,
    name: "My Bookings",
    to: "/users/profile/bookings",
    icon: "i-heroicons-calendar",
  },
  {
    id: 3,
    name: "Upcoming Events",
    to: "/users/profile/upcoming-events",
    icon: "i-heroicons-calendar-days",
  },
  {
    id: 4,
    name: "Past Events",
    to: "/users/profile/past-events",
    icon: "i-heroicons-archive-box",
  },
];

const activeItem = computed(() => {
  return items.find((item) => item.to === route.path) || items[0];
});
</script>

<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div
      class="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0"
    >
      <div class="p-6">
        <div class="flex items-center gap-3 mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Profile
            </h1>
          </div>
        </div>

        <!-- Navigation Items -->
        <nav class="space-y-2">
          <NuxtLink
            v-for="item in items"
            :key="item.id"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 group"
            :class="{
              'bg-fuchsia-50 dark:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300 border-r-2 border-fuchsia-500':
                activeItem?.id === item.id,
              'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800':
                activeItem?.id !== item.id,
            }"
          >
            <UIcon
              :name="item.icon"
              class="w-5 h-5 transition-colors duration-200"
              :class="{
                'text-fuchsia-600 dark:text-fuchsia-400': activeItem?.id === item.id,
                'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300':
                  activeItem?.id !== item.id,
              }"
            />
            <div class="flex-1">
              <div class="font-medium">{{ item.name }}</div>
            </div>
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800">
      <NuxtPage />
    </div>
  </div>
</template>

<style></style>
