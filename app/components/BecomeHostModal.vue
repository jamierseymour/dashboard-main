<script setup lang="ts">
interface ModalProps {
  active: boolean;
}

const props = withDefaults(defineProps<ModalProps>(), {
  active: false,
});

const emit = defineEmits<{
  (event: "set-active", active: boolean): void;
}>();

const handleVenueClick = () => {
  navigateTo('/new-venue');
  emit("set-active", false);
};

const handleServiceClick = () => {
  navigateTo('/become-provider');
  emit("set-active", false);
};
</script>

<template>
  <UiModal
    :active="active"
    title="Become a Host"
    size="medium"
    @set-active="emit('set-active', $event)"
  >
    <div class="space-y-4">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Choose how you'd like to join our platform
      </p>

      <!-- List Your Venue Option -->
      <div
        class="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all duration-200 hover:border-primary-500 hover:shadow-md"
        @click="handleVenueClick"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20">
              <UIcon
                name="i-heroicons-building-office"
                class="h-6 w-6 text-primary-600 dark:text-primary-400"
              />
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
              List Your Venue
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Share your space with event planners and start earning
            </p>
          </div>
          <div class="flex-shrink-0">
            <UIcon
              name="i-heroicons-arrow-right"
              class="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
            />
          </div>
        </div>
      </div>

      <!-- Sign Up as Service Provider Option -->
      <div
        class="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all duration-200 hover:border-primary-500 hover:shadow-md"
        @click="handleServiceClick"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20">
              <UIcon
                name="i-heroicons-sparkles"
                class="h-6 w-6 text-primary-600 dark:text-primary-400"
              />
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Sign Up as Service Provider
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Offer your services to event organizers and grow your business
            </p>
          </div>
          <div class="flex-shrink-0">
            <UIcon
              name="i-heroicons-arrow-right"
              class="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  </UiModal>
</template>
