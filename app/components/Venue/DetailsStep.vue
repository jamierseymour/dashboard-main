<!-- Updated Main Component -->
<script setup lang="ts">
import type { VenueFormData } from "~/types/venue";

const props = defineProps<{
  formData: VenueFormData;
}>();

const emit = defineEmits<{
  "update:formData": [data: VenueFormData];
}>();

// Create computed properties for two-way binding
const form = computed({
  get: () => props.formData,
  set: (value) => emit("update:formData", value),
});
</script>

<template>
  <div class="w-full flex justify-center items-center p-4 sm:p-8 lg:p-12">
    <div class="flex flex-col w-full sm:w-3/4 lg:w-1/2 gap-3">
      <!-- Basic Info -->
      <UInput
        v-model="form.venueName"
        color="primary"
        variant="outline"
        placeholder="Venue Name"
        class="w-full"
      />
      <UInput
        v-model="form.companyName"
        color="primary"
        variant="outline"
        placeholder="Company Name (optional)"
        class="w-full"
      />

      <UTextarea
        v-model="form.description"
        color="primary"
        variant="outline"
        autoresize
        :rows="5"
        placeholder="Short description detailing your venue"
        class="w-full"
      />

      <div class="flex flex-row gap-3">
        <UInput
          v-model="form.minCapacity"
          color="primary"
          variant="outline"
          placeholder="Min Capacity"
        >
          <template #trailing>
            <span class="text-gray-500 dark:text-gray-400 text-xs">pax</span>
          </template>
        </UInput>

        <UInput
          v-model="form.maxCapacity"
          color="primary"
          variant="outline"
          placeholder="Max Capacity"
        >
          <template #trailing>
            <span class="text-gray-500 dark:text-gray-400 text-xs">pax</span>
          </template>
        </UInput>
      </div>
    </div>
  </div>
</template>
