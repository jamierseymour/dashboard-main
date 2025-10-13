<template>
  <div class="border-t border-gray-200 pt-8 mt-8">
    <h2 class="text-2xl font-semibold mb-2">Where you'll be</h2>
    <p v-if="address" class="text-gray-600 mb-6">{{ address }}</p>

    <!-- Map Container -->
    <div class="w-full rounded-2xl overflow-hidden border border-gray-200">
      <div
        ref="mapContainer"
        class="w-full h-96 bg-gray-100 flex items-center justify-center"
        :class="{ 'animate-pulse': isLoading }"
      >
        <div v-if="!mapInitialized" class="text-gray-500 text-center">
          <Icon name="lucide:map-pin" size="48" class="mx-auto mb-2" />
          <p>Loading map...</p>
        </div>
      </div>
    </div>

    <!-- Location Details -->
    <div v-if="showDetails" class="mt-6 space-y-4">
      <div v-if="city || province" class="text-gray-700">
        <h3 class="font-semibold mb-2">Location</h3>
        <p>{{ [city, province].filter(Boolean).join(", ") }}</p>
      </div>

      <div v-if="description" class="text-gray-700">
        <h3 class="font-semibold mb-2">About this area</h3>
        <p class="leading-relaxed">{{ description }}</p>
      </div>

      <!-- Nearby Features -->
      <div v-if="nearbyFeatures && nearbyFeatures.length > 0">
        <h3 class="font-semibold mb-3">Nearby</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(feature, index) in nearbyFeatures"
            :key="index"
            class="flex items-start gap-3"
          >
            <Icon
              :name="feature.icon"
              size="20"
              class="text-gray-600 mt-0.5 flex-shrink-0"
            />
            <div class="text-sm">
              <div class="font-medium">{{ feature.name }}</div>
              <div class="text-gray-600">{{ feature.distance }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Exact location note -->
      <div
        class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700"
      >
        <Icon
          name="lucide:info"
          size="20"
          class="text-gray-500 flex-shrink-0 mt-0.5"
        />
        <p>
          The exact location will be provided after your booking is confirmed.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NearbyFeature {
  name: string;
  distance: string;
  icon: string;
}

const props = defineProps({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  province: {
    type: String,
    default: "",
  },
  venueName: {
    type: String,
    default: "Venue",
  },
  description: {
    type: String,
    default: "",
  },
  showDetails: {
    type: Boolean,
    default: true,
  },
  nearbyFeatures: {
    type: Array as () => NearbyFeature[],
    default: () => [],
  },
  zoom: {
    type: Number,
    default: 14,
  },
});

const mapContainer = ref<HTMLElement | null>(null);
const mapInitialized = ref(false);
const isLoading = ref(true);
let map: any = null;
let marker: any = null;

// Initialize Google Maps
const initializeMap = async () => {
  console.log('🗺️ VenueMap - Initializing map...');
  console.log('🗺️ Props:', { lat: props.latitude, lng: props.longitude, address: props.address });

  if (!mapContainer.value) {
    console.log('❌ Map container not found');
    return;
  }

  if (!window.google?.maps) {
    console.log('❌ Google Maps API not loaded');
    return;
  }

  try {
    isLoading.value = true;
    console.log('🔄 Loading map libraries...');

    // Import required libraries
    const { Map } = (await window.google.maps.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = (await window.google.maps.importLibrary(
      "marker"
    )) as google.maps.MarkerLibrary;

    // Create map
    const mapOptions: google.maps.MapOptions = {
      center: { lat: props.latitude, lng: props.longitude },
      zoom: props.zoom,
      mapId: "venue-map", // Required for Advanced Markers
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      gestureHandling: "cooperative",
    };

    map = new Map(mapContainer.value, mapOptions);

    // Create marker
    const markerContent = document.createElement("div");
    markerContent.className =
      "flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full shadow-lg border-4 border-white cursor-pointer hover:scale-110 transition-transform";
    markerContent.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `;

    marker = new AdvancedMarkerElement({
      map: map,
      position: { lat: props.latitude, lng: props.longitude },
      content: markerContent,
      title: props.venueName,
    });

    // Add click listener to marker
    markerContent.addEventListener("click", () => {
      // Open Google Maps in new tab with directions
      const url = `https://www.google.com/maps/dir/?api=1&destination=${props.latitude},${props.longitude}`;
      window.open(url, "_blank");
    });

    mapInitialized.value = true;
    console.log('✅ Map initialized successfully');
  } catch (error) {
    console.error("❌ Error initializing map:", error);
  } finally {
    isLoading.value = false;
  }
};

// Wait for Google Maps to load
const waitForGoogleMaps = async () => {
  console.log('⏳ Waiting for Google Maps API...');
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds max wait

  while (!window.google?.maps && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (window.google?.maps) {
    console.log('✅ Google Maps API loaded after', attempts * 100, 'ms');
    await initializeMap();
  } else {
    console.error("❌ Google Maps API failed to load after 5 seconds");
    isLoading.value = false;
  }
};

// Watch for changes in coordinates
watch(
  () => [props.latitude, props.longitude],
  () => {
    if (map && marker) {
      const newPosition = { lat: props.latitude, lng: props.longitude };
      map.setCenter(newPosition);
      marker.position = newPosition;
    }
  }
);

// Initialize on mount
onMounted(() => {
  console.log('🚀 VenueMap component mounted');
  waitForGoogleMaps();
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (marker) {
    marker.map = null;
  }
  if (map) {
    map = null;
  }
});
</script>
