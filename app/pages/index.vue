<script setup lang="ts">
// Redirect to venues page
definePageMeta({
  layout: "default",
});

// Use middleware redirect to avoid navigation timeout
await navigateTo('/venues', { replace: true });
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <p class="text-gray-600">Redirecting...</p>
    </div>
  </div>
</template>
