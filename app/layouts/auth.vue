<script setup lang="ts">
import AppHeader from "~/components/AppHeader.vue";
import MobileBottomNav from "~/components/MobileBottomNav.vue";
// import AppFooter from '~/components/AppFooter.vue'
</script>

<template>
  <AppHeader />

  <!-- <UButton
    icon="i-lucide-chevron-left"
    to="/"
    size="xl"
    color="neutral"
    variant="subtle"
    class="absolute mt-12 ml-24 rounded-full z-10"
  /> -->
  <div class="h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full rounded-xl border border-dark-50 p-4">
      <slot />
    </div>
  </div>

  <MobileBottomNav />
</template>
