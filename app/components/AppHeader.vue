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
  console.log("Logging out...");
  try {
    // Use the auth store's signOut method instead of Supabase directly
    await auth.signOut();
    // Navigate to home page after successful logout
    await navigateTo("/");
  } catch (error) {
    console.error("Error logging out:", error);
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

console.log("auth", auth);

const handleSignUp = () => {
  auth.toggleModal(true);
};
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
          <NuxtLink to="/new-venue"> List your business </NuxtLink>
        </p>
        <UButton
          v-if="!auth.loggedIn"
          label="Sign up"
          icon="i-heroicons-arrow-right-20-solid"
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
          <UAvatar
            class="cursor-pointer"
            :src="
              auth.profile?.avatar_url ||
              'https://avatars.githubusercontent.com/u/739984?v=4'
            "
            :alt="auth.profile?.name || auth.user?.email"
          />

          <template #account="{ item }">
            <div class="text-left">
              <p>Signed in as</p>
              <p class="truncate font-medium text-gray-900 dark:text-white">
                {{ auth.profile?.name || item.label }}
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
              <!-- @ts-ignore - Complex union type from UDropdownMenu -->
              <UIcon
                v-if="item.icon"
                :name="item.icon"
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
</template>
