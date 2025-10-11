<script setup lang="ts">
import { logoSvg } from "~/assets/OyeIcons";

const columns = [
  // {
  //   label: "Resources",
  //   children: [
  //     {
  //       label: "Help center",
  //     },
  //     {
  //       label: "Docs",
  //     },
  //     {
  //       label: "Roadmap",
  //     },
  //     {
  //       label: "Changelog",
  //     },
  //   ],
  // },
  // {
  //   label: "Features",
  //   children: [
  //     {
  //       label: "Affiliates",
  //     },
  //     {
  //       label: "Portal",
  //     },
  //     {
  //       label: "Jobs",
  //     },
  //     {
  //       label: "Sponsors",
  //     },
  //   ],
  // },
  {
    label: "Company",
    children: [
      {
        label: "About",
      },
      {
        label: "Blog",
      },
      {
        label: "Contact us",
      },
    ],
  },
];

const email = ref("");
const loading = ref(false);

function onSubmit() {
  loading.value = true;

  // toast.add({
  //   title: 'Subscribed!',
  //   description: 'You\'ve been subscribed to our newsletter.'
  // })
}
</script>

<template>
  <div class="relative h-px mt-6 bg-gray-200 dark:bg-gray-800">
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-900 px-3">
        <UIcon
          src="/logos/logo-no-text.svg"
          alt="Logo"
          :path="logoSvg"
          class="w-24 h-24 mt-2 -mx-2"
        />
      </div>
    </div>
  </div>
  <UFooter
    :ui="{ top: 'border-b border-[var(--ui-border)]' }"
    class="bg-gray-50"
  >
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns" :ui="{ link: 'cursor-pointer' }">
          <template #right>
            <form @submit.prevent="onSubmit">
              <UFormField
                name="email"
                label="Subscribe to our newsletter"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  placeholder="Enter your email"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="neutral"
                      label="Subscribe"
                    />
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm text-(--ui-text-muted)">
        Own Your Events © {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <UButton
        to="https://instagram.com"
        target="_blank"
        icon="i-simple-icons-instagram"
        aria-label="Instagram"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://tiktok.com"
        target="_blank"
        icon="i-simple-icons-tiktok"
        aria-label="TikTok"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://facebook.com"
        target="_blank"
        icon="i-simple-icons-facebook"
        aria-label="Facebook"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://linkedin.com"
        target="_blank"
        icon="i-simple-icons-linkedin"
        aria-label="LinkedIn"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
