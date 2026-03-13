<script setup lang="ts">
definePageMeta({
  middleware: () => navigateTo('/users/profile/about', { replace: true }),
});
</script>

<template>
  <div></div>
</template>