<script setup lang="ts">
import type { VenueFormData } from "~/types/venue";
import { ref, watch } from "vue";

const props = defineProps<{
  formData: VenueFormData;
}>();

const emit = defineEmits<{
  "update:formData": [data: VenueFormData];
}>();

const photos = ref<string[]>(props.formData.photos || []);

const updateFormData = (key: keyof VenueFormData, value: any) => {
  emit("update:formData", {
    ...props.formData,
    [key]: value,
  });
};

const onImagesUpdate = (imageUrls: string[]) => {
  photos.value = imageUrls;
  updateFormData("photos", imageUrls);
};

// Keep photos in sync with formData props if it changes externally
watch(
  () => props.formData.photos,
  (newPhotos) => {
    if (
      newPhotos &&
      JSON.stringify(newPhotos) !== JSON.stringify(photos.value)
    ) {
      photos.value = newPhotos;
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="w-full p-12">
    <h2 class="text-2xl font-semibold mb-6">Venue Photos</h2>
    <p class="text-gray-600 mb-4">
      Upload up to 8 photos of your venue. Drag to reorder.
    </p>

    <FormImageUploader
      :initialImages="photos"
      bucketName="venue-photos"
      folderPath="venues"
      @update:images="onImagesUpdate"
    />

    <!-- Other form fields would go here -->
  </div>
</template>
