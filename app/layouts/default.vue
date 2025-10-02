<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import MobileBottomNav from '~/components/MobileBottomNav.vue'
// import AppFooter from '~/components/AppFooter.vue'
</script>

<template>
  <div class="pb-16 md:pb-0">
    <AppHeader />

    <UMain>
      <slot />
    </UMain>

    <!-- Mobile Bottom Navigation -->
    <MobileBottomNav />

    <!-- <AppFooter /> -->
  </div>
</template>
