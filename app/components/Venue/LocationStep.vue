<template>
  <div class="w-full flex justify-center items-center p-4 sm:p-8 lg:p-12">
    <div class="flex flex-col w-full sm:w-3/4 lg:w-1/2 gap-6">
    <!-- Header -->
    <div class="space-y-1">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Venue Location</h2>
      <p class="text-gray-600 dark:text-gray-400">
        Search for your venue's address and verify the location details
      </p>
    </div>

    <!-- Address Search -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Search for your venue location <span class="text-red-500">*</span>
      </label>
      <GoogleAutocomplete
        placeholder="Search for venue address..."
        :component-restrictions="{ country: 'za' }"
        :location-bias="{ lat: -26.2041, lng: 28.0473 }"
        @place-selected="(place: any) => onPlaceSelected(place)"
        @input-changed="onInputChanged"
      />
      <div v-if="errors.address || errors.structuredAddress" class="text-red-500 text-sm">
        {{ errors.address || errors.structuredAddress }}
      </div>
      <div v-if="!isAddressValid" class="text-amber-600 text-sm flex items-center gap-1">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
        Please select a valid address from the dropdown suggestions
      </div>
    </div>

    <!-- Map Container -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Location on Map
      </label>
      <div
        ref="mapContainer"
        class="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center"
        :class="{ 'animate-pulse': isLoadingMap }"
      >
        <div v-if="!mapInitialized" class="text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-map" class="w-8 h-8 mb-2" />
          <p>Map will appear here when you select an address</p>
        </div>
      </div>
    </div>

    <!-- Editable Address Data -->
    <div v-if="formData.structuredAddress" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Address Details
        </h3>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          @click="showEditForm = !showEditForm"
        >
          {{ showEditForm ? 'Hide' : 'Edit' }} Details
        </UButton>
      </div>

      <!-- Address Display -->
      <div v-if="!showEditForm" class="space-y-3">
        <!-- Validation Status -->
        <div v-if="isAddressValid" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div class="flex items-center gap-2 text-green-700 dark:text-green-300">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
            <span class="font-medium">Valid address selected</span>
          </div>
        </div>

        <!-- Address Details -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <p class="font-medium">{{ formData.structuredAddress.formatted_address }}</p>
          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span class="font-medium">City:</span> {{ formData.structuredAddress.city }}
            </div>
            <div>
              <span class="font-medium">Province:</span> {{ formData.structuredAddress.state_province }}
            </div>
            <div>
              <span class="font-medium">Postal Code:</span> {{ formData.structuredAddress.postal_code }}
            </div>
            <div>
              <span class="font-medium">Country:</span> {{ formData.structuredAddress.country }}
            </div>
            <div class="col-span-2">
              <span class="font-medium">Coordinates:</span>
              {{ formatCoordinate(formData.structuredAddress.latitude) }}, {{ formatCoordinate(formData.structuredAddress.longitude) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Address Edit Form -->
      <div v-else class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-start gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-500 mt-0.5" />
            <div class="text-sm text-blue-700 dark:text-blue-300">
              <p class="font-medium">Edit Address Details</p>
              <p>Make any necessary changes to the address information. Required fields are marked with *</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Street Address" required :error="errors.address_line_1">
            <UInput
              v-model="editableAddress.address_line_1"
              placeholder="Street address"
              :color="errors.address_line_1 ? 'error' : 'primary'"
            />
          </UFormGroup>
          <UFormGroup label="Unit/Apartment (optional)">
            <UInput
              v-model="editableAddress.address_line_2"
              placeholder="Unit, apartment, etc."
              color="primary"
            />
          </UFormGroup>
          <UFormGroup label="City" required :error="errors.city">
            <UInput
              v-model="editableAddress.city"
              placeholder="City"
              :color="errors.city ? 'error' : 'primary'"
            />
          </UFormGroup>
          <UFormGroup label="Province" required :error="errors.state_province">
            <UInput
              v-model="editableAddress.state_province"
              placeholder="Province"
              :color="errors.state_province ? 'error' : 'primary'"
            />
          </UFormGroup>
          <UFormGroup label="Postal Code" required :error="errors.postal_code">
            <UInput
              v-model="editableAddress.postal_code"
              placeholder="Postal code"
              :color="errors.postal_code ? 'error' : 'primary'"
            />
          </UFormGroup>
          <UFormGroup label="Country" required :error="errors.country">
            <UInput
              v-model="editableAddress.country"
              placeholder="Country"
              :color="errors.country ? 'error' : 'primary'"
            />
          </UFormGroup>
          <UFormGroup label="Latitude" required :error="errors.coordinates">
            <UInput
              v-model="editableAddress.latitude"
              type="number"
              step="0.000001"
              placeholder="Latitude"
              :color="errors.coordinates ? 'error' : 'primary'"
            />
          </UFormGroup>
          <UFormGroup label="Longitude" required :error="errors.coordinates">
            <UInput
              v-model="editableAddress.longitude"
              type="number"
              step="0.000001"
              placeholder="Longitude"
              :color="errors.coordinates ? 'error' : 'primary'"
            />
          </UFormGroup>
        </div>
        <div class="flex gap-2">
          <UButton @click="updateAddressData" color="primary">
            Update Address
          </UButton>
          <UButton @click="cancelEdit" variant="ghost">
            Cancel
          </UButton>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VenueFormData, StructuredAddress } from "~/types/venue";
import GoogleAutocomplete from "~/components/Form/GoogleAutocomplete.vue";

const props = defineProps<{
  formData: VenueFormData;
}>();

const emit = defineEmits<{
  "update:formData": [data: VenueFormData];
}>();

// Refs
const mapContainer = ref<HTMLElement | null>(null);
const showEditForm = ref(false);
const isLoadingMap = ref(false);
const mapInitialized = ref(false);

// Validation
const errors = ref<Record<string, string>>({});
const isAddressValid = computed(() => {
  return props.formData.structuredAddress &&
         props.formData.structuredAddress.formatted_address &&
         props.formData.structuredAddress.latitude &&
         props.formData.structuredAddress.longitude;
});

// Helper function for coordinate display
const formatCoordinate = (coord: any): string => {
  if (coord === null || coord === undefined) return 'N/A';
  const num = typeof coord === 'number' ? coord : parseFloat(coord);
  return isNaN(num) ? coord.toString() : num.toFixed(6);
};

// Google Maps instances
let map: any = null;
let marker: any = null;

// Editable address data
const editableAddress = ref<Partial<StructuredAddress>>({});

// Initialize editable address when structured address changes
watch(
  () => props.formData.structuredAddress,
  (newStructuredAddress) => {
    if (newStructuredAddress) {
      editableAddress.value = { ...newStructuredAddress };
    }
  },
  { immediate: true }
);

// Initialize Google Maps
const initializeMap = async (lat: number, lng: number) => {
  if (!mapContainer.value) return;

  isLoadingMap.value = true;

  try {
    // Ensure Google Maps API is loaded
    await loadGoogleMapsAPI();

    // Create map
    map = new (window as any).google.maps.Map(mapContainer.value, {
      center: { lat, lng },
      zoom: 16,
      mapTypeId: (window as any).google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    // Create marker
    marker = new (window as any).google.maps.Marker({
      position: { lat, lng },
      map: map,
      draggable: true,
      title: "Venue Location",
    });

    // Handle marker drag events
    marker.addListener("dragend", (event: any) => {
      const position = event.latLng;
      if (position) {
        const newLat = position.lat();
        const newLng = position.lng();

        // Update the structured address with new coordinates
        if (props.formData.structuredAddress) {
          const updatedAddress = {
            ...props.formData.structuredAddress,
            latitude: newLat,
            longitude: newLng,
          };

          const updatedFormData = {
            ...props.formData,
            structuredAddress: updatedAddress,
          };

          emit("update:formData", updatedFormData);
        }
      }
    });

    mapInitialized.value = true;
  } catch (error) {
    console.error("Error initializing map:", error);
  } finally {
    isLoadingMap.value = false;
  }
};

// Load Google Maps API
const loadGoogleMapsAPI = async () => {
  if (typeof window === "undefined") return;

  // Wait for Google Maps API to be available
  let attempts = 0;
  const maxAttempts = 50;

  while (!window.google?.maps && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!window.google?.maps) {
    throw new Error("Google Maps API failed to load");
  }

  return window.google.maps;
};

// Handle place selection from autocomplete
const onPlaceSelected = (addressData: any) => {
  // Ensure coordinates are numbers
  const structuredAddress = {
    ...addressData,
    latitude: typeof addressData.latitude === 'number' ? addressData.latitude : parseFloat(addressData.latitude) || null,
    longitude: typeof addressData.longitude === 'number' ? addressData.longitude : parseFloat(addressData.longitude) || null,
  };

  const updatedFormData = {
    ...props.formData,
    address: addressData.formatted_address || '',
    structuredAddress: structuredAddress,
  };

  emit("update:formData", updatedFormData);

  // Initialize or update map
  if (structuredAddress.latitude && structuredAddress.longitude) {
    if (!mapInitialized.value) {
      initializeMap(structuredAddress.latitude, structuredAddress.longitude);
    } else {
      // Update existing map
      const newPosition = {
        lat: structuredAddress.latitude,
        lng: structuredAddress.longitude,
      };

      if (map && marker) {
        map.setCenter(newPosition);
        marker.setPosition(newPosition);
      }
    }
  }
};

// Handle address input change
const onInputChanged = (value: string) => {
  const updatedFormData = {
    ...props.formData,
    address: value,
  };
  emit("update:formData", updatedFormData);
};

// Validation functions
const validateAddress = () => {
  errors.value = {};

  if (!props.formData.address || props.formData.address.trim() === '') {
    errors.value.address = 'Address is required';
  }

  if (!props.formData.structuredAddress) {
    errors.value.structuredAddress = 'Please select a valid address from the suggestions';
    return false;
  }

  const addr = props.formData.structuredAddress;

  if (!addr.formatted_address || addr.formatted_address.trim() === '') {
    errors.value.formatted_address = 'Formatted address is required';
  }

  if (!addr.city || addr.city.trim() === '') {
    errors.value.city = 'City is required';
  }

  if (!addr.state_province || addr.state_province.trim() === '') {
    errors.value.state_province = 'Province is required';
  }

  if (!addr.country || addr.country.trim() === '') {
    errors.value.country = 'Country is required';
  }

  if (!addr.latitude || !addr.longitude) {
    errors.value.coordinates = 'Valid coordinates are required';
  }

  return Object.keys(errors.value).length === 0;
};

const validateEditForm = () => {
  const tempErrors: Record<string, string> = {};

  if (!editableAddress.value.address_line_1?.trim()) {
    tempErrors.address_line_1 = 'Street address is required';
  }

  if (!editableAddress.value.city?.trim()) {
    tempErrors.city = 'City is required';
  }

  if (!editableAddress.value.state_province?.trim()) {
    tempErrors.state_province = 'Province is required';
  }

  if (!editableAddress.value.postal_code?.trim()) {
    tempErrors.postal_code = 'Postal code is required';
  }

  if (!editableAddress.value.country?.trim()) {
    tempErrors.country = 'Country is required';
  }

  if (!editableAddress.value.latitude || !editableAddress.value.longitude) {
    tempErrors.coordinates = 'Valid coordinates are required';
  }

  return { isValid: Object.keys(tempErrors).length === 0, errors: tempErrors };
};

// Update address data from edit form
const updateAddressData = () => {
  const validation = validateEditForm();

  if (!validation.isValid) {
    // Show validation errors temporarily
    const tempErrors = { ...validation.errors };
    errors.value = tempErrors;

    // Clear errors after 3 seconds
    setTimeout(() => {
      errors.value = {};
    }, 3000);

    return;
  }

  const updatedAddress = {
    ...props.formData.structuredAddress,
    ...editableAddress.value,
    // Ensure coordinates are numbers
    latitude: typeof editableAddress.value.latitude === 'number' ? editableAddress.value.latitude : parseFloat(editableAddress.value.latitude as string) || null,
    longitude: typeof editableAddress.value.longitude === 'number' ? editableAddress.value.longitude : parseFloat(editableAddress.value.longitude as string) || null,
  } as StructuredAddress;

  // Update formatted address
  const addressParts = [
    updatedAddress.address_line_1,
    updatedAddress.address_line_2,
    updatedAddress.city,
    updatedAddress.state_province,
    updatedAddress.postal_code,
    updatedAddress.country,
  ].filter(Boolean);

  updatedAddress.formatted_address = addressParts.join(", ");

  const updatedFormData = {
    ...props.formData,
    address: updatedAddress.formatted_address,
    structuredAddress: updatedAddress,
  };

  emit("update:formData", updatedFormData);

  // Update map if coordinates changed
  if (updatedAddress.latitude && updatedAddress.longitude && map && marker) {
    const newPosition = {
      lat: updatedAddress.latitude,
      lng: updatedAddress.longitude,
    };
    map.setCenter(newPosition);
    marker.setPosition(newPosition);
  }

  // Clear errors and close form
  errors.value = {};
  showEditForm.value = false;
};

// Cancel editing
const cancelEdit = () => {
  if (props.formData.structuredAddress) {
    editableAddress.value = { ...props.formData.structuredAddress };
  }
  showEditForm.value = false;
};

// Initialize map if structured address already exists
onMounted(() => {
  if (props.formData.structuredAddress?.latitude && props.formData.structuredAddress?.longitude) {
    initializeMap(
      props.formData.structuredAddress.latitude,
      props.formData.structuredAddress.longitude
    );
  }
});

// Expose validation function for parent components
defineExpose({
  validateAddress,
  isValid: isAddressValid
});
</script>