<script setup lang="ts">
import type { VenueFormData, VenueCategory } from "~/types/venue";

const props = defineProps<{
  formData: VenueFormData;
}>();

const emit = defineEmits<{
  "update:formData": [data: VenueFormData];
  "next": [];
}>();

const categories = [
  {
    id: "wedding" as VenueCategory,
    title: "Wedding Venue",
    description: "Perfect for hosting weddings, receptions, and related celebrations",
    icon: "i-lucide-heart",
  },
  {
    id: "general" as VenueCategory,
    title: "General Venue",
    description: "Suitable for conferences, corporate events, parties, and other gatherings",
    icon: "i-lucide-building-2",
  },
];

const selectCategory = (category: VenueCategory) => {
  emit("update:formData", {
    ...props.formData,
    venueCategory: category,
    venueType: null, // Reset venue type when category changes
  });

  // Auto-advance to next step after a brief delay for visual feedback
  setTimeout(() => {
    emit("next");
  }, 300);
};
</script>

<template>
  <div class="w-full flex justify-center items-center p-4 sm:p-8 lg:p-12">
    <div class="flex flex-col w-full max-w-4xl gap-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          class="relative cursor-pointer group"
          @click="selectCategory(category.id)"
        >
          <div
            class="h-full border-2 rounded-xl p-8 transition-all duration-300 hover:shadow-xl"
            :class="[
              formData.venueCategory === category.id
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50',
            ]"
          >
            <!-- Selection Indicator -->
            <div
              v-if="formData.venueCategory === category.id"
              class="absolute top-4 right-4"
            >
              <UIcon
                name="i-lucide-check-circle"
                class="w-6 h-6 text-primary"
              />
            </div>

            <!-- Icon -->
            <div class="flex justify-center mb-6">
              <div
                class="p-6 rounded-full transition-all duration-300"
                :class="[
                  formData.venueCategory === category.id
                    ? 'bg-primary/20'
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10',
                ]"
              >
                <UIcon
                  :name="category.icon"
                  class="w-12 h-12 transition-colors duration-300"
                  :class="[
                    formData.venueCategory === category.id
                      ? 'text-primary'
                      : 'text-gray-600 dark:text-gray-400 group-hover:text-primary',
                  ]"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="text-center">
              <h3
                class="text-2xl font-bold mb-3 transition-colors duration-300"
                :class="[
                  formData.venueCategory === category.id
                    ? 'text-primary'
                    : 'text-gray-900 dark:text-white group-hover:text-primary',
                ]"
              >
                {{ category.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                {{ category.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
