<template>
  <div class="relative">
    <UInput
      ref="inputRef"
      :model-value="inputValue"
      :placeholder="placeholder"
      class="w-full"
      color="primary"
      variant="outline"
      @input="onInputChange"
      @focus="onFocus"
    />

    <!-- Autocomplete dropdown -->
    <div
      v-if="predictions.length > 0 && showPredictions"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
    >
      <div
        v-for="(prediction, index) in predictions"
        :key="prediction.place_id"
        class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
        @click="selectPrediction(prediction)"
      >
        <div class="font-medium text-gray-900">
          {{
            prediction.structured_formatting?.main_text ||
            prediction.description
          }}
        </div>
        <div class="text-sm text-gray-500">
          {{ prediction.structured_formatting?.secondary_text || "" }}
        </div>
      </div>
    </div>

    <!-- Display selected place info -->
    <div
      v-if="selectedPlace && showDetails"
      class="mt-2 p-3 bg-gray-50 rounded-lg text-sm"
    >
      <p class="font-medium">{{ selectedPlace.formatted_address }}</p>
      <p class="text-gray-600">
        Lat: {{ selectedPlace.geometry?.location?.lat()?.toFixed(6) }}, Lng:
        {{ selectedPlace.geometry?.location?.lng()?.toFixed(6) }}
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
    default: () => ({
      componentRestrictions: { country: "za" },
      types: ["address"],
    }),
  },
});

const emit = defineEmits(["place-selected", "input-changed"]);

const inputRef = ref(null);
const inputValue = ref("");
const predictions = ref([]);
const showPredictions = ref(false);
const selectedPlace = ref(null);

let autocompleteService = null;
let placesService = null;

const initializeServices = async () => {
  // Wait for Google Maps to be available
  if (typeof window !== "undefined" && window.google?.maps?.places) {
    autocompleteService = new window.google.maps.places.AutocompleteService();
    placesService = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );
  }
};

const onInputChange = (event) => {
  const value = event.target.value;
  inputValue.value = value;
  emit("input-changed", value);

  if (value.length > 2) {
    searchPredictions(value);
  } else {
    predictions.value = [];
    showPredictions.value = false;
  }
};

const onFocus = () => {
  if (inputValue.value.length > 2) {
    showPredictions.value = true;
  }
};

const searchPredictions = (input) => {
  if (!autocompleteService) return;

  const request = {
    input,
    ...props.options,
  };

  autocompleteService.getPlacePredictions(request, (results, status) => {
    if (
      status === window.google.maps.places.PlacesServiceStatus.OK &&
      results
    ) {
      predictions.value = results;
      showPredictions.value = true;
    } else {
      predictions.value = [];
      showPredictions.value = false;
    }
  });
};

const selectPrediction = (prediction) => {
  if (!placesService) return;

  const request = {
    placeId: prediction.place_id,
    fields: [
      "place_id",
      "formatted_address",
      "geometry",
      "name",
      "address_components",
    ],
  };

  placesService.getDetails(request, (place, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
      inputValue.value = place.formatted_address;
      selectedPlace.value = place;
      predictions.value = [];
      showPredictions.value = false;

      emit("place-selected", place);
    }
  });
};

// Handle clicks outside to close dropdown
const handleClickOutside = (event) => {
  if (!event.target.closest(".relative")) {
    showPredictions.value = false;
  }
};

onMounted(async () => {
  await initializeServices();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Watch for Google Maps API availability
watchEffect(() => {
  if (typeof window !== "undefined" && window.google?.maps?.places) {
    initializeServices();
  }
});
</script>
