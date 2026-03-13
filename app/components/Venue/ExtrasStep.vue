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

// Ensure amenities object exists in the form data
if (!form.value.amenities) {
  form.value.amenities = {
    wifi: false,
    kitchen: false,
    stage: false,
    bar: false,
    soundSystem: false,
    lighting: false,
    projector: false,
    microphone: false,
    airConditioning: false,
    heating: false,
    tables: 0,
    chairs: 0,
    danceFloor: false,
    outdoorSpace: false,
    indoorSpace: false,
    customAmenities: [],
  };
}

// For custom amenities input
const newCustomAmenity = ref("");

const amenities = computed({
  get: () => {
    // Return default empty object if amenities don't exist
    return (
      props.formData.amenities || {
        wifi: false,
        kitchen: false,
        stage: false,
        bar: false,
        soundSystem: false,
        lighting: false,
        projector: false,
        microphone: false,
        airConditioning: false,
        heating: false,
        tables: 0,
        chairs: 0,
        danceFloor: false,
        outdoorSpace: false,
        indoorSpace: false,
        customAmenities: [],
      }
    );
  },
  set: (value) => {
    // Create a new copy of formData with updated amenities
    const updatedFormData = {
      ...props.formData,
      amenities: value,
    };
    emit("update:formData", updatedFormData);
  },
});

const addCustomAmenity = () => {
  if (newCustomAmenity.value.trim()) {
    // Initialize amenities if it doesn't exist
    form.value.amenities = form.value.amenities ?? {
      wifi: false,
      kitchen: false,
      stage: false,
      bar: false,
      soundSystem: false,
      lighting: false,
      projector: false,
      microphone: false,
      airConditioning: false,
      heating: false,
      tables: 0,
      chairs: 0,
      danceFloor: false,
      outdoorSpace: false,
      indoorSpace: false,
      customAmenities: [],
    };

    // Initialize customAmenities if it doesn't exist
    form.value.amenities.customAmenities =
      form.value.amenities.customAmenities ?? [];

    form.value.amenities.customAmenities.push(newCustomAmenity.value.trim());
    newCustomAmenity.value = "";
  }
};

const removeCustomAmenity = (index: number) => {
  if (form.value.amenities?.customAmenities) {
    form.value.amenities.customAmenities.splice(index, 1);
  }
};
</script>

<template>
  <div class="w-full flex justify-center items-center p-4 sm:p-8 lg:p-12">
    <div class="flex flex-col w-full sm:w-3/4 lg:w-1/2 gap-6">
      <h2 class="text-2xl font-bold">Venue Extras and Amenities</h2>
      <p class="text-gray-600 dark:text-gray-400">
        Select all amenities available at your venue
      </p>

      <!-- Accommodation -->
      <div class="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
        <div>
          <p class="font-medium text-sm">On-site Accommodation</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Guests can sleep at or adjacent to the venue</p>
        </div>
        <USwitch
          v-model="form.accommodationAvailable"
          color="primary"
          class="cursor-pointer"
        />
      </div>

      <!-- Amenities section -->
      <div class="grid grid-cols-2 gap-4">
        <UCheckbox v-model="amenities.wifi" label="WiFi" />
        <UCheckbox v-model="amenities.kitchen" label="Kitchen" />
        <UCheckbox v-model="amenities.stage" label="Stage" />
        <UCheckbox v-model="amenities.bar" label="Bar" />
        <UCheckbox v-model="amenities.soundSystem" label="Sound System" />
        <UCheckbox v-model="amenities.lighting" label="Lighting" />
        <UCheckbox v-model="amenities.projector" label="Projector" />
        <UCheckbox v-model="amenities.microphone" label="Microphone" />
        <UCheckbox
          v-model="amenities.airConditioning"
          label="Air Conditioning"
        />
        <UCheckbox v-model="amenities.heating" label="Heating" />
        <UCheckbox v-model="amenities.danceFloor" label="Dance Floor" />
        <UCheckbox v-model="amenities.outdoorSpace" label="Outdoor Space" />
        <UCheckbox v-model="amenities.indoorSpace" label="Indoor Space" />
      </div>

      <!-- Quantity inputs -->
      <div class="flex flex-col gap-4 mt-2">
        <h3 class="text-lg font-medium">Furniture Available</h3>
        <div class="flex flex-row gap-4">
          <UInput
            v-model="amenities.tables"
            type="number"
            min="0"
            placeholder="Number of Tables"
          />
          <UInput
            v-model="amenities.chairs"
            type="number"
            min="0"
            placeholder="Number of Chairs"
          />
        </div>
      </div>

      <!-- Custom amenities section -->
      <div class="mt-4">
        <h3 class="text-lg font-medium mb-2">Additional Amenities</h3>
        <div class="flex flex-row gap-2 mb-2">
          <UInput
            v-model="newCustomAmenity"
            placeholder="Add custom amenity"
            class="flex-grow"
            @keyup.enter="addCustomAmenity"
          />
          <UButton
            color="primary"
            icon="i-lucide-plus"
            @click="addCustomAmenity"
          >
            Add
          </UButton>
        </div>

        <!-- Custom amenities list -->
        <div
          v-if="
            form.amenities?.customAmenities &&
            form.amenities.customAmenities.length > 0
          "
          class="mt-3"
        >
          <UBadge
            v-for="(amenity, index) in form.amenities.customAmenities"
            :key="index"
            class="mr-2 mb-2"
          >
            {{ amenity }}
            <button class="ml-1 text-xs cursor-pointer" @click="removeCustomAmenity(index)">
              ×
            </button>
          </UBadge>
        </div>
        <p v-else class="text-sm text-gray-500">
          Add any additional amenities your venue offers
        </p>
      </div>
    </div>
  </div>
</template>
