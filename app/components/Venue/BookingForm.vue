<script setup lang="ts">
import { useEventSearch } from '~/composables/useEventSearch'

const props = defineProps({
  venue: {
    type: Object,
    required: true,
  },
})

const { state: searchState, estimateCostRange, formatEstimate } = useEventSearch()

const preferredViewingDate = ref('')

const costEstimate = computed(() => {
  if (!searchState.guestCount || !props.venue.price) return null
  const range = estimateCostRange(props.venue.price, searchState.guestCount)
  if (!range) return null
  return formatEstimate(range.low, range.high)
})

async function goToRequest() {
  await navigateTo(`/venues/${props.venue.id}/request`)
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
    <!-- Cost Estimate Header -->
    <div class="mb-4">
      <div v-if="costEstimate && searchState.guestCount">
        <div class="text-xl font-semibold text-gray-900">
          {{ costEstimate }}
        </div>
        <div class="text-sm text-gray-500">
          estimated for {{ searchState.guestCount }} guests
        </div>
      </div>
      <div v-else>
        <div class="text-sm text-gray-500">
          Enter your guest count to see an estimate
        </div>
      </div>
    </div>

    <!-- Preferred Viewing Date -->
    <div class="mb-4 rounded-lg border border-gray-300">
      <div class="p-3">
        <div class="text-xs font-semibold uppercase text-gray-500 mb-1">Preferred viewing date</div>
        <input
          v-model="preferredViewingDate"
          type="date"
          class="w-full border-0 p-0 text-sm text-gray-700 focus:ring-0 focus:outline-none bg-transparent"
        />
      </div>
    </div>

    <!-- Book a Viewing Button -->
    <UButton
      block
      size="xl"
      color="primary"
      label="Book a Viewing"
      class="mb-4 cursor-pointer"
      @click="goToRequest"
    />

    <p class="text-center text-sm text-gray-500">
      Free viewing — no payment required
    </p>
  </div>
</template>
