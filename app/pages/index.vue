<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, today, type DateValue } from '@internationalized/date'
import { BUDGET_RANGES, SA_PROVINCES, useEventSearch } from '~/composables/useEventSearch'

definePageMeta({
  layout: "default",
})

const client = useSupabaseClient()
const { setSearch } = useEventSearch()

interface IVenue {
  id: bigint
  event_types: string[]
  photos: string[]
  venue_name: string
  max_capacity: number | null
  city: string | null
}

const { data } = useAsyncData<IVenue[] | null>(
  "venues-old",
  async () => {
    const { data, error } = await client
      .from("venues")
      .select("id, event_types, photos, venue_name, max_capacity, city")
      .limit(24)
      .order("id", { ascending: false })

    if (error) {
      console.error("Error fetching venues:", error)
      return null
    }

    return data || null
  },
  { default: () => [] }
)

const venues = computed(() => data.value || [])

// ── Date picker ────────────────────────────────────────────────────────────────
const df = new DateFormatter('en-ZA', { dateStyle: 'medium' })
const todayDate = today(getLocalTimeZone())
const eventDate = ref<DateValue | undefined>(undefined)
const eventDateFormatted = computed(() =>
  eventDate.value ? df.format(eventDate.value.toDate(getLocalTimeZone())) : ''
)

// ── Search form ────────────────────────────────────────────────────────────────
const search = reactive({
  guestCount: null as number | null,
  budgetRange: '' as string,
  province: '' as string,
})

const budgetOptions = BUDGET_RANGES.map(b => ({ label: b.label, value: b.value }))
const provinceOptions = SA_PROVINCES.map(p => ({ label: p, value: p }))

// ── Combined computed filter ───────────────────────────────────────────────────
const filteredVenues = computed(() => {
  let list = venues.value

  if (search.guestCount) {
    list = list.filter(v => !v.max_capacity || v.max_capacity >= search.guestCount!)
  }

  if (search.province) {
    list = list.filter(v =>
      v.city?.toLowerCase().includes(search.province.toLowerCase())
    )
  }

  return list
})

const hasActiveFilters = computed(() =>
  !!eventDate.value || !!search.guestCount || !!search.budgetRange || !!search.province
)

function applySearch() {
  setSearch({
    weddingDate: eventDate.value ? eventDate.value.toDate(getLocalTimeZone()).toISOString().split('T')[0] : null,
    guestCount: search.guestCount,
    budgetRange: search.budgetRange || null,
    city: search.province || null,
  })
}

function clearSearch() {
  eventDate.value = undefined
  search.guestCount = null
  search.budgetRange = ''
  search.province = ''
}
</script>

<template>
  <div>
    <!-- ─── HERO ──────────────────────────────────────────────────────── -->
    <div class="relative w-full h-[460px]">
      <div class="absolute inset-0 w-full h-full">
        <img
          src="/images/find/hero.png"
          alt="Venue Search Hero"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-blue-900/30 to-transparent" />
        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
      </div>

      <div class="relative z-10 flex flex-col items-center justify-center h-full px-4 text-white pb-16">
        <h1 class="text-5xl font-bold text-center mt-12 mb-4 text-shadow">
          plan less, party more
        </h1>
        <p class="text-2xl font-medium text-center text-shadow">
