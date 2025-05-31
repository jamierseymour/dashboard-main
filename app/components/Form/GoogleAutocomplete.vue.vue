<!-- GoogleAutocomplete.vue - New PlaceAutocompleteElement Implementation -->
<template>
  <div class="relative">
    <gmp-placeautocomplete
      ref="autocompleteRef"
      :placeholder="placeholder"
      :type="options.types?.[0] || ''"
      :country="options.componentRestrictions?.country || ''"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      @gmp-placeselect="onPlaceSelect"
    >
    </gmp-placeautocomplete>

    <!-- Display selected place info -->
    <div
      v-if="selectedPlace && showDetails"
      class="mt-2 p-3 bg-gray-50 rounded-lg text-sm"
    >
      <p class="font-medium">{{ selectedPlace.formattedAddress }}</p>
      <p class="text-gray-600">
        Lat: {{ selectedPlace.location?.lat?.toFixed(6) }}, Lng:
        {{ selectedPlace.location?.lng?.toFixed(6) }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  placeholder: {
    type: String,
    default: "Enter an address",
  },
  showDetails: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["place-selected", "input-changed"]);

const autocompleteRef = ref(null);
const selectedPlace = ref(null);

const onPlaceSelect = (event) => {
  const place = event.detail.place;

  if (place) {
    // Convert new API format to match your existing structure
    const convertedPlace = {
      // New API properties
      id: place.id,
      displayName: place.displayName,
      formattedAddress: place.formattedAddress,
      location: place.location,
      addressComponents: place.addressComponents,

      // Legacy format for backward compatibility
      place_id: place.id,
      name: place.displayName,
      formatted_address: place.formattedAddress,
      geometry: {
        location: {
          lat: () => place.location?.lat || 0,
          lng: () => place.location?.lng || 0,
        },
      },
      address_components:
        place.addressComponents?.map((component) => ({
          long_name: component.longText,
          short_name: component.shortText,
          types: component.types,
        })) || [],
    };

    selectedPlace.value = convertedPlace;
    emit("place-selected", convertedPlace);
  }
};

// Watch for input changes on the web component
onMounted(() => {
  if (autocompleteRef.value) {
    // Listen for input events to emit input-changed
    const inputElement = autocompleteRef.value.querySelector("input");
    if (inputElement) {
      inputElement.addEventListener("input", (event) => {
        emit("input-changed", event.target.value);
      });
    }
  }
});
</script>
