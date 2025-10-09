<script setup lang="ts">
import { useAuth } from "~/stores/auth";
import AuthModal from "~/components/Auth/AuthModal.vue";

const auth = useAuth();
const showBecomeHostModal = ref(false);

const handleSignUp = () => {
  try {
    auth.toggleModal(true);
  } catch (error) {
    console.error("❌ Error calling toggleModal:", error);
  }
};

// Get avatar URL with fallback
const avatarUrl = computed(() => {
  // Use picUrl from profile first, then fall back to avatar_url, then default
  return (
    auth.profile?.picUrl ||
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

// Navigation items for center nav
const centerNavItems = ref([
  {
    label: "Venues",
    icon: "i-heroicons-map-pin",
    to: "/venues",
    description: "Find perfect venues"
  },
  {
    label: "Services",
    icon: "i-heroicons-sparkles",
    to: "/services",
    description: "Browse event services"
  },
  {
    label: "Create Event",
    icon: "i-heroicons-plus-circle",
    to: "/events/create",
    description: "Plan your event"
  }
]);

// Active navigation item based on current route
const route = useRoute();
const activeNavItem = computed(() => {
  const path = route.path;
  if (path.startsWith('/venues')) return 'venues';
  if (path.startsWith('/services')) return 'services';
  if (path.startsWith('/events/create')) return 'create event';
  return 'venues'; // default
});

// Dynamic button text and action based on user status and current page
const hostButton = computed(() => {
  if (!auth.loggedIn) {
    return null; // Don't show button if not logged in
  }

  const isOnVenuePage = activeNavItem.value === 'venues';
  const isOnServicePage = activeNavItem.value === 'services';
  const isVendor = auth.profile?.is_vendor;
  const isServiceProvider = auth.profile?.is_service_provider;

  if (isOnVenuePage) {
    if (isVendor) {
      return {
        label: 'Switch to Hosting',
        icon: 'i-heroicons-building-office',
        action: () => navigateTo('/dashboard'),
        variant: 'soft' as const
      };
    } else {
      return {
        label: 'Become a Host',
        icon: 'i-heroicons-home',
        action: () => showBecomeHostModal.value = true,
        variant: 'solid' as const
      };
    }
  } else if (isOnServicePage) {
    if (isServiceProvider) {
      return {
        label: 'Service Dashboard',
        icon: 'i-heroicons-sparkles',
        action: () => navigateTo('/service-dashboard'),
        variant: 'soft' as const
      };
    } else {
      return {
        label: 'Become a Provider',
        icon: 'i-heroicons-sparkles',
        action: () => showBecomeHostModal.value = true,
        variant: 'solid' as const
      };
    }
  }

  return null;
});
</script>

<template>
  <!-- Custom Header with centered navigation -->
  <header class="h-20 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
    <div class="w-full px-4 sm:px-6 lg:px-8 h-full">
      <!-- Desktop Header -->
      <div class="hidden md:flex items-center justify-between h-full">
        <!-- Left: Logo -->
        <div class="flex items-center">
          <NuxtLink to="/">
            <NuxtImg src="logos/logo.svg" class="py-2" height="150" width="150" />
          </NuxtLink>
        </div>

        <!-- Center: Navigation -->
        <div class="flex items-center justify-center">
          <div class="flex items-center gap-8">
            <NuxtLink
              v-for="item in centerNavItems"
              :key="item.label"
              :to="item.to"
              class="flex flex-col items-center cursor-pointer transition-all duration-300 hover:text-gray-900 dark:hover:text-white group pb-1"
              :class="{
                'text-gray-900 dark:text-white': activeNavItem === item.label.toLowerCase(),
                'text-gray-600 dark:text-gray-400': activeNavItem !== item.label.toLowerCase()
              }"
            >
              <div class="flex items-center gap-2 mb-2">
                <UIcon
                  :name="item.icon"
                  class="w-5 h-5 transition-colors duration-300"
                  :class="{
                    'text-gray-900 dark:text-white': activeNavItem === item.label.toLowerCase(),
                    'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white': activeNavItem !== item.label.toLowerCase()
                  }"
                />
                <span
                  class="text-sm font-medium transition-colors duration-300"
                  :class="{
                    'text-gray-900 dark:text-white': activeNavItem === item.label.toLowerCase(),
                    'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white': activeNavItem !== item.label.toLowerCase()
                  }"
                >
                  {{ item.label }}
                </span>
              </div>
              <!-- Underline -->
              <div
                class="h-0.5 w-full transition-all duration-300"
                :class="{
                  'bg-gray-900 dark:bg-white': activeNavItem === item.label.toLowerCase(),
                  'bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-600': activeNavItem !== item.label.toLowerCase()
                }"
              />
            </NuxtLink>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex flex-row justify-center items-center gap-2">
          <UButton
            v-if="hostButton"
            :label="hostButton.label"
            :icon="hostButton.icon"
            :variant="hostButton.variant"
            size="sm"
            class="rounded-full cursor-pointer"
            @click="hostButton.action"
          />
          <UButton
            v-if="!auth.loggedIn"
            label="Sign up"
            icon="i-heroicons-arrow-right"
            trailing
            class="hidden rounded-full cursor-pointer lg:flex"
            @click="handleSignUp()"
          />
          <NuxtLink v-if="auth.loggedIn" to="/users/profile">
            <UAvatar class="cursor-pointer" :src="avatarUrl" :alt="displayName" />
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
            <NuxtImg src="logos/logo.svg" class="py-2" height="120" width="120" />
          </NuxtLink>
          <div class="flex items-center gap-2">
            <UButton
              v-if="hostButton"
              :label="hostButton.label"
              :icon="hostButton.icon"
              :variant="hostButton.variant"
              size="xs"
              class="rounded-full cursor-pointer text-xs"
              @click="hostButton.action"
            />
            <UButton
              v-if="!auth.loggedIn"
              label="Sign up"
              icon="i-heroicons-arrow-right"
              trailing
              size="sm"
              class="rounded-full cursor-pointer"
              @click="handleSignUp()"
            />
            <NuxtLink v-if="auth.loggedIn" to="/users/profile">
              <UAvatar class="cursor-pointer" size="sm" :src="avatarUrl" :alt="displayName" />
            </NuxtLink>
            <HamburgerMenu />
            <UColorModeButton />
          </div>
        </div>

      </div>
    </div>
  </header>

  <!-- Auth Modal -->
  <AuthModal v-if="auth.modal" />

  <!-- Become Host Modal -->
  <BecomeHostModal :active="showBecomeHostModal" @set-active="showBecomeHostModal = $event" />
</template>
