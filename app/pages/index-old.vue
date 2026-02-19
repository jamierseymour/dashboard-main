<script setup lang="ts">
import VenueFilterBar from "~/components/Venue/VenueFilterBar.vue";

// Explicitly set layout for performance
definePageMeta({
  layout: "default",
});

const client = useSupabaseClient();

// Define the IVenue interface
interface IVenue {
  id: bigint;
  event_types: string[]; // This is an array of event types
  photos: string[];
  venue_name: string;
  max_capacity: number | null;
  city: string | null;
}

// Use `useAsyncData` to fetch data with optimization
// IMPORTANT: Don't await here to prevent blocking page navigation
const { data, error } = useAsyncData<IVenue[] | null>(
  "venues",
  async () => {
    const { data, error } = await client
      .from("venues")
      .select("id, event_types, photos, venue_name, max_capacity, city")
      .limit(12) // Limit initial load to 12 venues for performance
      .order("id", { ascending: false }); // Show newest first

    if (error) {
      console.error("Error fetching venues:", error);
      return null; // Return null in case of error
    }

    return data || null; // Ensure we return `null` if data is undefined
  },
  {
    default: () => [], // Provide default value to prevent hydration mismatch
  }
);

// Create a `computed` property for safer access to `data`
const venues = computed(() => data.value || []);

// Search form data
const venueType = ref("");
const guestCount = ref("");
const eventDate = ref("");

// Active filter for venue types
const activeEventTypeFilter = ref<string | null>(null);

// Computed property for filtered venues
const filteredVenues = computed(() => {
  if (!activeEventTypeFilter.value) {
    return venues.value;
  }

  // Filter venues by the selected event type
  // Check if the venue's event_types array includes the selected filter
  return venues.value.filter(
    (venue) =>
      venue.event_types &&
      venue.event_types.some(
        (eventType) =>
          eventType.toLowerCase() === activeEventTypeFilter.value!.toLowerCase()
      )
  );
});

const filterVenues = (eventType: string | null) => {
  activeEventTypeFilter.value = eventType;
};

// Venue type options
const venueTypes = [
  { value: "", label: "Any type" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "club", label: "Club" },
  { value: "event_space", label: "Event Space" },
];

// Handle search submission (placeholder for now)
const handleSearch = () => {
  // Will implement actual search functionality later
};
</script>

<template>
  <div>
    <!-- Hero Section with Background Image -->
    <div class="relative w-full h-[500px]">
      <!-- Background Image -->
      <div class="absolute inset-0 w-full h-full">
        <img
          src="/images/find/hero.png"
          alt="Venue Search Hero"
          class="w-full h-full object-cover"
        />

        <!-- Dark Blue Overlay with Gradient -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-blue-900/30 to-transparent"
        />

        <!-- Improved White Fade Overlay - covers more of the image -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent"
        />
      </div>

      <!-- Hero Content -->
      <div
        class="relative z-10 flex flex-col items-center justify-center h-full px-4 text-white"
      >
        <h1 class="text-5xl font-bold text-center mt-12 mb-8 text-shadow">
          plan less, party more
        </h1>
        <p class="text-2xl font-medium text-center mb-12 text-shadow">
          book now, don't stress — we've got you covered
        </p>

        <!-- Search Bar - Reduced Transparency -->
        <!-- <div
          class="w-full max-w-4xl bg-[#032334]/65 backdrop-blur-sm rounded-full p-2 shadow-lg"
        >
          <form
            class="flex flex-col md:flex-row items-center"
            @submit.prevent="handleSearch"
          >
            <div class="flex-1 px-4 py-2 md:border-r border-blue-700">
              <label class="block text-sm text-blue-200 mb-1"
                >I'm looking for</label
              >
              <select
                v-model="venueType"
                class="w-full bg-transparent text-white border-none focus:outline-none text-lg"
              >
                <option
                  v-for="type in venueTypes"
                  :key="type.value"
                  :value="type.value"
                  class="bg-navy-800 text-white"
                >
                  {{ type.label }}
                </option>
              </select>
            </div>

            <div class="flex-1 px-4 py-2 md:border-r border-blue-700">
              <label class="block text-sm text-blue-200 mb-1"
                >Number of guests</label
              >
              <input
                v-model="guestCount"
                type="number"
                placeholder="How many people?"
                class="w-full bg-transparent text-white border-none focus:outline-none text-lg"
              />
            </div>

            <div class="flex-1 px-4 py-2">
              <label class="block text-sm text-blue-200 mb-1">Date</label>
              <input
                v-model="eventDate"
                type="date"
                class="w-full bg-transparent text-white border-none focus:outline-none text-lg"
              />
            </div>

            <div class="px-4 py-2">
              <button
                type="submit"
                class="bg-white hover:bg-gray-100 text-mulberry font-bold py-3 px-8 rounded-full transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div> -->

        <div class="container mx-auto p-4 max-w-[1228px]">
          <VenueFilterBar @filter-change="filterVenues" />
        </div>
      </div>
    </div>

    <!-- Venues Grid (Existing Content) -->
    <div class="container mx-auto px-6 lg:px-10 xl:px-20 mt-8 max-w-[1920px]">
      <!-- Display filtered venues count -->
      <div v-if="activeEventTypeFilter" class="mb-6">
        <p class="text-gray-600">
          Showing {{ filteredVenues.length }} venues for "{{
            activeEventTypeFilter
          }}"
        </p>
      </div>

      <div
        v-if="filteredVenues && filteredVenues.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 -mt-24 gap-x-5 gap-y-8"
      >
        <NuxtLink
          v-for="venue in filteredVenues"
          :key="venue.id.toString()"
          :to="`/venues/${venue.id.toString()}`"
          class="block group"
        >
          <!-- Image -->
          <div class="relative w-full aspect-square mb-3 rounded-xl overflow-hidden">
            <NuxtImg
              :src="
                venue.photos && venue.photos.length > 0 ? venue.photos[0] : '/default.jpg'
              "
              alt="Venue Image"
              class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          <!-- Venue Info Below Image -->
          <div>
            <!-- Venue Name - Bold -->
            <h3 class="font-semibold text-[15px] text-gray-900 mb-1 truncate">
              {{ venue.venue_name }}
            </h3>

            <!-- Capacity and City - Justified Between -->
            <div class="flex justify-between items-start text-gray-600 text-[15px] gap-2">
              <span v-if="venue.max_capacity" class="flex-shrink-0">
                Up to {{ venue.max_capacity }} pax
              </span>
              <span v-else class="flex-shrink-0 opacity-0">-</span>
              <span v-if="venue.city" class="text-right truncate">
                {{ venue.city }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
      <div v-else-if="activeEventTypeFilter" class="text-center py-12">
        <p class="text-gray-600 text-lg">
          No venues found for "{{ activeEventTypeFilter }}"
        </p>
        <button
          @click="filterVenues(null)"
          class="mt-4 text-mulberry hover:underline"
        >
          Show all venues
        </button>
      </div>
      <div v-else class="text-center">
        Loading venues or no venues available...
      </div>
    </div>
  </div>
</template>

<style>
/* Add custom styles */
.bg-navy-800 {
  background-color: #1a365d;
}

.text-mulberry {
  color: #c0397a; /* Mulberry color - adjust the hex code as needed */
}

/* Text shadow for better readability against the gradient */
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Fix date input appearance in different browsers */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
