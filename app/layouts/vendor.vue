<script setup lang="ts">
import { useAuth } from "~/stores/auth";

const route = useRoute();
const auth = useAuth();

// Navigation links for vendor navbar
const navLinks = [
  {
    label: "Listings",
    icon: "i-heroicons-building-office",
    to: "/vendor/listings",
  },
  {
    label: "Calendar",
    icon: "i-heroicons-calendar",
    to: "/vendor/calendar",
  },
  {
    label: "Bookings",
    icon: "i-heroicons-clipboard-document-list",
    to: "/vendor/bookings",
  },
  {
    label: "Messages",
    icon: "i-heroicons-chat-bubble-left-right",
    to: "/vendor/messages",
  },
];

// Active nav item based on current route
const activeNavItem = computed(() => {
  const path = route.path;
  if (path.includes("/vendor/listings")) return "listings";
  if (path.includes("/vendor/calendar")) return "calendar";
  if (path.includes("/vendor/bookings")) return "bookings";
  if (path.includes("/vendor/messages")) return "messages";
  return "listings";
});

// Get avatar URL with fallback
const avatarUrl = computed(() => {
  return (
    
    auth.profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      auth.profile?.name || auth.user?.email || "User"
    )}&background=FFBE61&color=000000&bold=true`
  );
});

// Get display name with fallback
const displayName = computed(() => {
  return auth.profile?.name || auth.user?.email || "User";
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Vendor Header -->
    <header
      class="h-20 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      <div class="w-full px-4 sm:px-6 lg:px-8 h-full">
        <!-- Desktop Header -->
        <div class="hidden md:flex items-center justify-between h-full">
          <!-- Left: Logo -->
          <div class="flex items-center">
            <NuxtLink to="/">
              <NuxtImg
                src="logos/logo.svg"
                class="py-2"
                height="150"
                width="150"
              />
            </NuxtLink>
          </div>

          <!-- Center: Vendor Navigation -->
          <div class="flex items-center justify-center">
            <div class="flex items-center gap-8">
              <NuxtLink
                v-for="item in navLinks"
                :key="item.label"
                :to="item.to"
                class="flex flex-col items-center cursor-pointer transition-all duration-300 hover:text-gray-900 dark:hover:text-white group pb-1"
                :class="{
                  'text-gray-900 dark:text-white':
                    activeNavItem === item.label.toLowerCase(),
                  'text-gray-600 dark:text-gray-400':
                    activeNavItem !== item.label.toLowerCase(),
                }"
              >
                <div class="flex items-center gap-2 mb-2">
                  <UIcon
                    :name="item.icon"
                    class="w-5 h-5 transition-colors duration-300"
                    :class="{
                      'text-gray-900 dark:text-white':
                        activeNavItem === item.label.toLowerCase(),
                      'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white':
                        activeNavItem !== item.label.toLowerCase(),
                    }"
                  />
                  <span
                    class="text-sm font-medium transition-colors duration-300"
                    :class="{
                      'text-gray-900 dark:text-white':
                        activeNavItem === item.label.toLowerCase(),
                      'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white':
                        activeNavItem !== item.label.toLowerCase(),
                    }"
                  >
                    {{ item.label }}
                  </span>
                </div>
                <!-- Underline -->
                <div
                  class="h-0.5 w-full transition-all duration-300"
                  :class="{
                    'bg-gray-900 dark:bg-white':
                      activeNavItem === item.label.toLowerCase(),
                    'bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-600':
                      activeNavItem !== item.label.toLowerCase(),
                  }"
                />
              </NuxtLink>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex flex-row justify-center items-center gap-2">
            <UButton
              label="Switch to Planning"
              icon="i-heroicons-calendar"
              variant="soft"
              size="sm"
              class="rounded-full cursor-pointer"
              @click="navigateTo('/')"
            />
            <NuxtLink v-if="auth.loggedIn" to="/users/profile">
              <UAvatar
                class="cursor-pointer"
                :src="avatarUrl"
                :alt="displayName"
              />
            </NuxtLink>
            <HamburgerMenu />
            <UColorModeButton />
          </div>
        </div>

        <!-- Mobile Header -->
        <div class="md:hidden h-full flex flex-col justify-center">
          <!-- Top row: Logo and actions -->
          <div class="flex items-center justify-between mb-4">
            <NuxtLink to="/">
              <NuxtImg
                src="logos/logo.svg"
                class="py-2"
                height="120"
                width="120"
              />
            </NuxtLink>
            <div class="flex items-center gap-2">
              <UButton
                label="Planning"
                icon="i-heroicons-calendar"
                variant="soft"
                size="xs"
                class="rounded-full cursor-pointer text-xs"
                @click="navigateTo('/')"
              />
              <NuxtLink v-if="auth.loggedIn" to="/users/profile">
                <UAvatar
                  class="cursor-pointer"
                  size="sm"
                  :src="avatarUrl"
                  :alt="displayName"
                />
              </NuxtLink>
              <HamburgerMenu />
              <UColorModeButton />
            </div>
          </div>

          <!-- Mobile Navigation -->
          <div class="flex justify-around border-t border-gray-200 dark:border-gray-700 pt-2">
            <NuxtLink
              v-for="item in navLinks"
              :key="item.label"
              :to="item.to"
              class="flex flex-col items-center cursor-pointer transition-all duration-300"
              :class="{
                'text-gray-900 dark:text-white':
                  activeNavItem === item.label.toLowerCase(),
                'text-gray-600 dark:text-gray-400':
                  activeNavItem !== item.label.toLowerCase(),
              }"
            >
              <UIcon
                :name="item.icon"
                class="w-5 h-5"
              />
              <span class="text-xs mt-1">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 bg-gray-50 dark:bg-gray-800">
      <slot />
    </main>
  </div>
</template>
