<script setup lang="ts">
import { useAuth } from '~/stores/auth'
import type { ToasterProps } from '#ui/types'

const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const auth = useAuth()

const title = 'Own Your Events - Events at your finger tips'
const description = 'plan less, party more - events without the stress'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/public/logos/logo.png',
  twitterImage: '/public/logos/logo.png',
  twitterCard: 'summary_large_image'
})

const toasterProps: ToasterProps = {
  position: 'bottom-left',
  duration: 5000
}
</script>

<template>
  <UApp :toaster="toasterProps">
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <AuthModal v-if="auth.modal" />

      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
