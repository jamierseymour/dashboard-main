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
const showLeadModal = ref(false)
const pendingAction = ref<'book-viewing' | 'unlock-estimate'>('book-viewing')

const costEstimate = computed(() => {
  if (!searchState.guestCount || !props.venue.price) return null
  const range = estimateCostRange(props.venue.price, searchState.guestCount)
  if (!range) return null
  return formatEstimate(range.low, range.high)
})

function openModal(action: 'book-viewing' | 'unlock-estimate') {
  pendingAction.value = action
  showLeadModal.value = true
}

function handleLeadSubmitted() {
  if (pendingAction.value === 'book-viewing') {
    navigateTo(`/venues/${props.venue.id}/request`)
  }
  // For unlock-estimate the cost estimate reactively appears once guestCount is set
}

function handleBookViewing() {
  if (!searchState.hasQualified) {
    openModal('book-viewing')
  }
  else {
    navigateTo(`/venues/${props.venue.id}/request`)
  }
}

function handleUnlockEstimate() {
  openModal('unlock-estimate')
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
        <div class="text-sm text-gray-500 mb-3">
          Enter your guest count to see an estimate
        </div>
        <!-- Unlock estimate CTA — shown before lead is qualified -->
        <button
          v-if="!searchState.hasQualified"
          class="w-full text-left px-4 py-3 rounded-lg border border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
          @click="handleUnlockEstimate"
        >
          <div class="flex items-center gap-2">
            <Icon name="lucide:lock" size="16" class="text-purple-600 shrink-0" />
            <span class="text-sm font-semibold text-purple-700">Unlock Full Cost Estimate</span>
          </div>
          <p class="mt-0.5 text-xs text-purple-500 pl-6">
            Share your details for a personalised quote
          </p>
        </button>
      </div>
    </div>

    <!-- Preferred Viewing Date -->
    <div class="mb-4">
      <div class="text-xs font-semibold uppercase text-gray-500 mb-1">Preferred viewing date</div>
      <FormDateInput v-model="preferredViewingDate" placeholder="Select a date" />
    </div>

    <!-- Book a Viewing Button -->
    <UButton
      block
      size="xl"
      color="primary"
      label="Book a Viewing"
      class="mb-4 cursor-pointer"
      @click="handleBookViewing"
    />

    <p class="text-center text-sm text-gray-500">
      Free viewing — no payment required
    </p>
  </div>

  <!-- Lead capture modal -->
  <VenueLeadModal
    v-model:open="showLeadModal"
    :action="pendingAction"
    @submitted="handleLeadSubmitted"
  />
</template>
