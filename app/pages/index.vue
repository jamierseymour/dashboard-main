<script setup lang="ts">
import VenueFilterBar from '~/components/Venue/VenueFilterBar.vue'

const client = useSupabaseClient()

// Define the IVenue interface
interface IVenue {
  id: bigint
  type: string
  photos: string[]
  minCapacity: number | null
  venue_name: string
  maxCapacity: number | null
}

// Use `useAsyncData` to fetch data, default `data` to `null` initially
const { data, error } = await useAsyncData<IVenue[] | null>(
  'venues',
  async () => {
    const { data, error } = await client.from('venues').select()

    if (error) {
      console.error('Error fetching venues:', error)
      return null // Return null in case of error
    }

    return data || null // Ensure we return `null` if data is undefined
  }
)

// Create a `computed` property for safer access to `data`
const venues = computed(() => data.value || [])

// Search form data
const venueType = ref('')
const guestCount = ref('')
const eventDate = ref('')

const filterVenues = (eventType: string | null) => {
  if (!eventType) {
    // Reset to show all venues
    // If you're using a computed property for filtered venues:
    // filteredVenues.value = venues.value;
    console.log('Showing all venues')
  } else {
    // Filter venues by event type
    // If you're using a computed property:
    // filteredVenues.value = venues.value.filter(venue => venue.type === eventType);
    console.log('Filtering venues by event type:', eventType)
  }
}

// Venue type options
const venueTypes = [
  { value: '', label: 'Any type' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar' },
  { value: 'club', label: 'Club' },
  { value: 'event_space', label: 'Event Space' }
]

// Handle search submission (placeholder for now)
const handleSearch = () => {
  console.log('Search params:', {
    type: venueType.value,
    guests: guestCount.value,
    date: eventDate.value
  })
  // Will implement actual search functionality later
}

console.log('Venues:', venues.value)
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
        >

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
        <h1 class="text-5xl font-bold text-center mb-8 text-shadow">
          plan less, party more
        </h1>
        <p class="text-2xl font-medium text-center mb-12 text-shadow">
          book now, don't stress - we've got you covered 🎉
        </p>

        <!-- Search Bar - Reduced Transparency -->
        <div
          class="w-full max-w-4xl bg-[#032334]/65 backdrop-blur-sm rounded-full p-2 shadow-lg"
        >
          <form
            class="flex flex-col md:flex-row items-center"
            @submit.prevent="handleSearch"
          >
            <!-- I'm looking for -->
            <div class="flex-1 px-4 py-2 md:border-r border-blue-700">
              <label class="block text-sm text-blue-200 mb-1">I'm looking for</label>
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

            <!-- Number of guests -->
            <div class="flex-1 px-4 py-2 md:border-r border-blue-700">
              <label class="block text-sm text-blue-200 mb-1">Number of guests</label>
              <input
                v-model="guestCount"
                type="number"
                placeholder="How many people?"
                class="w-full bg-transparent text-white border-none focus:outline-none text-lg"
              >
            </div>

            <!-- Date -->
            <div class="flex-1 px-4 py-2">
              <label class="block text-sm text-blue-200 mb-1">Date</label>
              <input
                v-model="eventDate"
                type="date"
                class="w-full bg-transparent text-white border-none focus:outline-none text-lg"
              >
            </div>

            <!-- Search Button -->
            <div class="px-4 py-2">
              <button
                type="submit"
                class="bg-white hover:bg-gray-100 text-mulberry font-bold py-3 px-8 rounded-full transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div class="container mx-auto p-4 max-w-[1228px]">
          <VenueFilterBar @filter-change="filterVenues" />
        </div>
      </div>
    </div>

    <!-- Venues Grid (Existing Content) -->
    <div class="container mx-auto p-4 max-w-[1228px] mt-8">
      <div
        v-if="venues && venues.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 -mt-24 gap-8"
      >
        <div
          v-for="venue in venues"
          :key="venue.id.toString()"
          class="bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]"
        >
          <NuxtLink :to="`/venues/${venue.id.toString()}`" class="block">
            <div class="relative w-full h-48">
              <!-- Image -->
              <NuxtImg
                :src="
                  venue.photos.length > 0 ? venue.photos[0] : '/default.jpg'
                "
                alt="Venue Image"
                class="w-full h-48 object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
              />

              <!-- Light Overlay -->
              <div class="absolute inset-0 flex items-center justify-center">
                <span
                  class="text-dark-900 text-lg font-bold text-center bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg transition-all duration-300 hover:bg-white/70"
                >
                  {{ venue.venue_name }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
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
