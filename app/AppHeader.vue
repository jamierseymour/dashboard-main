<script setup lang="ts">
import { useAuth } from '~/stores/auth'

import AuthModal from '~/components/AuthModal.vue'

const { activeHeadings, updateHeadings } = useScrollspy()

const auth = useAuth()
const user = useSupabaseUser()

const items = computed(() => [
  {
    label: 'Features',
    to: '#features',
    active:
      activeHeadings.value.includes('features')
      && !activeHeadings.value.includes('templates')
  },
  {
    label: 'Templates',
    to: '#templates',
    active:
      activeHeadings.value.includes('templates')
      && !activeHeadings.value.includes('pricing')
  },
  {
    label: 'Pricing',
    to: '#pricing',
    active:
      activeHeadings.value.includes('pricing')
      && !activeHeadings.value.includes('testimonials')
  },
  {
    label: 'Testimonials',
    to: '#testimonials',
    active:
      activeHeadings.value.includes('testimonials')
      && !activeHeadings.value.includes('faq')
  },
  {
    label: 'FAQ',
    to: '#faq',
    active: activeHeadings.value.includes('faq')
  }
])

const dropdownItems = computed(() => [
  [
    {
      label: user.value?.email || 'No email',
      slot: 'account',
      disabled: true
    }
  ],
  [
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-8-tooth',
      click: () => console.log('Settings clicked')
    }
  ],
  [
    {
      label: 'Documentation',
      icon: 'i-heroicons-book-open',
      click: () => console.log('Documentation clicked')
    },
    {
      label: 'Changelog',
      icon: 'i-heroicons-megaphone',
      click: () => console.log('Changelog clicked')
    },
    {
      label: 'Status',
      icon: 'i-heroicons-signal',
      click: () => console.log('Status clicked')
    }
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: () => logout()
    }
  ]
])

const logout = async () => {
  console.log('Logging out...')
  const { error } = await useSupabaseClient().auth.signOut()
  if (error) {
    console.error('Error logging out:', error)
  } else {
    navigateTo('/')
  }
}

// Handle click on dropdown item
const handleItemClick = (item) => {
  if (item.click && !item.disabled) {
    item.click()
  }
}

// nuxtApp.hooks.hookOnce("page:finish", () => {
//   updateHeadings([
//     document.querySelector("#features"),
//     document.querySelector("#templates"),
//     document.querySelector("#pricing"),
//     document.querySelector("#testimonials"),
//     document.querySelector("#faq"),
//   ]);
// });

console.log('auth', auth)

const handleSignUp = () => {
  console.log('Sign up clicked')
  console.log('auth', auth)
}
</script>

<template>
  <UHeader class="py-10">
    <template #left>
      <NuxtLink to="/">
        <NuxtImg
          src="logos/logo.svg"
          class="py-2"
          height="150"
          width="150"
        />
      </NuxtLink>
    </template>

    <UColorModeButton />

    <!-- AUTH: {{ auth }} -->

    <!-- <UNavigationMenu :items="items" variant="link" /> -->

    <template #right>
      <div v-if="!user" class="flex flex-row jusitfy-center items-center gap-2">
        <p class="px-4 font-bold cursor-pointer">
          <NuxtLink to="/new-venue"> List your business </NuxtLink>
        </p>
        <UButton
          label="Sign up"
          icon="i-heroicons-arrow-right-20-solid"
          trailing
          class="hidden rounded-full cursor-pointer lg:flex"
          @click="handleSignUp()"
        />
      </div>
      <div v-else-if="user">
        <UDropdownMenu
          :items="dropdownItems"
          :ui="{
            content: 'cursor-pointer',
            item: 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
          }"
          :popper="{ placement: 'bottom-start' }"
        >
          <UAvatar
            class="cursor-pointer"
            src="https://avatars.githubusercontent.com/u/739984?v=4"
          />

          <template #account="{ item }">
            <div class="text-left">
              <p>Signed in as</p>
              <p class="truncate font-medium text-gray-900 dark:text-white">
                {{ item.label }}
              </p>
            </div>
          </template>

          <!-- Fixed item template to handle clicks properly -->
          <template #item="{ item }">
            <div
              class="flex items-center w-full"
              :class="{ 'opacity-50': item.disabled }"
              @click="handleItemClick(item)"
            >
              <span class="truncate">{{ item.label }}</span>
              <UIcon
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

<style scoped>
/* Add any additional styles here if needed */
</style>