Find and Compare the Western Capes best venues        </p>
      </div>
    </div>

    <!-- ─── FILTER BAR ───────────────────────────────────────────────── -->
    <div class="relative z-20 -mt-14 px-4 mb-6">
      <div class="container mx-auto max-w-5xl">
        <div class="bg-white rounded-2xl shadow-2xl border border-stone-100 p-4">
          <div class="flex flex-wrap lg:flex-nowrap gap-3 items-end">

            <!-- Date -->
            <div class="flex-1 min-w-[160px]">
              <label class="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Date</label>
              <UPopover :content="{ align: 'start' }">
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-calendar"
                  class="w-full justify-start"
                  :label="eventDateFormatted || 'Pick a date'"
                />
                <template #content>
                  <UCalendar
                    :model-value="(eventDate as any)"
                    class="p-2"
                    :min-value="todayDate"
                    @update:model-value="(v: any) => { eventDate = v }"
                  />
                </template>
              </UPopover>
            </div>

            <!-- Guests -->
            <div class="flex-1 min-w-[120px]">
              <label class="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Guests</label>
              <UInputNumber
                v-model="search.guestCount"
                :min="1"
                :max="5000"
                placeholder="e.g. 100"
                class="w-full"
              />
            </div>

            <!-- Budget -->
            <div class="flex-1 min-w-[150px]">
              <label class="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Budget</label>
              <USelect
                v-model="search.budgetRange"
                :items="budgetOptions"
                placeholder="Any budget"
                class="w-full"
              />
            </div>

            <!-- Province -->
            <div class="flex-1 min-w-[150px]">
              <label class="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Province</label>
              <USelect
                v-model="search.province"
                :items="provinceOptions"
                placeholder="All provinces"
                class="w-full"
              />
            </div>

            <!-- Actions -->
            <div class="flex gap-2 flex-shrink-0">
              <UButton
                v-if="hasActiveFilters"
                color="neutral"
                variant="outline"
                label="Clear"
                @click="clearSearch"
              />
              <UButton
                color="neutral"
                icon="i-lucide-search"
                label="Search"
                class="bg-[#032334] hover:bg-[#043a52] text-white border-[#032334]"
                @click="applySearch"
              />
            </div>
          </div>

          <!-- Active filter summary -->
          <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100">
            <UBadge
              v-if="eventDate"
              color="primary"
              variant="soft"
              :label="eventDateFormatted"
            >
              <template #trailing>
                <UButton size="xs" color="primary" variant="ghost" icon="i-lucide-x" class="-mr-1" @click="eventDate = undefined" />
              </template>
            </UBadge>
            <UBadge
              v-if="search.guestCount"
              color="primary"
              variant="soft"
              :label="`${search.guestCount} guests`"
            >
              <template #trailing>
                <UButton size="xs" color="primary" variant="ghost" icon="i-lucide-x" class="-mr-1" @click="search.guestCount = null" />
              </template>
            </UBadge>
            <UBadge
              v-if="search.budgetRange"
              color="primary"
              variant="soft"
              :label="budgetOptions.find(b => b.value === search.budgetRange)?.label ?? search.budgetRange"
            >
              <template #trailing>
                <UButton size="xs" color="primary" variant="ghost" icon="i-lucide-x" class="-mr-1" @click="search.budgetRange = ''" />
              </template>
            </UBadge>
            <UBadge
              v-if="search.province"
              color="primary"
              variant="soft"
              :label="search.province"
            >
              <template #trailing>
                <UButton size="xs" color="primary" variant="ghost" icon="i-lucide-x" class="-mr-1" @click="search.province = ''" />
              </template>
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── VENUE GRID ───────────────────────────────────────────────── -->
    <div class="container mx-auto px-6 lg:px-10 xl:px-20 pb-16 max-w-[1920px]">

      <!-- Results count -->
      <p v-if="hasActiveFilters" class="text-sm text-gray-500 mb-5">
        Showing {{ filteredVenues.length }} venue{{ filteredVenues.length === 1 ? '' : 's' }}
      </p>

      <div
        v-if="filteredVenues.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8"
      >
        <NuxtLink
          v-for="venue in filteredVenues"
          :key="venue.id.toString()"
          :to="`/venues/${venue.id.toString()}`"
          class="block group"
        >
          <div class="relative w-full aspect-square mb-3 rounded-xl overflow-hidden">
            <NuxtImg
              :src="venue.photos && venue.photos.length > 0 ? venue.photos[0] : '/default.jpg'"
              alt="Venue Image"
              class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div>
            <h3 class="font-semibold text-[15px] text-gray-900 mb-1 truncate">
              {{ venue.venue_name }}
            </h3>
            <div class="flex justify-between items-start text-gray-600 text-[15px] gap-2">
              <span v-if="venue.max_capacity" class="flex-shrink-0">Up to {{ venue.max_capacity }} pax</span>
              <span v-else class="flex-shrink-0 opacity-0">-</span>
              <span v-if="venue.city" class="text-right truncate">{{ venue.city }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else-if="hasActiveFilters" class="text-center py-16">
        <p class="text-gray-500 text-lg mb-4">No venues match your filters.</p>
        <button
          class="text-[#c0397a] hover:underline text-sm cursor-pointer"
          @click="clearSearch"
        >
          Clear all filters
        </button>
      </div>

      <div v-else class="text-center py-12 text-gray-400">
        Loading venues...
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0.5;
  cursor: pointer;
}
</style>
