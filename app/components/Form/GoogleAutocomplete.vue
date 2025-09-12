<template>
  <div class="relative">
    <!-- Google Maps Places UI Kit Basic Autocomplete -->
    <gmp-basic-place-autocomplete
      ref="autocompleteRef"
      :placeholder="placeholder"
      :location-bias="locationBias"
      :component-restrictions="componentRestrictions"
      class="google-autocomplete-input"
      @gmp-select="onPlaceSelected"
      @gmp-input="onInputChanged"
    />

    <!-- Display selected place info -->
    <div
      v-if="selectedPlace && showDetails"
      class="mt-2 p-3 bg-gray-50 rounded-lg text-sm"
    >
      <p class="font-medium">
        {{ selectedPlace.formattedAddress || selectedPlace.displayName?.text }}
      </p>
      <p v-if="selectedPlace.location" class="text-gray-600">
        Lat: {{ selectedPlace.location.lat?.toFixed(6) }}, Lng:
        {{ selectedPlace.location.lng?.toFixed(6) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Extend Window interface to include Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        importLibrary: (library: string) => Promise<any>;
        places: {
          Place: new (options: {
            id: string;
            requestedLanguage: string;
          }) => any;
        };
      };
    };
  }
}

interface Place {
  id: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  location?: {
    lat: number;
    lng: number;
  };
  addressComponents?: Array<{
    longText: string;
    shortText: string;
    types: string[];
  }>;
  types?: string[];
}

interface Props {
  placeholder?: string;
  showDetails?: boolean;
  componentRestrictions?: {
    country?: string | string[];
  };
  locationBias?: {
    lat: number;
    lng: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Enter an address",
  showDetails: false,
  componentRestrictions: () => ({ country: "za" }),
  locationBias: () => ({ lat: -26.2041, lng: 28.0473 }), // Default to Johannesburg, South Africa
});

const emit = defineEmits<{
  "place-selected": [place: Place];
  "input-changed": [value: string];
}>();

const autocompleteRef = ref<HTMLElement | null>(null);
const selectedPlace = ref<Place | null>(null);
const isLoading = ref(false);

// Extract structured address data for Supabase
const extractAddressData = (place: Place) => {
  const addressComponents = place.addressComponents || [];

  // Helper function to find component by type
  const getComponentByType = (types: string[]) => {
    return addressComponents.find((component) =>
      types.some((type) => component.types.includes(type))
    );
  };

  // Extract address components
  const streetNumber = getComponentByType(["street_number"])?.longText || "";
  const route = getComponentByType(["route"])?.longText || "";
  const addressLine1 = `${streetNumber} ${route}`.trim();

  const addressLine2 =
    getComponentByType(["subpremise", "premise"])?.longText || "";
  const city =
    getComponentByType(["locality", "administrative_area_level_2"])?.longText ||
    "";
  const stateProvince =
    getComponentByType(["administrative_area_level_1"])?.longText || "";
  const postalCode = getComponentByType(["postal_code"])?.longText || "";
  const country = getComponentByType(["country"])?.shortText || "ZA";

  return {
    // Core address fields
    address_line_1: addressLine1,
    address_line_2: addressLine2,
    city: city,
    state_province: stateProvince,
    postal_code: postalCode,
    country: country,

    // Location coordinates
    latitude: place.location?.lat || null,
    longitude: place.location?.lng || null,

    // Google Places data
    google_place_id: place.id,
    formatted_address: place.formattedAddress || "",

    // Additional data
    address_components: addressComponents,
    place_types: place.types || [],

    // Keep original place data for reference
    original_place_data: place,
  };
};

// Initialize the Google Maps API and set up the autocomplete
const initializeAutocomplete = async () => {
  if (typeof window === "undefined") {
    return;
  }

  // Wait for Google Maps API to be available
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds max wait

  while (!window.google?.maps && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!window.google?.maps) {
    console.error("Google Maps API failed to load after 5 seconds");
    return;
  }

  try {
    // Import required libraries
    await window.google.maps.importLibrary("places");

    // Set up location bias
    if (autocompleteRef.value) {
      const autocompleteElement = autocompleteRef.value as any;
      autocompleteElement.locationBias = props.locationBias;

      // Override the blue border with mulberry
      const overrideBlueBorder = () => {
        const element = autocompleteRef.value as HTMLElement;
        if (element) {
          // Find all child elements that might have the blue border
          const allElements = element.querySelectorAll("*");
          allElements.forEach((el: HTMLElement) => {
            if (
              el.style.border &&
              el.style.border.includes("rgb(26, 115, 232)")
            ) {
              el.style.border = "2px solid #8b5a96";
            }
          });
          // Also check the element itself
          if (
            element.style.border &&
            element.style.border.includes("rgb(26, 115, 232)")
          ) {
            element.style.border = "2px solid #8b5a96";
          }
        }
      };

      // Set up observers to catch when the blue border is applied
      const observer = new MutationObserver(overrideBlueBorder);
      observer.observe(autocompleteElement, {
        attributes: true,
        attributeFilter: ["style"],
        subtree: true,
      });

      // Also run the override periodically to catch any missed changes
      setInterval(overrideBlueBorder, 100);
    }
  } catch (error) {
    console.error("Error initializing autocomplete:", error);
  }
};

