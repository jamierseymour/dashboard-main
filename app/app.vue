<script setup lang="ts">
import { useAuth } from "~/stores/auth";
import type { ToasterProps } from "#ui/types";

const colorMode = useColorMode();

const color = computed(() =>
  colorMode.value === "dark" ? "#1b1718" : "white"
);

useHead({
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { key: "theme-color", name: "theme-color", content: color },
  ],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "en",
  },
});

const auth = useAuth();

// Initialize authentication state only once when app mounts
onMounted(async () => {
  // Only initialize if not already hydrated
  if (!auth.hydrated) {
    await auth.init();
  }
  console.log("🟢 App mounted, auth initialized");
});

// Watch for modal state changes
watch(() => auth.modal, (newValue, oldValue) => {
  console.log("🟢 Auth modal state changed from", oldValue, "to", newValue);
});

const title = "Own Your Events - Events at your finger tips";
const description = "plan less, party more - events without the stress";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "/public/logos/logo.png",
  twitterImage: "/public/logos/logo.png",
  twitterCard: "summary_large_image",
});

const toasterProps: ToasterProps = {
  position: "bottom-left",
  duration: 5000,
};
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
