<script setup lang="ts">
import { useAuth } from "~/stores/auth";
import AuthModal from "~/components/Auth/AuthModal.vue";

const { activeHeadings, updateHeadings } = useScrollspy();

const auth = useAuth();

const items = computed(() => [
  {
    label: "Features",
    to: "#features",
    active:
      activeHeadings.value.includes("features") &&
      !activeHeadings.value.includes("templates"),
  },
  {
    label: "Templates",
    to: "#templates",
    active:
      activeHeadings.value.includes("templates") &&
      !activeHeadings.value.includes("pricing"),
  },
  {
    label: "Pricing",
    to: "#pricing",
    active:
      activeHeadings.value.includes("pricing") &&
      !activeHeadings.value.includes("testimonials"),
  },
  {
    label: "Testimonials",
    to: "#testimonials",
    active:
      activeHeadings.value.includes("testimonials") &&
      !activeHeadings.value.includes("faq"),
  },
  {
    label: "FAQ",
    to: "#faq",
    active: activeHeadings.value.includes("faq"),
  },
]);

const dropdownItems = computed(() => [
  [
    {
      label: auth.user?.email || "No email",
      slot: "account",
      disabled: true,
    },
  ],
  [
    {
      label: "Settings",
      icon: "i-heroicons-cog-8-tooth",
      click: () => navigateTo("/settings"),
    },
  ],
  [
    {
      label: "Dashboard",
      icon: "i-heroicons-home",
      click: () => navigateTo("/dashboard"),
    },
    {
      label: "My Venues",
      icon: "i-heroicons-building-office",
      click: () => navigateTo("/venues/my-venues"),
    },
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
</script>

<template>
  <UHeader class="py-10">
    <template #left>
      <NuxtLink to="/">
        <NuxtImg src="logos/logo.svg" class="py-2" height="150" width="150" />
      </NuxtLink>
    </template>

    <!-- <UNavigationMenu :items="items" variant="link" /> -->

    <template #right>
      <div class="flex flex-row jusitfy-center items-center gap-2">
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
      </div>
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
    </template>

    <template #content>
      <!-- <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" /> -->
    </template>
  </UHeader>

  <!-- Auth Modal -->
  <AuthModal v-if="auth.modal" />
</template>
