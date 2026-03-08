<script setup lang="ts">
import { BUDGET_RANGES, useEventSearch } from '~/composables/useEventSearch'

definePageMeta({
  layout: "default",
})

const client = useSupabaseClient()
const { state: searchState, estimateCostRange, formatEstimate } = useEventSearch()

interface IVenue {
  id: bigint
  event_types: string[]
  photos: string[]
  venue_name: string
  max_capacity: number | null
  min_capacity: number | null
  city: string | null
  price: number | null
  selected_province: string | null
  accommodation_available: boolean | null
  style_tags: string[] | null
  catering_price_per_head: number | null
  venue_category: string | null
  venue_type: string | null
}

const { data } = useAsyncData<IVenue[] | null>(
  "venues",
  async () => {
    const { data, error } = await client
      .from("venues")
      .select("id, event_types, photos, venue_name, max_capacity, min_capacity, city, price, selected_province, accommodation_available, style_tags, catering_price_per_head, venue_category, venue_type")
      .limit(24)
      .order("id", { ascending: false })

    if (error) {
      console.error("Error fetching venues:", error)
      return null
    }

    return data || null
  },
  {
    default: () => [],
  }
)

const venues = computed(() => data.value || [])

// Filter venues based on qualification criteria
const filteredVenues = computed(() => {
  let result = venues.value

  const city = searchState.city
  if (city) {
    result = result.filter(venue => {
      const venueCity = venue.city || ''
      const venueProvince = getProvinceLabel(venue.selected_province)
      return (
        venueCity.toLowerCase().includes(city.toLowerCase()) ||
        venueProvince.toLowerCase().includes(city.toLowerCase())
      )
    })
  }

  const guestCount = searchState.guestCount
  if (guestCount) {
    result = result.filter(venue =>
      !venue.max_capacity || venue.max_capacity >= guestCount
    )
  }

  if (searchState.accommodationRequired) {
    result = result.filter(venue => venue.accommodation_available === true)
  }

  if (searchState.stylePreferences.length > 0) {
    result = result.filter(venue =>
      venue.style_tags?.some(tag => searchState.stylePreferences.includes(tag))
    )
  }

  if (searchState.budgetRange) {
    const range = BUDGET_RANGES.find(b => b.value === searchState.budgetRange)
    if (range) {
      result = result.filter((venue) => {
        const est = estimateCostRange(venue.price ?? 0, searchState.guestCount, venue.catering_price_per_head)
        if (!est) return true
        return est.low <= range.max && est.high >= range.min
      })
    }
  }

  return result
})

function getProvinceLabel(province: string | null | undefined): string {
  if (!province) return ''
  try {
    const parsed = typeof province === 'string' ? JSON.parse(province) : province
    return parsed?.label || parsed?.value || String(province)
  }
  catch {
    return String(province)
  }
}

function getEstimate(venue: IVenue): string | null {
  if (!searchState.guestCount || !venue.price) return null
  const range = estimateCostRange(venue.price, searchState.guestCount, venue.catering_price_per_head)
  if (!range) return null
  return formatEstimate(range.low, range.high)
}

const showQualificationForm = ref(!searchState.hasSearched)

function handleSearch() {
  showQualificationForm.value = false
}

function resetSearch() {
  showQualificationForm.value = true
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="relative w-full min-h-[500px]">
      <!-- Background Image -->
      <div class="absolute inset-0 w-full h-full">
        <img
          src="/images/find/hero.png"
          alt="Venue Search Hero"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-blue-900/30 to-transparent" />
        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 flex flex-col items-center justify-center min-h-[500px] px-4 pt-8 pb-16 text-white">
        <h1 class="text-5xl font-bold text-center mt-8 mb-3 text-shadow">
          Find your perfect wedding venue
        </h1>
        <p class="text-xl font-medium text-center mb-8 text-shadow">
          Browse, compare, and book a free viewing — no payment required
        </p>

        <!-- Qualification Form -->
        <VenueLeadQualificationForm
          v-if="showQualificationForm"
          @search="handleSearch"
        />

        <!-- Active search summary (after searching) -->
        <div
          v-else
          class="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl px-6 py-4 flex flex-wrap items-center gap-3"
        >
          <div class="flex flex-wrap gap-2 flex-1 text-sm text-gray-700">
            <span v-if="searchState.weddingDate" class="bg-purple-50 text-purple-700 rounded-full px-3 py-1 font-medium">
              {{ new Date(searchState.weddingDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) }}
            </span>
            <span v-if="searchState.guestCount" class="bg-purple-50 text-purple-700 rounded-full px-3 py-1 font-medium">
              {{ searchState.guestCount }} guests
            </span>
            <span v-if="searchState.budgetRange" class="bg-purple-50 text-purple-700 rounded-full px-3 py-1 font-medium">
              {{ searchState.budgetRange.replace(/_/g, ' ').replace('under', 'Under').replace('plus', '+').replace('k', 'k ').trim() }}
            </span>
            <span v-if="searchState.city" class="bg-purple-50 text-purple-700 rounded-full px-3 py-1 font-medium">
              {{ searchState.city }}
            </span>
          </div>
          <button
            class="text-sm text-purple-600 hover:text-purple-800 font-medium underline cursor-pointer whitespace-nowrap"
            @click="resetSearch"
          >
            Edit search
          </button>
        </div>
      </div>
    </div>

    <!-- Venues Grid -->
    <div class="container mx-auto px-6 lg:px-10 xl:px-20 mt-8 max-w-[1920px]">
      <!-- Results summary -->
      <div v-if="searchState.hasSearched" class="mb-6 flex items-center justify-between">
        <p class="text-gray-600">
          <span class="font-semibold text-gray-900">{{ filteredVenues.length }}</span>
          {{ filteredVenues.length === 1 ? 'venue' : 'venues' }} match your criteria
          <span v-if="searchState.city"> in <strong>{{ searchState.city }}</strong></span>
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
              :src="venue.photos && venue.photos.length > 0 ? venue.photos[0] : '/default.jpg'"
              alt="Venue Image"
              class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          <!-- Venue Info -->
          <div>
            <h3 class="font-semibold text-[15px] text-gray-900 mb-1 truncate">
              {{ venue.venue_name }}
            </h3>
            <div class="flex justify-between items-start text-gray-600 text-[13px] gap-2">
              <span v-if="venue.max_capacity" class="flex-shrink-0">
                Up to {{ venue.max_capacity }} pax
              </span>
              <span v-else class="flex-shrink-0 opacity-0">-</span>
              <span v-if="venue.city" class="text-right truncate">
                {{ venue.city }}
              </span>
            </div>
            <!-- Estimated cost when guest count known -->
            <div
              v-if="searchState.guestCount && getEstimate(venue)"
              class="mt-1 text-[12px] text-purple-700 font-medium"
            >
              {{ getEstimate(venue) }} for {{ searchState.guestCount }} guests
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else-if="searchState.hasSearched" class="text-center py-12">
        <p class="text-gray-600 text-lg mb-4">
          No venues found matching your criteria.
        </p>
        <button class="text-purple-600 hover:underline cursor-pointer" @click="resetSearch">
          Adjust your search
        </button>
      </div>

      <div v-else-if="!searchState.hasSearched && venues.length > 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">Fill in your event details above to find matching venues.</p>
      </div>

      <div v-else class="text-center py-12">
        Loading venues...
      </div>
    </div>
  </div>
</template>

<style>
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
