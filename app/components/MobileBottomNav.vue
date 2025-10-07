<script setup lang="ts">
import { useAuth } from "~/stores/auth";

const auth = useAuth();
const route = useRoute();

// Navigation items for bottom nav
const navItems = [
  {
    label: "Venues",
    icon: "i-heroicons-map-pin",
    to: "/venues",
    key: "venues",
  },
  {
    label: "Services",
    icon: "i-heroicons-sparkles",
    to: "/services",
    key: "services",
  },
  {
    label: "Dashboard",
    icon: "i-heroicons-home",
    to: "/dashboard",
    key: "dashboard",
    requiresAuth: true,
  },
  {
    label: "Profile",
    icon: "i-heroicons-user",
    to: "/users/profile",
    key: "profile",
    requiresAuth: true,
  },
];

// Filter nav items based on auth status
const visibleNavItems = computed(() => {
  if (auth.loggedIn) {
    return navItems;
  }
  // Show only venues and services if not logged in
  return navItems.filter((item) => !item.requiresAuth);
});

// Determine active nav item
const activeNavItem = computed(() => {
  const path = route.path;
  if (path.startsWith("/venues")) return "venues";
  if (path.startsWith("/services")) return "services";
  if (path.startsWith("/dashboard")) return "dashboard";
  if (path.startsWith("/profile")) return "profile";
  return "venues";
});
</script>

<template>
  <!-- Mobile Bottom Navigation - Only visible on mobile -->
  <nav
    class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50"
  >
    <div class="flex justify-around items-center h-16 px-2">
      <NuxtLink
        v-for="item in visibleNavItems"
        :key="item.key"
        :to="item.to"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200"
        :class="{
          'text-primary-600 dark:text-primary-400': activeNavItem === item.key,
          'text-gray-600 dark:text-gray-400': activeNavItem !== item.key,
        }"
      >
        <UIcon
          :name="item.icon"
          class="w-6 h-6 mb-1"
          :class="{
            'text-primary-600 dark:text-primary-400':
              activeNavItem === item.key,
            'text-gray-600 dark:text-gray-400': activeNavItem !== item.key,
          }"
        />
        <span
          class="text-xs font-medium"
          :class="{
            'text-primary-600 dark:text-primary-400':
              activeNavItem === item.key,
            'text-gray-600 dark:text-gray-400': activeNavItem !== item.key,
          }"
        >
          {{ item.label }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
