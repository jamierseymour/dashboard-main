<script setup lang="ts">
import { useAuth } from "~/stores/auth";
import AuthModal from "~/components/Auth/AuthModal.vue";

const auth = useAuth();


const dropdownItems = computed(() => [
  [
    {
      label: auth.user?.email || "No email",
      slot: "account",
      disabled: true,
    },
  ],
  // [
  //   {
  //     label: "Settings",
  //     icon: "i-heroicons-cog-8-tooth",
  //     click: () => navigateTo("/settings"),
  //   },
  // ],
  [
    {
      label: "Dashboard",
      icon: "i-heroicons-home",
      click: () => navigateTo("/dashboard"),
    },
    // {
    //   label: "My Venues",
    //   icon: "i-heroicons-building-office",
    //   click: () => navigateTo("/venues/my-venues"),
    // },
  ],
  [
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: () => logout(),
    },
  ],
]);

const logout = async () => {
  try {
    // Use the auth store's signOut method
    await auth.signOut();

    // Navigate to home page after successful logout
    await navigateTo("/");
  } catch (error) {
    console.error("Error logging out:", error);
    // Still try to navigate to home even if logout had issues
    await navigateTo("/");
  }
};

// Handle click on dropdown item
const handleItemClick = (item: any) => {
  if (item.click && !item.disabled) {
    item.click();
  }
};

// nuxtApp.hooks.hookOnce("page:finish", () => {
//   updateHeadings([
//     document.querySelector("#features"),
//     document.querySelector("#templates"),
//     document.querySelector("#pricing"),
//     document.querySelector("#testimonials"),
//     document.querySelector("#faq"),
//   ]);
// });

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
  }
]);

// Active navigation item based on current route
const route = useRoute();
const activeNavItem = computed(() => {
  const path = route.path;
  if (path.startsWith('/venues')) return 'venues';
  if (path.startsWith('/services')) return 'services';
  return 'venues'; // default
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
            <div
              v-for="item in centerNavItems"
              :key="item.label"
              class="flex flex-col items-center cursor-pointer transition-all duration-300 hover:text-gray-900 dark:hover:text-white group pb-1"
              :class="{
                'text-gray-900 dark:text-white': activeNavItem === item.label.toLowerCase(),
                'text-gray-600 dark:text-gray-400': activeNavItem !== item.label.toLowerCase()
              }"
              @click="() => navigateTo(item.to)"
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
            </div>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex flex-row justify-center items-center gap-2">
          <p class="px-4 font-bold cursor-pointer">
            <NuxtLink to="/new-venue"> List your venue </NuxtLink>
          </p>
          <UButton
            v-if="!auth.loggedIn"
            label="Sign up"
            icon="i-heroicons-arrow-right"
            trailing
            class="hidden rounded-full cursor-pointer lg:flex"
            @click="handleSignUp()"
          />
          <div v-if="auth.loggedIn">
            <UDropdownMenu
              :items="dropdownItems"
              :ui="{
                content: 'cursor-pointer',
                item: 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
              }"
              :popper="{ placement: 'bottom-start' }"
            >
              <UAvatar class="cursor-pointer" :src="avatarUrl" :alt="displayName" />

              <template #account="{ item }">
                <div class="text-left">
                  <p>Signed in as</p>
                  <p class="truncate font-medium text-gray-900 dark:text-white">
                    {{ displayName }}
                  </p>
                </div>
              </template>

              <template #item="{ item }">
                <div
                  class="flex items-center w-full"
                  :class="{ 'opacity-50': (item as any).disabled }"
                  @click="handleItemClick(item)"
                >
                  <span class="truncate">{{ item.label }}</span>
                  <UIcon
                    v-if="(item as any).icon"
                    :name="(item as any).icon"
                    class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
                  />
                </div>
              </template>
            </UDropdownMenu>
          </div>
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
              v-if="!auth.loggedIn"
              label="Sign up"
              icon="i-heroicons-arrow-right"
              trailing
              size="sm"
              class="rounded-full cursor-pointer"
              @click="handleSignUp()"
            />
            <div v-if="auth.loggedIn">
              <UDropdownMenu
                :items="dropdownItems"
                :ui="{
                  content: 'cursor-pointer',
                  item: 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
                }"
                :popper="{ placement: 'bottom-start' }"
              >
                <UAvatar class="cursor-pointer" size="sm" :src="avatarUrl" :alt="displayName" />

                <template #account="{ item }">
                  <div class="text-left">
                    <p>Signed in as</p>
                    <p class="truncate font-medium text-gray-900 dark:text-white">
                      {{ displayName }}
                    </p>
                  </div>
                </template>

                <template #item="{ item }">
                  <div
                    class="flex items-center w-full"
                    :class="{ 'opacity-50': (item as any).disabled }"
                    @click="handleItemClick(item)"
                  >
                    <span class="truncate">{{ item.label }}</span>
                    <UIcon
                      v-if="(item as any).icon"
                      :name="(item as any).icon"
                      class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
                    />
                  </div>
                </template>
              </UDropdownMenu>
            </div>
            <UColorModeButton />
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="flex items-center justify-center">
          <div class="flex items-center gap-6 w-full max-w-sm justify-center">
            <div
              v-for="item in centerNavItems"
              :key="item.label"
              class="flex flex-col items-center cursor-pointer transition-all duration-300 hover:text-gray-900 dark:hover:text-white group pb-1"
              :class="{
                'text-gray-900 dark:text-white': activeNavItem === item.label.toLowerCase(),
                'text-gray-600 dark:text-gray-400': activeNavItem !== item.label.toLowerCase()
              }"
              @click="() => navigateTo(item.to)"
            >
              <div class="flex items-center gap-1.5 mb-2">
                <UIcon
                  :name="item.icon"
                  class="w-4 h-4 transition-colors duration-300"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Auth Modal -->
  <AuthModal v-if="auth.modal" />
</template>
