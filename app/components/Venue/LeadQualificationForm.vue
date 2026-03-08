<script setup lang="ts">
import { useEventSearch, BUDGET_RANGES, SA_PROVINCES, STYLE_OPTIONS } from '~/composables/useEventSearch'

const emit = defineEmits<{
  search: []
}>()

const { setSearch } = useEventSearch()

const weddingDate = ref('')
const guestCount = ref<number | null>(null)
const budgetRange = ref('')
const city = ref('')
const selectedStyles = ref<string[]>([])
const accommodationRequired = ref(false)

const budgetOptions = BUDGET_RANGES.map(b => ({ label: b.label, value: b.value }))
const cityOptions = SA_PROVINCES.map(p => ({ label: p, value: p }))

function toggleStyle(style: string) {
  const idx = selectedStyles.value.indexOf(style)
  if (idx === -1) {
    selectedStyles.value.push(style)
  }
  else {
    selectedStyles.value.splice(idx, 1)
  }
}

function handleSearch() {
  setSearch({
    weddingDate: weddingDate.value || null,
    guestCount: guestCount.value,
    budgetRange: budgetRange.value || null,
    city: city.value || null,
    stylePreferences: selectedStyles.value,
    accommodationRequired: accommodationRequired.value,
  })
  emit('search')
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-5 text-center">
      Find your perfect wedding venue
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <!-- Wedding Date -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Wedding date</label>
        <FormDateInput v-model="weddingDate" placeholder="Select date" />
      </div>

      <!-- Guest Count -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Guest count</label>
        <input
          v-model.number="guestCount"
          type="number"
          min="1"
          placeholder="e.g. 120"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <!-- Budget Range -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Budget range</label>
        <USelect
          v-model="budgetRange"
          :items="budgetOptions"
          placeholder="Any budget"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- City / Province -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">City / Province</label>
        <USelect
          v-model="city"
          :items="cityOptions"
          placeholder="Any location"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- Accommodation -->
      <div class="flex items-end">
        <label class="flex items-center gap-3 cursor-pointer">
          <div class="relative">
            <input
              v-model="accommodationRequired"
              type="checkbox"
              class="sr-only"
            />
            <div
              class="w-10 h-6 rounded-full transition-colors"
              :class="accommodationRequired ? 'bg-purple-600' : 'bg-gray-300'"
            />
            <div
              class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
              :class="accommodationRequired ? 'translate-x-4' : 'translate-x-0'"
            />
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-600 uppercase">Accommodation</div>
            <div class="text-sm text-gray-700">Required on-site</div>
          </div>
        </label>
      </div>
    </div>

    <!-- Style Preferences -->
    <div class="mb-5">
      <label class="block text-xs font-semibold text-gray-600 uppercase mb-2">Style preference <span class="font-normal normal-case text-gray-400">(optional)</span></label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="style in STYLE_OPTIONS"
          :key="style"
          type="button"
          class="px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer"
          :class="selectedStyles.includes(style)
            ? 'bg-purple-600 text-white border-purple-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'"
          @click="toggleStyle(style)"
        >
          {{ style }}
        </button>
      </div>
    </div>

    <!-- Search Button -->
    <UButton
      block
      size="lg"
      color="primary"
      class="cursor-pointer"
      @click="handleSearch"
    >
      Find matching venues
    </UButton>
  </div>
</template>
