<script setup lang="ts">
import type { VenueFormData, WeddingVenueType, GeneralVenueType } from "~/types/venue";

const props = defineProps<{
  formData: VenueFormData;
}>();

const emit = defineEmits<{
  "update:formData": [data: VenueFormData];
  "next": [];
}>();

const weddingVenueTypes = [
  { id: "Garden Venue", icon: "i-lucide-flower-2", label: "Garden Venue" },
  { id: "Bushveld Venue", icon: "i-lucide-trees", label: "Bushveld Venue" },
  { id: "Country Venue", icon: "i-lucide-home", label: "Country Venue" },
  { id: "Forest Venue", icon: "i-lucide-tree-pine", label: "Forest Venue" },
  { id: "Farm Venue", icon: "i-lucide-wheat", label: "Farm Venue" },
  { id: "Beach Venue", icon: "i-lucide-waves", label: "Beach Venue" },
  { id: "City Venue", icon: "i-lucide-building-2", label: "City Venue" },
  { id: "Wine Farm Venue", icon: "i-lucide-grape", label: "Wine Farm Venue" },
] as const;

const generalVenueTypes = [
  { id: "House", icon: "i-lucide-home", label: "House" },
  { id: "Bar", icon: "i-lucide-beer", label: "Bar" },
  { id: "Garage", icon: "i-lucide-warehouse", label: "Garage" },
  { id: "Warehouse", icon: "i-lucide-package", label: "Warehouse" },
  { id: "Cabin", icon: "i-lucide-mountain", label: "Cabin" },
  { id: "Movie Theater", icon: "i-lucide-film", label: "Movie Theater" },
  { id: "Mansion", icon: "i-lucide-castle", label: "Mansion" },
  { id: "Community Center", icon: "i-lucide-users", label: "Community Center" },
  { id: "Castle", icon: "i-lucide-landmark", label: "Castle" },
  { id: "Basketball Court", icon: "i-lucide-circle-dot", label: "Basketball Court" },
  { id: "Commercial Kitchen", icon: "i-lucide-chef-hat", label: "Commercial Kitchen" },
  { id: "Barn", icon: "i-lucide-barn", label: "Barn" },
] as const;

const venueTypes = computed(() => {
  return props.formData.venueCategory === "wedding"
    ? weddingVenueTypes
    : generalVenueTypes;
});

const selectType = (type: WeddingVenueType | GeneralVenueType) => {
  emit("update:formData", {
    ...props.formData,
    venueType: type,
  });

  // Auto-advance to next step after a brief delay for visual feedback
  setTimeout(() => {
    emit("next");
  }, 300);
};
</script>

<template>
  <div class="w-full flex justify-center items-center p-4 sm:p-8 lg:p-12">
    <div class="flex flex-col w-full max-w-6xl gap-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="type in venueTypes"
          :key="type.id"
          class="relative cursor-pointer group"
          @click="selectType(type.id)"
        >
          <div
            class="h-full border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
            :class="[
              formData.venueType === type.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50',
            ]"
          >
            <!-- Selection Indicator -->
            <div
              v-if="formData.venueType === type.id"
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
                  formData.venueType === type.id
                    ? 'bg-primary/20'
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10',
                ]"
              >
                <UIcon
                  :name="type.icon"
                  class="w-8 h-8 transition-colors duration-300"
                  :class="[
                    formData.venueType === type.id
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
                  formData.venueType === type.id
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
