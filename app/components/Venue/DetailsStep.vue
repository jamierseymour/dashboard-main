<!-- Updated Main Component -->
<script setup lang="ts">
import type { VenueFormData } from "~/types/venue";
import type { EventType } from "~/types/venue";

const props = defineProps<{
  formData: VenueFormData;
}>();

const emit = defineEmits<{
  "update:formData": [data: VenueFormData];
}>();


const availableEventTypes: { label: string; value: EventType }[] = [
  { label: "Wedding", value: "Wedding" },
  { label: "Conference", value: "Conference" },
  { label: "Corporate Event", value: "Corporate Event" },
  { label: "Birthday", value: "Birthday" },
  { label: "Corporate", value: "Corporate" },
  { label: "Concert", value: "Concert" },
  { label: "Exhibition", value: "Exhibition" },
  { label: "Workshop", value: "Workshop" },
  { label: "Social", value: "Social" },
  { label: "Private Party", value: "Private Party" },
  { label: "Team Building", value: "Team Building" },
  { label: "Other", value: "Other" },
];


// Create computed properties for two-way binding
const form = computed({
  get: () => props.formData,
  set: (value) => emit("update:formData", value),
});
</script>

<template>
  <div class="w-full flex justify-center items-center p-12">
    <div class="flex flex-col w-1/2 gap-3">
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
        placeholder="Short description detailing your venue"
        class="w-full"
      />


      <div class="flex flex-row gap-3">
        <USelectMenu
          v-model="form.eventTypes"
          multiple
          selected-icon="i-bx-party"
          class="h-full w-full"
          placeholder="Event Types Offered (Select as many as applicable)"
          :options="availableEventTypes"
        />
      </div>

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

      <div class="flex flex-row gap-3">
        <UInput
          v-model="form.price"
          color="primary"
          variant="outline"
          placeholder="Average price"
          type="number"
        >
          <template #leading>
            <span class="text-gray-500 dark:text-gray-400 text-xs">R</span>
          </template>
        </UInput>
      </div>
    </div>
  </div>
</template>
