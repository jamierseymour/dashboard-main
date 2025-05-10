<script setup lang="ts">
import AppHeader from "~/components/AppHeader.vue";

const route = useRoute();
const toast = useToast();

const open = ref(false);

const links = [
  [
    {
      label: "today",
      icon: "i-lucide-sun",
      to: "/dashboard",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "calendar",
      icon: "i-lucide-calendar",
      to: "/calendar",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "listings",
      icon: "i-lucide-home",
      to: "/listings",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "bookings",
      icon: "i-lucide-bookmark",
      to: "/bookings",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "insights",
      icon: "i-lucide-bar-chart-2",
      to: "/insights",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "guidebooks",
      icon: "i-lucide-file",
      to: "/guidebooks",
      onSelect: () => {
        open.value = false;
      },
    },
  ],
  [
    {
      label: "Profile",
      icon: "i-lucide-user",
      to: "/customers",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "inbox",
      icon: "i-lucide-inbox",
      to: "/inbox",
      badge: "4",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Settings",
      to: "/settings",
      icon: "i-lucide-settings",
      defaultOpen: true,
      children: [
        {
          label: "General",
          to: "/settings",
          exact: true,
          onSelect: () => {
            open.value = false;
          },
        },
        {
          label: "Members",
          to: "/settings/members",
          onSelect: () => {
            open.value = false;
          },
        },
        {
          label: "Notifications",
          to: "/settings/notifications",
          onSelect: () => {
            open.value = false;
          },
        },
        {
          label: "Security",
          to: "/settings/security",
          onSelect: () => {
            open.value = false;
          },
        },
      ],
    },
  ],
  [
    {
      label: "create a new listing",
      icon: "i-lucide-plus",
      to: "/new-venue",
      // target: '_blank'
    },
    {
      label: "help & support",
      icon: "i-lucide-info",
      to: "https://github.com/nuxt/ui-pro",
      target: "_blank",
    },
  ],
];

// const newlinks = [

// [
//   {
//     label: 'profile',
//     icon: 'i-lucide-user',
//     to: '/profile',
//     onSelect: () => {
//       open.value = false
//     }
//   },
//   {
//     label: 'inbox',
//     icon: 'i-lucide-inbox',
//     to: '/inbox',
//     onSelect: () => {
//       open.value = false
//     }
//   },
//   {
//     label: 'settings',
//     icon: 'i-lucide-settings',
//     to: '/settings',
//     onSelect: () => {
//       open.value = false
//     }
//   },
//   {
//     label: 'notifications',
//     icon: 'i-lucide-bell',
//     to: '/notifications',
//     onSelect: () => {
//       open.value = false
//     }
//   },
//   {
//     label: 'create a new listing',
//     icon: 'i-lucide-plus',
//     to: '/create-listing',
//     onSelect: () => {
//       open.value = false
//     }
//   }
// ]
// ]

const groups = computed(() => [
  {
    id: "links",
    label: "Go to",
    items: links.flat(),
  },
  {
    id: "code",
    label: "Code",
    items: [
      {
        id: "source",
        label: "View page source",
        icon: "i-simple-icons-github",
        to: `https://github.com/nuxt-ui-pro/dashboard/blob/main/app/pages${
          route.path === "/" ? "/index" : route.path
        }.vue`,
        target: "_blank",
      },
    ],
  },
]);

onMounted(async () => {
  const cookie = useCookie("cookie-consent");
  if (cookie.value === "accepted") {
    return;
  }

  toast.add({
    title:
      "We use first-party cookies to enhance your experience on our website.",
    duration: 0,
    close: false,
    actions: [
      {
        label: "Accept",
        color: "neutral",
        variant: "outline",
        onClick: () => {
          cookie.value = "accepted";
        },
      },
      {
        label: "Opt out",
        color: "neutral",
        variant: "ghost",
      },
    ],
  });
});
</script>

<template>
  <!-- <AppHeader /> -->

  <UDashboardGroup unit="rem" >
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-(--ui-bg-elevated)/25"
      :ui="{ footer: 'lg:border-t lg:border-(--ui-border)' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-(--ui-border)"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
        />

        <div>
          <div class="text-sm">account</div>
          <!-- <divider class="my-2" /> -->
        </div>

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[2]"
          orientation="vertical"
          class="mt-auto"
        />

        <!-- <UNavigationMenu
          :collapsed="collapsed"
          :items="newlinks"
          orientation="vertical"
          class="mt-auto"
        /> -->
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
