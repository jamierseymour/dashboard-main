<!-- <script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
</script> -->

<template>
  <div>
    <AppHeader />

    <UMain>
      <slot />
    </UMain>

    <!-- <AppFooter /> -->
  </div>
</template>