const onPlaceSelected = async (event: CustomEvent) => {
  isLoading.value = true;

  try {
    // The place data is directly on the event object
    const placeData = event.place;

    if (!placeData) {
      console.error("No place data found in event:", event);
      return;
    }

    const placeId = placeData.id;

    if (!placeId) {
      console.error("No place ID found:", placeData);
      // Fallback: emit basic place info
      emit("place-selected", placeData);
      return;
    }

    // Create a Place object to get detailed information
    const place = new window.google.maps.places.Place({
      id: placeId,
      requestedLanguage: "en",
    });

    // Fetch comprehensive place details
    const { place: placeResult } = await place.fetchFields({
      fields: [
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "addressComponents",
        "types",
      ],
    });

    selectedPlace.value = placeResult;

    // Extract structured address data for Supabase
    const structuredAddress = extractAddressData(placeResult);
    emit("place-selected", structuredAddress);
  } catch (error) {
    console.error("Error fetching place details:", error);
    // Fallback: emit basic place info
    emit("place-selected", event.place);
  } finally {
    isLoading.value = false;
  }
};

const onInputChanged = (event: CustomEvent) => {
  const value = event.detail.input;
  emit("input-changed", value);
};

// Expose methods for parent components
const clearInput = () => {
  if (autocompleteRef.value) {
    const autocompleteElement = autocompleteRef.value as any;
    autocompleteElement.value = "";
  }
  selectedPlace.value = null;
};

const setInputValue = (value: string) => {
  if (autocompleteRef.value) {
    const autocompleteElement = autocompleteRef.value as any;
    autocompleteElement.value = value;
  }
};

defineExpose({
  clearInput,
  setInputValue,
});

// Initialize when component mounts
onMounted(() => {
  initializeAutocomplete();
});

// Watch for Google Maps API availability
watchEffect(() => {
  if (typeof window !== "undefined" && window.google?.maps) {
    initializeAutocomplete();
  }
});
</script>

<style>
/* Global override for Google Maps autocomplete focus */
gmp-basic-place-autocomplete:focus,
gmp-basic-place-autocomplete:focus-within,
gmp-basic-place-autocomplete[focused] {
  border-color: #8b5a96 !important;
  box-shadow: 0 0 0 3px rgba(139, 90, 150, 0.1) !important;
}

gmp-basic-place-autocomplete input:focus {
  border-color: #8b5a96 !important;
  outline: none !important;
}
</style>

<style scoped>
/* Custom styling for the gmp-basic-place-autocomplete element */
.google-autocomplete-input {
  width: 100%;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease-in-out;
  font-family: inherit;
  --gmp-focus-color: #8b5a96 !important;
}

.google-autocomplete-input:focus {
  outline: none !important;
  border-color: #8b5a96 !important;
  box-shadow: 0 0 0 3px rgba(139, 90, 150, 0.1) !important;
}

/* Target the internal input element */
.google-autocomplete-input::part(input) {
  border-color: #8b5a96 !important;
}

.google-autocomplete-input:focus-within {
  border-color: #8b5a96 !important;
  box-shadow: 0 0 0 3px rgba(139, 90, 150, 0.1) !important;
}

.google-autocomplete-input::placeholder {
  color: #9ca3af;
}

/* Style the dropdown suggestions */
:deep(.pac-container) {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  margin-top: 4px;
}

:deep(.pac-item) {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  transition: background-color 0.15s ease-in-out;
}

:deep(.pac-item:hover) {
  background-color: #f9fafb;
}

:deep(.pac-item:last-child) {
  border-bottom: none;
}

:deep(.pac-item-query) {
  font-weight: 500;
  color: #111827;
}

:deep(.pac-matched) {
  font-weight: 600;
  color: #8b5a96;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .google-autocomplete-input {
    background-color: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .google-autocomplete-input::placeholder {
    color: #6b7280;
  }

  .google-autocomplete-input:focus {
    border-color: #8b5a96 !important;
    box-shadow: 0 0 0 3px rgba(139, 90, 150, 0.1) !important;
  }

  :deep(.pac-container) {
    background-color: #1f2937;
    border-color: #374151;
  }

  :deep(.pac-item) {
    background-color: #1f2937;
    border-bottom-color: #374151;
    color: #f9fafb;
  }

  :deep(.pac-item:hover) {
    background-color: #374151;
  }

  :deep(.pac-item-query) {
    color: #f9fafb;
  }
}
</style>
