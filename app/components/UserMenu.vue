<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { useAuth } from "~/stores/auth";

defineProps<{
  collapsed?: boolean;
}>();

const colorMode = useColorMode();
const appConfig = useAppConfig();
const auth = useAuth();

const colors = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];
const neutrals = ["slate", "gray", "zinc", "neutral", "stone"];

// Use computed to reactively get user data from auth store
const user = computed(() => {
  // If user is authenticated and has profile data
  if (auth.loggedIn && auth.profile) {
    return {
      name: auth.profile.name || auth.user?.email || "User",
      avatar: {
        src:
          auth.profile.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            auth.profile.name || "U"
          )}&background=FFBE61&color=000000`,
        alt: auth.profile.name || "User Avatar",
      },
    };
  }

  // If user is authenticated but no profile yet
  if (auth.loggedIn && auth.user) {
    return {
      name: auth.user.email || "User",
      avatar: {
        src: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          auth.user.email?.charAt(0).toUpperCase() || "U"
        )}&background=FFBE61&color=000000`,
        alt: "User Avatar",
      },
    };
  }

  // Default fallback (should not happen if UserMenu is only shown when logged in)
  return {
    name: "Guest",
    avatar: {
      src: "https://ui-avatars.com/api/?name=G&background=FFBE61&color=000000",
      alt: "Guest Avatar",
    },
  };
});

// Handle logout
const handleLogout = async () => {
  // signOut now handles navigation and error cleanup internally
  await auth.signOut();
};

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: "label",
      label: user.value.name,
      avatar: user.value.avatar,
    },
  ],
  [
    {
      label: "Profile",
      icon: "i-lucide-user",
    },
    {
      label: "Billing",
      icon: "i-lucide-credit-card",
    },
    {
      label: "Settings",
      icon: "i-lucide-settings",
      to: "/settings",
    },
  ],
  [
    {
      label: "Theme",
      icon: "i-lucide-palette",
      children: [
        {
          label: "Primary",
          slot: "chip",
          chip: appConfig.ui.colors.primary,
          content: {
            align: "center",
            collisionPadding: 16,
          },
          children: colors.map((color) => ({
            label: color,
            chip: color,
            slot: "chip",
            checked: appConfig.ui.colors.primary === color,
            type: "checkbox",
            onSelect: (e) => {
              e.preventDefault();

              appConfig.ui.colors.primary = color;
            },
          })),
        },
        {
          label: "Neutral",
          slot: "chip",
          chip: appConfig.ui.colors.neutral,
          content: {
            align: "end",
            collisionPadding: 16,
          },
          children: neutrals.map((color) => ({
            label: color,
            chip: color,
            slot: "chip",
            type: "checkbox",
            checked: appConfig.ui.colors.neutral === color,
            onSelect: (e) => {
              e.preventDefault();

              appConfig.ui.colors.neutral = color;
            },
          })),
        },
      ],
    },
    {
      label: "Appearance",
      icon: "i-lucide-sun-moon",
      children: [
        {
          label: "Light",
          icon: "i-lucide-sun",
          type: "checkbox",
          checked: colorMode.value === "light",
          onSelect(e: Event) {
            e.preventDefault();

            colorMode.preference = "light";
          },
        },
        {
          label: "Dark",
          icon: "i-lucide-moon",
          type: "checkbox",
          checked: colorMode.value === "dark",
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = "dark";
            }
          },
          onSelect(e: Event) {
            e.preventDefault();
          },
        },
      ],
    },
  ],
  [
    {
      label: "Templates",
      icon: "i-lucide-layout-template",
      children: [
        {
          label: "Starter",
          to: "https://ui-pro-starter.nuxt.dev/",
        },
        {
          label: "Landing",
          to: "https://landing-template.nuxt.dev/",
        },
        {
          label: "Docs",
          to: "https://docs-template.nuxt.dev/",
        },
        {
          label: "SaaS",
          to: "https://saas-template.nuxt.dev/",
        },
        {
          label: "Dashboard",
          to: "https://dashboard-template.nuxt.dev/",
          checked: true,
          type: "checkbox",
        },
      ],
    },
  ],
  // [
  //   {
  //     label: "Documentation",
  //     icon: "i-lucide-book-open",
  //     to: "https://ui.nuxt.com/getting-started/installation/pro/nuxt",
  //     target: "_blank",
  //   },
  //   {
  //     label: "GitHub repository",
  //     icon: "i-simple-icons-github",
  //     to: "https://github.com/nuxt-ui-pro/dashboard",
  //     target: "_blank",
  //   },
  //   {
  //     label: "Upgrade to Pro",
  //     icon: "i-lucide-rocket",
  //     to: "https://ui.nuxt.com/pro/purchase",
  //     target: "_blank",
  //   },
  // ],
  [
    {
      label: "Log out",
      icon: "i-lucide-log-out",
      onSelect: handleLogout,
    },
  ],
]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)',
    }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-(--ui-bg-elevated)"
      :ui="{
        trailingIcon: 'text-(--ui-text-dimmed)',
      }"
    />

    <template #chip-leading="{ item }">
      <span
        :style="{ '--chip': `var(--color-${(item as any).chip}-400)` }"
        class="ms-0.5 size-2 rounded-full bg-(--chip)"
      />
    </template>
  </UDropdownMenu>
</template>
