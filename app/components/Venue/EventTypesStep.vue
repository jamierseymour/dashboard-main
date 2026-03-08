<script setup lang="ts">
import type { VenueFormData, EventType } from "~/types/venue";

const props = defineProps<{
  formData: VenueFormData;
}>();

const emit = defineEmits<{
  "update:formData": [data: VenueFormData];
}>();

const eventTypes = [
  { id: "Wedding", icon: "i-lucide-heart", label: "Wedding" },
  { id: "Engagement Party", icon: "i-lucide-ring", label: "Engagement Party" },
  { id: "Kitchen Tea", icon: "i-lucide-coffee", label: "Kitchen Tea / Bridal Shower" },
  { id: "Anniversary", icon: "i-lucide-sparkles", label: "Anniversary" },
  { id: "Birthday", icon: "i-lucide-cake", label: "Birthday" },
  { id: "Matric Farewell", icon: "i-lucide-graduation-cap", label: "Matric Farewell" },
  { id: "Social", icon: "i-lucide-users", label: "Social Gathering" },
  { id: "Other", icon: "i-lucide-more-horizontal", label: "Other" },
] as const;

const toggleEventType = (type: EventType) => {
  const currentTypes = props.formData.eventTypes || [];
  const isSelected = currentTypes.includes(type);

  if (isSelected) {
    // Remove the type
    emit("update:formData", {
      ...props.formData,
      eventTypes: currentTypes.filter((t) => t !== type),
    });
  } else {
    // Add the type
    emit("update:formData", {
      ...props.formData,
      eventTypes: [...currentTypes, type],
    });
  }
};

const isSelected = (type: EventType) => {
  return props.formData.eventTypes?.includes(type) || false;
};
</script>

<template>
  <div class="w-full flex justify-center items-center p-4 sm:p-8 lg:p-12">
    <div class="flex flex-col w-full max-w-6xl gap-6">
      <div class="text-center mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Select all event types that your venue can host (multiple selection)
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="type in eventTypes"
          :key="type.id"
          class="relative cursor-pointer group"
          @click="toggleEventType(type.id)"
        >
          <div
            class="h-full border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
            :class="[
              isSelected(type.id)
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50',
            ]"
          >
            <!-- Selection Indicator -->
            <div
              v-if="isSelected(type.id)"
              class="absolute top-2 right-2"
            >
              <UIcon
                name="i-lucide-check-circle"
                class="w-5 h-5 text-primary"
              />
            </div>

            <!-- Icon -->
            <div class="flex justify-center mb-4">
              <div
                class="p-4 rounded-full transition-all duration-300"
                :class="[
                  isSelected(type.id)
                    ? 'bg-primary/20'
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10',
                ]"
              >
                <UIcon
                  :name="type.icon"
                  class="w-8 h-8 transition-colors duration-300"
                  :class="[
                    isSelected(type.id)
                      ? 'text-primary'
                      : 'text-gray-600 dark:text-gray-400 group-hover:text-primary',
                  ]"
                />
              </div>
            </div>

            <!-- Label -->
            <div class="text-center">
              <h3
                class="text-sm font-semibold transition-colors duration-300"
                :class="[
                  isSelected(type.id)
                    ? 'text-primary'
                    : 'text-gray-900 dark:text-white group-hover:text-primary',
                ]"
              >
                {{ type.label }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
