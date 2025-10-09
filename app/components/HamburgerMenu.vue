<script setup lang="ts">
import { useAuth } from "~/stores/auth";

const auth = useAuth();

// Menu items based on Airbnb design
const menuItems = computed(() => {
  const sections = [];

  if (auth.loggedIn) {
    // Section 1: User navigation
    sections.push([
      {
        label: "Wishlists",
        icon: "i-heroicons-heart",
        click: () => navigateTo("/wishlists"),
      },
      {
        label: "Bookings",
        icon: "i-heroicons-calendar",
        click: () => navigateTo("/bookings"),
      },
      {
        label: "Messages",
        icon: "i-heroicons-chat-bubble-left-right",
        click: () => navigateTo("/messages"),
      },
      {
        label: "Profile",
        icon: "i-heroicons-user-circle",
        click: () => navigateTo("/users/profile"),
      }
    ]);

    // Section 2: Account settings
    sections.push([
      {
        label: "Account settings",
        icon: "i-heroicons-cog-8-tooth",
        click: () => navigateTo("/settings"),
      }
    ]);

    // Section 3: Help & Languages
    sections.push([
      {
        label: "Languages & currency",
        icon: "i-heroicons-globe-alt",
        click: () => {},
      },
      {
        label: "Help Center",
        icon: "i-heroicons-question-mark-circle",
        click: () => {},
      }
    ]);

    // Section 4: Hosting
    if (auth.profile?.is_vendor) {
      sections.push([
        {
          label: "Switch to Hosting",
          icon: "i-heroicons-building-office",
          click: () => navigateTo("/dashboard"),
          featured: true,
          emoji: "🏠",
        }
      ]);

      // Section 5: Referrals
      sections.push([
        {
          label: "Refer a Service Provider",
          click: () => {},
        },
        {
          label: "Refer a Venue",
          click: () => {},
        }
      ]);
    } else {
      sections.push([
        {
          label: "Become a Service Provider",
          click: () => navigateTo("/dashboard"),
          featured: true,
          emoji: "✨",
        },
        {
          label: "List Your Venue",
          click: () => navigateTo("/venues/create"),
          featured: true,
          emoji: "🏢",
        }
      ]);

      // Section 5: Referrals
      sections.push([
        {
          label: "Refer a Service Provider",
          click: () => {},
        },
        {
          label: "Refer a Venue",
          click: () => {},
        }
      ]);
    }

    // Section 6: Logout
    sections.push([
      {
        label: "Log out",
        click: () => logout(),
      }
    ]);
  } else {
    sections.push([
      {
        label: "Sign up",
        click: () => auth.toggleModal(true),
        featured: true,
      },
      {
        label: "Log in",
        click: () => auth.toggleModal(true),
      }
    ]);

    sections.push([
      {
        label: "Help Center",
        icon: "i-heroicons-question-mark-circle",
        click: () => {},
      }
    ]);

    sections.push([
      {
        label: "Become a host",
        click: () => auth.toggleModal(true),
        featured: true,
      }
    ]);
  }

  return sections;
});

const logout = async () => {
  try {
    await auth.signOut();
    await navigateTo("/");
  } catch (error) {
    console.error("Error logging out:", error);
    await navigateTo("/");
  }
};

const handleItemClick = (item: any) => {
  if (item.click) {
    item.click();
  }
};
</script>

<template>
  <UDropdownMenu
    :items="menuItems"
    :ui="{
      content: 'min-w-[240px] cursor-pointer mr-8',
      item: 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
      divide: 'border-gray-200 dark:border-gray-700',
    }"
    :popper="{ placement: 'bottom-end' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-heroicons-bars-3"
      class="rounded-full p-2 hover:shadow-md transition-shadow cursor-pointer"
      square
    />

    <template #item="{ item }">
      <div
        class="flex items-center w-full py-2 px-1"
        :class="{
          'font-semibold': (item as any).featured,
        }"
        @click="handleItemClick(item)"
      >
        <span v-if="(item as any).emoji" class="flex-shrink-0 text-xl mr-3">
          {{ (item as any).emoji }}
        </span>
        <UIcon
          v-else-if="(item as any).icon"
          :name="(item as any).icon"
          class="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
        />
        <span class="truncate">{{ item.label }}</span>
      </div>
    </template>
  </UDropdownMenu>
</template>
